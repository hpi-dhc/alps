from django.db import models
from django.contrib import postgres

from datasets.models.base import UUIDModel, OwnedModel

class AnalysisSnapshot(OwnedModel, UUIDModel):
    name = models.CharField(max_length=128)

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
        on_delete=models.PROTECT,
        related_name='analysis_samples'
    )

class Analysis(OwnedModel, UUIDModel):
    result = postgres.fields.JSONField(blank=True, null=True)
    signal = models.ForeignKey(
        to='datasets.Signal',
        on_delete=models.CASCADE,
        related_name='analyses'
    )
    label = models.ForeignKey(
        to='datasets.AnalysisLabel',
        on_delete=models.PROTECT,
        related_name='+'
    )
    process = models.OneToOneField(
        to='datasets.Process',
        on_delete=models.PROTECT,
        related_name='+',
        blank=True,
        null=True
    )
    method = models.ForeignKey(
        to='datasets.ProcessingMethod',
        on_delete=models.PROTECT,
        related_name='+'
    )
    snapshot = models.ForeignKey(
        to='datasets.AnalysisSnapshot',
        on_delete=models.CASCADE,
        related_name='analyses',
        blank=True,
        null=True
    )

    def compute(self):
        plugin = self.method.get_plugin()(self.id)
        return plugin.process()
