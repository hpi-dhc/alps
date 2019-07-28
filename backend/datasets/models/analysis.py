import logging
from django.db import models

from datasets.models.base import UUIDModel, OwnedModel

class AnalysisLabel(OwnedModel, UUIDModel):
    name = models.CharField(max_length=128)


class AnalysisSample(OwnedModel, UUIDModel):
    start = models.DateTimeField()
    end = models.DateTimeField()
    session = models.ForeignKey(
        to='datasets.Session',
        on_delete=models.CASCADE,
        related_name='analysis_samples'
    )
    label = models.ForeignKey(
        to='datasets.AnalysisLabel',
        on_delete=models.CASCADE,
        related_name='analysis_samples'
    )
