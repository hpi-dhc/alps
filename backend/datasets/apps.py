from django.apps import AppConfig
from django.db.utils import ProgrammingError
import logging

logger = logging.getLogger(__name__)

class DatasetsConfig(AppConfig):
    name = 'datasets'

    def ready(self):
        from datasets import registries
        from datasets.models import Source, ProcessingMethod
        from datasets.constants import method_types

        available_sources = []
        for classname, plugin in registries.SOURCE_REGISTRY.installed_plugins.items():
            try:
                source = Source.objects.get(classname=classname)
                source.name = plugin.name()
                source.installed = True
                source.fileOptions = plugin.fileOptions()
            except Source.DoesNotExist:
                source = Source(
                    name=plugin.name(),
                    classname=classname,
                    installed=True,
                    fileOptions=plugin.fileOptions()
                )
            except ProgrammingError:
                logger.error('Unable to populate Source table.')
                return
            source.save()
            available_sources.append(source.id)
        unavailable_sources = Source.objects.exclude(id__in=available_sources)
        for source in unavailable_sources:
            source.installed = False
            source.save()

        available_methods = []
        installed_plugins = {
            **registries.ANALYSIS_METHOD_REGISTRY.installed_plugins,
            **registries.FILTER_METHOD_REGISTRY.installed_plugins,
        }
        for classname, plugin in installed_plugins.items():
            try:
                method = ProcessingMethod.objects.get(classname=classname)
                method.name = plugin.name()
                method.installed = True
                method.options = plugin.options()
            except ProcessingMethod.DoesNotExist:
                method = ProcessingMethod(
                    name=plugin.name(),
                    classname=classname,
                    installed=True,
                    type=plugin.type(),
                    options=plugin.options()
                )
            except ProgrammingError:
                logger.error('Unable to populate ProcessingMethod table.')
                return
            method.save()
            available_methods.append(method.id)
        unavailable_methods = ProcessingMethod.objects.exclude(id__in=available_methods)
        for method in unavailable_methods:
            method.installed = False
            method.save()
