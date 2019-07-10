from datetime import datetime
import pandas as pd
import numpy as np
import django.contrib.postgres.fields as postgres_fields
from django.db import models, connections

from datasets.models.base import UUIDModel, OwnedModel
from datasets.constants import signal_types, process_status


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
            filtered_files = self.signal_chunk_files.filter(first_timestamp__lte=end, last_timestamp__gte=start)
            chunks = [file.get_samples(start, end) for file in filtered_files]
            if not chunks:
                return pd.DataFrame()
            df = pd.concat(chunks)
            return df
        else:
            samples = self.samples.values_list('timestamp', 'value').filter(timestamp__gte=start, timestamp__lte=end)
            sql, params = samples.query.sql_with_params()
            df = pd.read_sql_query(sql, connections[samples.db], params=params, index_col='timestamp', parse_dates=['timestamp'])
            return df

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
