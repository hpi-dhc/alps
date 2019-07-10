import os
import pandas as pd
from django.db import models

from datasets.models.base import UUIDModel, OwnedModel
from datasets.utils import raw_file_path, signal_file_path


class RawFile(OwnedModel, UUIDModel):
    name = models.CharField(max_length=128)
    path = models.FileField(upload_to=raw_file_path)
    timestamp = models.DateTimeField(
        blank=True,
        null=True
    )
    dataset = models.ForeignKey(
        'datasets.Dataset',
        on_delete=models.CASCADE,
        related_name='raw_files'
    )


class SignalChunkFile(OwnedModel, UUIDModel):
    path = models.FileField(upload_to=signal_file_path)
    first_timestamp = models.DateTimeField()
    last_timestamp = models.DateTimeField()
    signal = models.ForeignKey(
        'datasets.Signal',
        on_delete=models.CASCADE,
        related_name='signal_chunk_files',
    )

    def get_samples(self, start, end):
        df = pd.read_csv(self.path, names=['value'], index_col=0, parse_dates=True)
        if self.first_timestamp < start or self.last_timestamp > end:
            return df.loc[(df.index >= start) & (df.index <= end)]
        return df

    class Meta:
        ordering = ('first_timestamp',)
