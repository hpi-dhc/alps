import logging
import math
import operator
import inspect
from distutils.util import strtobool
from functools import reduce
import jointly
import pandas as pd
import numpy as np
from django.db import transaction, connection
from django.db.models import Q
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import exceptions, generics, views
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions
from rest_framework.response import Response

from . import serializers
from . import models # Dataset, Subject, Session, Signal, Source, AnalysisSample,
from .constants import signal_types
from .tasks import parse_raw_files, start_analysis, filter_signal
from .parsers import MultiFileParser, JSONURLParser
from .permissions import IsOwner, IsSessionOwner, IsDatasetOwner
from .constants import process_status
from .registries import FILTER_METHOD_REGISTRY

LOGGER = logging.getLogger(__name__)


class SourceList(generics.ListAPIView):
    queryset = models.Source.objects
    serializer_class = serializers.SourceSerializer


class SubjectListCreate(generics.ListCreateAPIView):
    serializer_class = serializers.SubjectListSerializer

    def get_queryset(self):
        return models.Subject.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SubjectDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.Subject.objects
    serializer_class = serializers.SubjectSerializer
    permission_classes = (DjangoModelPermissions, IsOwner)


class SessionListCreate(generics.ListCreateAPIView):
    serializer_class = serializers.SessionListCreateSerializer
    permission_classes = (IsAuthenticated, IsOwner)
    parser_classes = (JSONURLParser,)

    def get_queryset(self):
        if hasattr(self.kwargs, 'subject'):
            subject = get_object_or_404(models.Subject, pk=self.kwargs['subject'])
            self.check_object_permissions(self.request, subject)
            queryset = subject.sessions
        else:
            queryset = models.Session.objects.filter(user=self.request.user)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SessionDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.Session.objects
    serializer_class = serializers.SessionDetailSerializer
    permission_classes = (DjangoModelPermissions, IsOwner)


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
    queryset = models.Dataset.objects
    serializer_class = serializers.DatasetSerializer
    permission_classes = (DjangoModelPermissions, IsOwner)


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
            raise exceptions.MethodNotAllowed(
                'Dataset has no files associated.'
            )

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
            raise exceptions.MethodNotAllowed(
                None,
                detail="This dataset already contains files."
            )

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
    queryset = models.Signal.objects
    serializer_class = serializers.SignalSerializer
    permission_classes = (IsAuthenticated, IsOwner)


