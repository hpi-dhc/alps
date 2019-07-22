import os
import logging
import pandas as pd
from django.db import models
from django.conf import settings

from datasets.models.base import UUIDModel, OwnedModel
from datasets.utils import raw_file_path, signal_file_path

LOGGER = logging.getLogger(__name__)

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
        LOGGER.debug('SignalChunkFile of %s (%s) Reading data', self.signal.name, self.id)
        df = pd.read_parquet(self.path.path, engine='fastparquet')
        if self.first_timestamp < start or self.last_timestamp > end:
            LOGGER.debug('SignalChunkFile of %s (%s) Truncating data', self.signal.name, self.id)
            df = df.truncate(start, end)
        return df

    def save_to_disk(self, data):
        sub_path = signal_file_path(self, None)
        path = os.path.join(settings.MEDIA_ROOT, sub_path)
        self.path = sub_path

        folder = path[:path.rfind('/')]
        if not os.path.exists(folder):
            os.makedirs(folder)

        if isinstance(data, pd.Series):
            data = data.to_frame()

        data.to_parquet(
            path,
            index=True,
            engine='fastparquet',
            compression='SNAPPY',
        )

    class Meta:
        ordering = ('first_timestamp',)
