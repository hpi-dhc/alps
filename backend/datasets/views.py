import logging
import math
import pandas as pd
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import exceptions, generics, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from . import serializers
from . import models # Dataset, Subject, Session, Signal, Source, AnalysisSample,
from .constants import signal_types
from .tasks import parse_raw_files
from .parsers import MultiFileParser, JSONURLParser
from .permissions import IsOwner, IsSessionOwner, IsDatasetOwner
from .constants import process_status

LOGGER = logging.getLogger(__name__)


class SourceList(generics.ListAPIView):
    queryset = models.Source.objects.all()
    serializer_class = serializers.SourceSerializer


class SubjectListCreate(generics.ListCreateAPIView):
    serializer_class = serializers.SubjectListSerializer

    def get_queryset(self):
        return models.Subject.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SubjectDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.Subject.objects.all()
    serializer_class = serializers.SubjectSerializer
    permission_classes = (IsAuthenticated, IsOwner)


class SessionListCreate(generics.ListCreateAPIView):
    serializer_class = serializers.SessionListCreateSerializer
    permission_classes = (IsAuthenticated, IsOwner)
    parser_classes = (JSONURLParser,)

    def get_queryset(self):
        subject = get_object_or_404(models.Subject, pk=self.kwargs['subject'])
        self.check_object_permissions(self.request, subject)
        queryset = subject.sessions
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SessionDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.Session.objects.all()
    serializer_class = serializers.SessionDetailSerializer
    permission_classes = (IsAuthenticated, IsOwner)


class DatasetListCreate(generics.ListCreateAPIView):
    permission_classes = (IsAuthenticated, IsSessionOwner)
    parser_classes = (JSONURLParser,)
    serializer_class = serializers.DatasetSerializer

    def get_queryset(self):
        session = get_object_or_404(models.Session, pk=self.kwargs['session'])
        self.check_object_permissions(self.request, session)
        queryset = session.datasets
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DatasetDetail(generics.RetrieveDestroyAPIView):
    queryset = models.Dataset.objects.all()
    serializer_class = serializers.DatasetSerializer
    permission_classes = (IsAuthenticated, IsOwner)


class DatasetReparse(views.APIView):
    permission_classes = (IsAuthenticated, IsDatasetOwner)

    def post(self, request, *args, **kwargs):
        dataset = get_object_or_404(models.Dataset, pk=kwargs['dataset'])
        self.check_object_permissions(request, dataset)

        has_source = bool(dataset.source)
        if not has_source:
            raise exceptions.MethodNotAllowed('Dataset has no Source set.')

        has_files = bool(dataset.raw_files.count())
        if not has_files:
            raise exceptions.MethodNotAllowed('Dataset has no files associated.')

        for signal in dataset.signals.all():
            signal.delete()

        dataset.status = process_status.QUEUED
        dataset.save()

        file_ids = list(dataset.raw_files.values_list('id', flat=True).all())
        parse_raw_files.delay(file_ids, dataset.id)

        serializer = serializers.DatasetSerializer(dataset)
        return Response(serializer.data)


class RawFileCreate(generics.CreateAPIView):
    serializer_class = serializers.RawFileSerializer
    permission_classes = (IsAuthenticated, IsDatasetOwner, IsOwner)
    parser_classes = (MultiFileParser,)

    def get_serializer(self, *args, **kwargs):
        if 'data' in kwargs:
            data = kwargs['data']
            if isinstance(data, list):
                kwargs['many'] = True

        return super().get_serializer(*args, **kwargs)

    def perform_create(self, serializer):
        dataset = models.Dataset.objects.get(pk=self.kwargs['dataset'])
        has_source = bool(dataset.source)

        # Check, if there are already files associated with the dataset
        if dataset.raw_files.count():
            raise exceptions.MethodNotAllowed(None, detail="This dataset already contains files.")

        # Validate files
        if has_source:
            dataset.source.validate_files(self.request.data)

        with transaction.atomic():
            raw_files = serializer.save(user=self.request.user)
            if has_source:
                file_ids = [file.id for file in raw_files]
                transaction.on_commit(
                    lambda: parse_raw_files.delay(file_ids, dataset.id)
                )
            else:
                dataset.status = process_status.PROCESSED
                dataset.save()


