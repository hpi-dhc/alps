from django.db import models
from django.contrib import postgres
from django.dispatch import receiver


from datasets.constants import process_status, method_types
from datasets.models import UUIDModel, OwnedModel, Analysis, Dataset, Signal
from datasets.registries import get_registry

class ProcessingMethod(UUIDModel):
    name = models.CharField(max_length=128)
    classname = models.CharField(max_length=256)
    installed = models.BooleanField(default=False)
    options = postgres.fields.JSONField()
    type = models.CharField(
        max_length=2,
        choices=method_types.CHOICES,
    )

    def get_plugin(self):
        return get_registry(self.type).get_plugin(self.classname)

class Process(OwnedModel, UUIDModel):
    task = models.UUIDField(null=True, blank=True)
    configuration = postgres.fields.JSONField()
    info = models.TextField(blank=True)
    method = models.ForeignKey(
        to='datasets.ProcessingMethod',
        on_delete=models.PROTECT,
        related_name='+'
    )
    status = models.CharField(
        max_length=2,
        choices=process_status.CHOICES,
        default=process_status.QUEUED
    )

@receiver(models.signals.post_delete, sender=Analysis)
@receiver(models.signals.post_delete, sender=Dataset)
@receiver(models.signals.post_delete, sender=Signal)
def delete_process(sender, instance, using, **kwargs):
    if hasattr(instance, 'process') and instance.process:
        instance.process.delete()
