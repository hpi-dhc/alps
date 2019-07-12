import pandas as pd
import math
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import exceptions, generics, parsers, status, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from . import serializers
from .models.data import Dataset, Subject, Session, Signal
from .models.source import Source
from .tasks import parse_raw_files
from .parsers import MultiFileParser, JSONURLParser
from .permissions import IsOwner, IsSessionOwner, IsDatasetOwner
from .constants import process_status

import logging
logger = logging.getLogger(__name__)


class SourceList(generics.ListAPIView):
    queryset = Source.objects.all()
    serializer_class = serializers.SourceSerializer


class SubjectListCreate(generics.ListCreateAPIView):
    serializer_class = serializers.SubjectListSerializer

    def get_queryset(self):
        return Subject.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SubjectDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subject.objects.all()
    serializer_class = serializers.SubjectSerializer
    permission_classes = (IsAuthenticated, IsOwner)


class SessionListCreate(generics.ListCreateAPIView):
    serializer_class = serializers.SessionListCreateSerializer
    permission_classes = (IsAuthenticated, IsOwner)
    parser_classes = (JSONURLParser,)

    def get_queryset(self):
        subject = get_object_or_404(Subject, pk=self.kwargs['subject'])
        self.check_object_permissions(self.request, subject)
        queryset = subject.sessions
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SessionDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Session.objects.all()
    serializer_class = serializers.SessionDetailSerializer
    permission_classes = (IsAuthenticated, IsOwner)


class DatasetListCreate(generics.ListCreateAPIView):
    permission_classes = (IsAuthenticated, IsSessionOwner)
    parser_classes = (JSONURLParser,)

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return serializers.DatasetReadSerializer
        else:
            return serializers.DatasetSerializer

    def get_queryset(self):
        session = get_object_or_404(Session, pk=self.kwargs['session'])
        self.check_object_permissions(self.request, session)
        queryset = session.datasets
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DatasetDetail(generics.RetrieveDestroyAPIView):
    queryset = Dataset.objects.all()
    serializer_class = serializers.DatasetSerializer
    permission_classes = (IsAuthenticated, IsOwner)


class DatasetReparse(views.APIView):
    permission_classes = (IsAuthenticated, IsDatasetOwner)

    def post(self, request, *args, **kwargs):
        dataset = get_object_or_404(Dataset, pk=kwargs['dataset'])
        self.check_object_permissions(request, dataset)

        hasSource = bool(dataset.source)
        if not hasSource:
            raise exceptions.MethodNotAllowed('Dataset has no Source set.')

        hasFiles = bool(dataset.raw_files.count())
        if not hasFiles:
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
        dataset = Dataset.objects.get(pk=self.kwargs['dataset'])
        hasSource = bool(dataset.source)

        # Check, if there are already files associated with the dataset
        if dataset.raw_files.count():
            raise exceptions.MethodNotAllowed(None, detail="This dataset already contains files.")

        # Validate files
        if hasSource:
            dataset.source.validate_files(self.request.data)

        with transaction.atomic():
            raw_files = serializer.save(user=self.request.user)
            if hasSource:
                file_ids = [file.id for file in raw_files]
                transaction.on_commit(
                    lambda: parse_raw_files.delay(file_ids, dataset.id)
                )
            else:
                dataset.status = process_status.PROCESSED
                dataset.save()


class SignalDetail(generics.RetrieveAPIView):
    queryset = Signal.objects.all()
    serializer_class = serializers.SignalSerializer
    permission_classes = (IsAuthenticated, IsOwner)


class SampleList(generics.ListAPIView):
    permission_classes = (IsAuthenticated, IsOwner)

    def list(self, request, *args, **kwargs):
        signal = get_object_or_404(Signal, pk=self.kwargs['signal'])
        self.check_object_permissions(self.request, signal)

        max_samples = int(request.query_params.get('max_samples', 1000))
        start = self.get_ts_from_query_params('start', pd.Timestamp.min.tz_localize('UTC'))
        end = self.get_ts_from_query_params('end', pd.Timestamp.max.tz_localize('UTC'))

        df = signal.samples_dataframe(start, end)
        if not math.isnan(max_samples) and df.size > max_samples:
            # Simpler method of downsampling, select every nth row
            # nth = math.ceil(df.size / max_samples)
            # df = df.iloc[::nth]
            min_index = df.index[0]
            max_index = df.index[df.size - 1]
            length = max_index - min_index
            freq = math.ceil((length.value / 10**3) / (max_samples - 1)) # subtract one, since this determines the offset
            offset = '{}U'.format(freq)
            df = df.resample(offset).mean()
            df.dropna(inplace=True)


        return Response([
            {
                'x': index.timestamp() * 1000,
                'y': row[0]
            }
            for index, row
            in df.iterrows()
        ])


    def get_ts_from_query_params(self, param, fallback = None):
        ts = self.request.query_params.get(param, None)
        if ts:
            ts = pd.to_datetime(ts, utc=True)
        else:
            ts = fallback
        return ts