class SignalDetail(generics.RetrieveAPIView):
    queryset = models.Signal.objects.all()
    serializer_class = serializers.SignalSerializer
    permission_classes = (IsAuthenticated, IsOwner)


class SampleList(generics.ListAPIView):
    permission_classes = (IsAuthenticated, IsOwner)

    def list(self, request, *args, **kwargs):
        signal = get_object_or_404(models.Signal, pk=self.kwargs['signal'])
        self.check_object_permissions(self.request, signal)

        max_samples = int(request.query_params.get('max_samples', 2000))
        if math.isnan(max_samples):
            raise exceptions.ValidationError('max_samples must be a number')

        start = self.get_ts_from_query_params('start', pd.Timestamp.min.tz_localize('UTC'))
        end = self.get_ts_from_query_params('end', pd.Timestamp.max.tz_localize('UTC'))

        LOGGER.debug('SampleList %s: %s - %s', signal.name, start, end)
        df = signal.samples_dataframe(start, end)

        resampling = None
        if signal.type is not signal_types.TAGS and len(df) > max_samples:
            resampling = 'range'
            LOGGER.debug('SampleList %s resampling from %s to %s', signal.name, len(df), max_samples)
            min_index = df.index[0]
            max_index = df.index[df.size - 1]
            length = max_index - min_index
            freq = math.ceil((length.value / 10**3) / (max_samples - 1))
            offset = f'{freq}U'
            resampler = df.resample(offset)
            resampled_min = resampler.min()
            resampled_max = resampler.max()
            resampled_mean = resampler.mean()
            df = pd.DataFrame(
                columns=['range', 'mean'],
                index=resampled_mean.index.copy(),
            )
            df['range'] = resampled_min.iloc[:, 0].combine(
                resampled_max.iloc[:, 0],
                func=lambda x, y: [x, y] if x and y else None
            ).values
            df['mean'] = resampled_mean.values

        LOGGER.debug('SampleList %s prepare dataframe for response', signal.name)
        df.dropna(inplace=True) # after resampling we might have created rows with null values, which are not JSON compliant
        df.reset_index(inplace=True)

        if resampling:
            rename_map = dict(zip([df.columns[0]], ['x']))
        else:
            rename_map = dict(zip(df.columns, ['x', 'y']))

        df.rename(
            columns=rename_map,
            inplace=True
        )
        df['x'] = df['x'].astype('int') / 1e6
        df['x'] = df['x'].round(3)

        LOGGER.debug('SampleList %s creating response', signal.name)
        return Response({
            'resampling': resampling,
            'data': df.to_dict('records')
        })


    def get_ts_from_query_params(self, param, fallback=None):
        ts = self.request.query_params.get(param, None)
        if ts:
            ts = pd.to_datetime(ts, utc=True)
        else:
            ts = fallback
        return ts

class AnalysisLabelListCreate(generics.ListCreateAPIView):
    queryset = models.AnalysisLabel.objects.all()
    serializer_class = serializers.AnalysisLabelSerializer
    permission_classes = (IsAuthenticated, IsOwner)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AnalysisLabelDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.AnalysisLabel.objects.all()
    serializer_class = serializers.AnalysisLabelSerializer
    permission_classes = (IsAuthenticated, IsOwner)


class AnalysisSampleCreate(generics.CreateAPIView):
    queryset = models.AnalysisSample.objects.all()
    serializer_class = serializers.AnalysisSampleSerializer
    parser_classes = (JSONURLParser,)
    permission_classes = (IsAuthenticated, IsSessionOwner)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AnalysisSampleDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.AnalysisSample.objects.all()
    serializer_class = serializers.AnalysisSampleSerializer
    permission_classes = (IsAuthenticated, IsOwner)