class SampleList(generics.ListAPIView):
    permission_classes = (IsAuthenticated, IsOwner)

    def list(self, request, *args, **kwargs):
        signal = get_object_or_404(models.Signal, pk=self.kwargs['signal'])
        self.check_object_permissions(self.request, signal)

        normalize = bool(strtobool(request.query_params.get('normalize', 'false')))
        max_samples = int(request.query_params.get('max_samples', 2000))
        if math.isnan(max_samples):
            raise exceptions.ValidationError('max_samples must be a number')

        stretch_factor = float(request.query_params.get('stretch_factor', 1))
        timeshift = float(request.query_params.get('timeshift', 0))
        reference_time = start = self.get_ts_from_query_params('reference_time')
        should_adjust_timestamps = stretch_factor != 1 or timeshift != 0
        if should_adjust_timestamps and not reference_time:
            raise exceptions.ValidationError(
                'reference_time must be given, if timeshift or stretch_factor are set'
            )

        start = self.get_ts_from_query_params('start')
        end = self.get_ts_from_query_params('end')
        if should_adjust_timestamps:
            if start:
                start = (start - reference_time) / stretch_factor + reference_time - pd.Timedelta(timeshift, 's')
            if end:
                end = (end - reference_time) / stretch_factor + reference_time - pd.Timedelta(timeshift, 's')
        if start is None:
            start = pd.Timestamp.min.tz_localize('UTC')
        if end is None:
            end = pd.Timestamp.max.tz_localize('UTC')

        LOGGER.debug('SampleList %s: %s - %s', signal.name, start, end)
        df = signal.samples_dataframe(start, end)

        if df.empty:
            return Response({
                'downsampled': False,
                'window': -1,
                'data': []
            })

        if normalize and signal.type is not signal_types.TAGS:
            df[df.columns[0]] = df[df.columns[0]] / np.max(np.abs([signal.y_min, signal.y_max]))

        if should_adjust_timestamps:
            df = jointly.Synchronizer._stretch_signals(df, stretch_factor, reference_time)
            df = df.shift(1, freq=pd.Timedelta(timeshift, 's'))

        window = -1
        if signal.type is not signal_types.TAGS and len(df) > max_samples:
            LOGGER.debug(
                'SampleList %s resampling from %s to %s',
                signal.name,
                len(df),
                max_samples
            )
            min_index = df.index[0]
            max_index = df.index[df.size - 1]
            length = max_index - min_index
            freq = math.ceil((length.value / 1e3) / (max_samples - 1))
            offset = f'{freq}U'
            window = freq / 1e6
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

        LOGGER.debug(
            'SampleList %s prepare dataframe for response',
            signal.name
        )
        df.dropna(inplace=True) # after resampling we might have created rows with null values, which are not JSON compliant
        df.reset_index(inplace=True)

        if window > 0:
            rename_map = dict(zip([df.columns[0]], ['x']))
        else:
            rename_map = dict(zip(df.columns, ['x', 'y']))

        df.rename(
            columns=rename_map,
            inplace=True
        )

        # convert datetimeindex to unix timestamps
        df['x'] = df['x'].astype('int') / 1e6
        df['x'] = df['x'].round(3)

        LOGGER.debug('SampleList %s creating response', signal.name)
        return Response({
            'downsampled': window > 0,
            'window': window,
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
    serializer_class = serializers.AnalysisLabelSerializer
    permission_classes = (IsAuthenticated, IsOwner)

    def get_queryset(self):
        return models.AnalysisLabel.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AnalysisLabelDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.AnalysisLabel.objects
    serializer_class = serializers.AnalysisLabelSerializer
    permission_classes = (IsAuthenticated, IsOwner)


class AnalysisSampleCreate(generics.CreateAPIView):
    queryset = models.AnalysisSample.objects
    serializer_class = serializers.AnalysisSampleSerializer
    parser_classes = (JSONURLParser,)
    permission_classes = (IsAuthenticated, IsSessionOwner)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AnalysisSampleDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.AnalysisSample.objects
    serializer_class = serializers.AnalysisSampleSerializer
    permission_classes = (IsAuthenticated, IsOwner)


class AnalysisDetail(generics.RetrieveUpdateAPIView):
    serializer_class = serializers.AnalysisSerializer
    permission_classes = (IsAuthenticated, IsOwner)

    def get_queryset(self):
        return models.Analysis.objects.filter(user=self.request.user)


class AnalysisExport(views.APIView):
    http_method_names = ['get']

    def get(self, request):
        session_ids = request.query_params.getlist('session')
        label_ids = request.query_params.getlist('label')

        query = inspect.cleandoc(f'''
            SELECT subject.identifier as "Subject", session.title as "Session",
                dataset.title as "Dataset", signal.name as "Signal",
                label.name as "Label", method.name as "Method",
                analysis.result ->> 'Variable' as "Variable",
                analysis.result ->> 'Value' as "Value",
                analysis.result ->> 'Unit' as "Unit"
            FROM (
                SELECT user_id, label_id, signal_id, method_id,
                    jsonb_array_elements(result -> 'table' -> 'data') as result
                FROM datasets_analysis
                WHERE user_id = %(user)s and label_id = ANY(%(labels)s::uuid[])
            ) as analysis
            LEFT JOIN datasets_analysislabel as label ON analysis.label_id = label.id
            LEFT JOIN datasets_processingmethod as method ON analysis.method_id = method.id
            LEFT JOIN datasets_signal as signal ON signal.id = analysis.signal_id
            LEFT JOIN datasets_dataset as dataset ON dataset.id = signal.dataset_id
            LEFT JOIN datasets_session as session ON session.id = dataset.session_id
            LEFT JOIN datasets_subject as subject ON subject.id = session.subject_id
            WHERE session_id = ANY(%(sessions)s::uuid[])
        ''')

        response = HttpResponse(content_type='application/csv')
        response['Content-Dipostition'] = 'attachment; filename=analysis_data.csv'

        analysis_data = pd.read_sql_query(
            query, connection,
            params={
                'user': request.user.id,
                'sessions': session_ids,
                'labels': label_ids
            }
        )
        analysis_data.to_csv(response, index=False)

        return response


class AnalysisListCreate(generics.ListCreateAPIView):
    serializer_class = serializers.AnalysisSerializer
    permission_classes = (IsAuthenticated, IsOwner)

    def get_serializer(self, *args, **kwargs):
        if 'data' in kwargs:
            data = kwargs['data']
            if isinstance(data, list):
                kwargs['many'] = True

        return super().get_serializer(*args, **kwargs)

    def get_queryset(self):
        queryset = models.Analysis.objects.filter(user=self.request.user)

        session = self.request.query_params.get('session')
        if session is not None:
            queryset = queryset.filter(signal__dataset__session=session)
            queryset = queryset.distinct()

        signal = self.request.query_params.get('signal')
        if signal is not None:
            queryset = queryset.filter(signal=signal)

        return queryset

    @transaction.atomic
    def perform_create(self, serializer):
        analyses = serializer.save(
            user=self.request.user,
            created_at=pd.Timestamp.now('UTC')
        )
        if not isinstance(analyses, list):
            analyses = [analyses]

        # delete previous analysis results for
        # same signal, method and label combinations without snapshot relation
        created_ids = [a.id for a in analyses]
        dangling_results = reduce(
            operator.or_,
            [
                Q(signal__dataset__session=a.signal.dataset.session.id) \
                & Q(label=a.label)
                for a in analyses
            ]
        )
        models.Analysis.objects \
            .exclude(id__in=created_ids) \
            .filter(dangling_results, snapshot=None) \
            .delete()

        def start_analysis_tasks():
            for each in created_ids:
                start_analysis.delay(each)

        transaction.on_commit(start_analysis_tasks)


class AnalysisSnapshotListCreate(generics.ListCreateAPIView):
    serializer_class = serializers.AnalysisSnapshotSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        queryset = models.AnalysisSnapshot.objects.filter(user=self.request.user)

        session = self.request.query_params.get('session')
        if session is not None:
            queryset = queryset.filter(analyses__signal__dataset__session=session)
            queryset = queryset.distinct()

        return queryset


class ProcessingMethodList(generics.ListAPIView):
    queryset = models.ProcessingMethod.objects
    serializer_class = serializers.ProcessingMethodSerializer
    permission_classes = (IsAuthenticated,)


class FilterSignal(views.APIView):
    http_method_names = ['post']
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = serializers.FilteredSignalSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        filtered_signal = serializer.save()

        transaction.on_commit(lambda: filter_signal.delay(filtered_signal.id))

        serializer_signal = serializers.SignalSerializer(filtered_signal)

        return Response(serializer.data)


class Synchronization(views.APIView):
    http_method_names = ['post', 'put']
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        queryset = models.Signal.objects.filter(user=self.request.user)

        signals = []
        for signal_id in request.data.get('signals', []):
            signals.append(get_object_or_404(queryset, id=signal_id))

        if len(signals) < 2:
            raise exceptions.ValidationError('At least two signals must be provided.')
        if not signals:
            raise exceptions.ValidationError('No valid signals provided.')

        sources = {}
        ref_source_name = None
        for signal in signals:
            data = signal.samples_dataframe()
            source_name = signal.id
            sources[source_name] = {
                'data': data,
                'ref_column': data.columns[0],
            }
            if str(signal.id) == request.data['reference']:
                ref_source_name = source_name

        if not ref_source_name:
            raise exceptions.ValidationError('Reference must be provided.')

        # call sync library to get params
        configuration = request.data.get('configuration', {})
        try:
            extractor = jointly.ShakeExtractor()
            extractor.window = configuration.get('window', extractor.window)
            extractor.threshold = configuration.get('threshold', extractor.threshold)
            extractor.min_length = configuration.get('min_length', extractor.min_length)
            extractor.time_buffer = configuration.get('time_buffer', extractor.time_buffer)
            synchronizer = jointly.Synchronizer(sources, ref_source_name, extractor, sampling_freq=1000)
            params, segments = synchronizer.get_sync_params()
        except KeyError:
            raise exceptions.APIException(
                'Unable to get synchronization parameters for signals.',
                500
            )

        # return shift and factor params
        return Response({
            'segments': segments,
            'params': {
                str(key): {
                    **value,
                    'timeshift': value['timeshift'].total_seconds() if value['timeshift'] else 0
                }
                for key, value
                in params.items()
            }
        })

    def put(self, request):
        queryset = models.Dataset.objects.filter(user=self.request.user)

        reference_time = request.data.get('reference_time', None)
        reference_time = pd.to_datetime(reference_time)

        if not reference_time:
            raise exceptions.ValidationError('Reference time is missing')

        params = request.data.get('params', None)
        if not params:
            raise exceptions.ValidationError('No synchronization parameters given')

        for dataset_id, values in params.items():
            dataset = get_object_or_404(queryset, id=dataset_id)
            timeshift = np.float(values.get('timeshift', 0))
            stretch_factor = np.float(values.get('stretch_factor', 1))
            dataset.correct_timestamps(
                timeshift=pd.Timedelta(timeshift, 's'),
                stretch_factor=stretch_factor,
                reference_time=reference_time
            )

        return Response()
