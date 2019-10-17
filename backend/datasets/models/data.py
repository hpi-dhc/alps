import logging
import pandas as pd
from django.apps import apps
from django.db import models, connections
from django.db.models import Q, F
from django.db.models.expressions import DurationValue

from datasets.models.base import UUIDModel, OwnedModel
from datasets.constants import signal_types, process_status

LOGGER = logging.getLogger(__name__)


class Subject(OwnedModel, UUIDModel):
    identifier = models.CharField(max_length=32)


class Session(OwnedModel, UUIDModel):
    title = models.CharField(max_length=128)
    date = models.DateField()
    subject = models.ForeignKey(
        'datasets.Subject',
        on_delete=models.CASCADE,
        related_name='sessions',
    )

    class Meta:
        ordering = ('date', 'created_at')


class Dataset(OwnedModel, UUIDModel):
    title = models.CharField(
        max_length=128,
        default="Untitled"
    )
    # configuration = postgres_fields.JSONField()
    status = models.CharField(
        max_length=2,
        choices=process_status.CHOICES,
        default=process_status.QUEUED
    )
    session = models.ForeignKey(
        'datasets.Session',
        on_delete=models.CASCADE,
        related_name='datasets',
    )
    source = models.ForeignKey(
        'datasets.Source',
        on_delete=models.PROTECT,
        related_name='+',
        blank=True,
        null=True
    )

    def correct_timestamps(self, timeshift=0, stretch_factor=1, reference_time=None):
        for signal in self.signals.all():
            if reference_time is None:
                reference_time = signal.first_timestamp
            signal.correct_timestamps(timeshift, stretch_factor, reference_time)


class Signal(OwnedModel, UUIDModel):
    name = models.CharField(max_length=64)
    type = models.CharField(
        max_length=3,
        choices=signal_types.CHOICES,
        default=signal_types.OTHER
    )
    dataset = models.ForeignKey(
        'datasets.Dataset',
        on_delete=models.CASCADE,
        related_name='signals',
    )
    raw_file = models.ForeignKey(
        'datasets.RawFile',
        on_delete=models.SET_NULL,
        related_name='signals',
        blank=True,
        null=True
    )
    raw_signal = models.OneToOneField(
        'datasets.Signal',
        on_delete=models.CASCADE,
        related_name='filtered_signal',
        blank=True,
        null=True
    )
    process = models.OneToOneField(
        'datasets.Process',
        on_delete=models.PROTECT,
        related_name='+',
        blank=True,
        null=True
    )
    frequency = models.FloatField(blank=True, null=True)
    unit = models.CharField(max_length=32, blank=True, null=True)
    first_timestamp = models.DateTimeField(blank=True, null=True)
    last_timestamp = models.DateTimeField(blank=True, null=True)
    y_min = models.FloatField(blank=True, null=True)
    y_max = models.FloatField(blank=True, null=True)

    def has_samples(self):
        return self.signal_chunk_files.count() > 0 or self.samples.count() > 0

    def save_to_files(self, series, chunk_length=3600):
        if self.has_samples():
            raise RuntimeError('Cannot save new series for non-empty signal.')

        SignalChunkFile = apps.get_model('datasets', 'SignalChunkFile')
        lower_bound = series.index.min()
        lower_bound = lower_bound - pd.Timedelta(
            microseconds=lower_bound.microsecond
        )
        upper_bound = lower_bound + pd.Timedelta(seconds=chunk_length)

        while lower_bound < series.index.max():
            chunk = series[(series.index >= lower_bound) & (series.index < upper_bound)]
            if not chunk.empty:
                signal_file = SignalChunkFile(
                    signal=self,
                    first_timestamp=chunk.index.min(),
                    last_timestamp=chunk.index.max(),
                    user_id=self.user_id,
                )
                signal_file.save_to_disk(chunk)
                signal_file.save()

            lower_bound = upper_bound
            upper_bound = lower_bound + pd.Timedelta(seconds=chunk_length)


    def save_to_table(self, series):
        if self.has_samples():
            raise RuntimeError('Cannot save new series for non-empty signal.')

        if self.type == signal_types.TAGS:
            sample_model = apps.get_model('datasets', 'Tag')
        else:
            sample_model = apps.get_model('datasets', 'Sample')

        samples = [
            sample_model(
                timestamp=index,
                value=value,
                signal=self
            )
            for index, value
            in series.items()
        ]
        sample_model.objects.bulk_create(samples)

    def correct_timestamps(self, timeshift=pd.Timedelta(0, 's'), stretch_factor=1, reference_time=None):
        if reference_time is None:
            reference_time = self.first_timestamp
        if self.signal_chunk_files.count() > 0:
            for file in self.signal_chunk_files.all():
                file.correct_timestamps(timeshift, stretch_factor, reference_time)
            ordered_files = self.signal_chunk_files.all().order_by('first_timestamp')
            self.first_timestamp = ordered_files.first().first_timestamp
            self.last_timestamp = ordered_files.last().last_timestamp
        else:
            samples = self.samples
            if self.tags.count() > 0:
                samples = self.tags
            samples.all().update(
                timestamp=(F('timestamp') - reference_time) * stretch_factor + reference_time + DurationValue(timeshift)
            )
            ordered_samples = samples.all().order_by('timestamp')
            self.first_timestamp = ordered_samples.first().timestamp
            self.last_timestamp = ordered_samples.last().timestamp
        self.save()

    def samples_dataframe(self, start=None, end=None):
        if start is None:
            start = pd.Timestamp.min.tz_localize('UTC')
        if end is None:
            end = pd.Timestamp.max.tz_localize('UTC')

        if self.signal_chunk_files.count() > 0:
            LOGGER.debug(
                'Signal %s with %d chunk files',
                self.name, self.signal_chunk_files.count()
            )
            filtered_files = self.signal_chunk_files \
                .exclude(Q(last_timestamp__lt=start) | Q(first_timestamp__gt=end))
            LOGGER.debug(
                'Signal %s number of matching chunk files: %d}',
                self.name, len(filtered_files)
            )
            chunks = [f.get_samples(start, end) for f in filtered_files]
            if chunks:
                return pd.concat(chunks)
            return pd.DataFrame()

        value_model = self.samples
        if self.tags.count() > 0:
            value_model = self.tags

        samples = value_model.values_list('timestamp', 'value') \
            .filter(timestamp__gte=start, timestamp__lte=end)
        sql, params = samples.query.sql_with_params()
        return pd.read_sql_query(
            sql, connections[samples.db],
            params=params,
            index_col='timestamp',
            parse_dates=['timestamp']
        )

    def __str__(self):
        return self.name


class Tag(UUIDModel):
    timestamp = models.DateTimeField()
    value = models.TextField()
    signal = models.ForeignKey(
        'datasets.Signal',
        on_delete=models.CASCADE,
        related_name='tags'
    )

    class Meta:
        ordering = ('signal', 'timestamp')


class Sample(models.Model):
    timestamp = models.DateTimeField()
    value = models.FloatField()
    signal = models.ForeignKey(
        'datasets.Signal',
        on_delete=models.CASCADE,
        related_name='samples'
    )

    class Meta:
        unique_together = (('signal', 'timestamp'),)
        ordering = ('signal', 'timestamp')
