from django.db import models
from django.contrib import postgres

from datasets.constants import process_status, method_types
from datasets.models.base import UUIDModel, OwnedModel
from datasets.registries import analysis_method_registry


class ProcessingMethod(UUIDModel):
    name = models.CharField(max_length=128)
    classname = models.CharField(max_length=256)
    installed = models.BooleanField(default=False)
    options = postgres.fields.JSONField()
    type = models.CharField(
        max_length=2,
        choices=method_types.CHOICES,
    )


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
    configuration = postgres.fields.JSONField()
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
    status = models.CharField(
        max_length=2,
        choices=process_status.CHOICES,
        default=process_status.QUEUED
    )

    def save(self, *args, **kwargs):
        default_configuration = analysis_method_registry.get_plugin(self.method.classname).default_configuration()
        self.configuration = {
            **default_configuration,
            **self.configuration
        }
        super(Analysis, self).save(*args, **kwargs)

    def compute(self):
        plugin = analysis_method_registry.get_plugin(self.method.classname)(self.id)
        return plugin.process()
