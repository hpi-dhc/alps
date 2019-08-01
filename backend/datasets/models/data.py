import logging
import pandas as pd
from django.db import models, connections
from django.db.models import Q

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
    STATUS_CHOICES = [
        (process_status.QUEUED, 'Queued'),
        (process_status.PROCESSING, 'Processing'),
        (process_status.PROCESSED, 'Processed'),
        (process_status.ERROR, 'Error')
    ]

    title = models.CharField(
        max_length=128,
        default="Untitled"
    )
    # configuration = postgres_fields.JSONField()
    status = models.CharField(
        max_length=2,
        choices=STATUS_CHOICES,
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


class Signal(OwnedModel, UUIDModel):
    TYPE_CHOICES = [
        (signal_types.ECG, 'ECG'),
        (signal_types.PPG, 'PPG'),
        (signal_types.RR_INTERVAL, 'RR Interval'),
        (signal_types.NN_INTERVAL, 'NN Interval'),
        (signal_types.TAGS, 'Tags'),
        (signal_types.OTHER, 'Other signal')
    ]

    name = models.CharField(max_length=64)
    type = models.CharField(
        max_length=3,
        choices=TYPE_CHOICES,
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
    frequency = models.FloatField(blank=True, null=True)
    unit = models.CharField(max_length=32, blank=True, null=True)
    first_timestamp = models.DateTimeField()
    last_timestamp = models.DateTimeField()
    y_min = models.FloatField(blank=True, null=True)
    y_max = models.FloatField(blank=True, null=True)

    def samples_dataframe(self, start=None, end=None):
        if start is None:
            start = pd.Timestamp(1970, tz='UTC')
        if end is None:
            end = pd.Timestamp.now('UTC')

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
