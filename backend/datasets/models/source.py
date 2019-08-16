from django.db import models
from django.contrib.postgres.fields import JSONField
from .base import UUIDModel
from datasets.registries import source_registry


class Source(UUIDModel):
    name = models.CharField(max_length=64)
    classname = models.CharField(max_length=64)
    installed = models.BooleanField(default=False)
    fileOptions = JSONField()

    def parse(self, file_ids):
        source_parser = source_registry.get_plugin(self.classname)(file_ids)
        return source_parser.parse()

    def validate_files(self, files):
        source_parser = source_registry.get_plugin(self.classname)
        return source_parser.validate_files(files)

    def __str__(self):
        return self.name
