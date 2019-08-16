from abc import ABC
import importlib
import pkgutil

class Registry(ABC):
    module = None
    base_class = None

    def __init__(self):
        if not isinstance(self.module, str):
            raise ValueError('Module is not defined or not a string.')
        if not isinstance(self.base_class, str):
            raise ValueError('Base class is not defined or not a string.')
        self._load_plugins()

    def _load_plugins(self):
        imported_module = importlib.import_module(self.module)
        namespace_iter = pkgutil.iter_modules(
            imported_module.__path__,
            imported_module.__name__ + "."
        )

        for _, name, _ in namespace_iter:
            importlib.import_module(name)

        sep_index = self.base_class.rfind('.')
        base_class_module = self.base_class[:sep_index]
        base_class_name = self.base_class[sep_index + 1:]
        imported_base_class = getattr(importlib.import_module(base_class_module), base_class_name)
        subclasses = imported_base_class.__subclasses__()
        self.installed_plugins = {
            self._get_classname(cls):cls
            for cls in subclasses
        }

    def _get_classname(self, cls):
        return ".".join([cls.__module__, cls.__name__])

    def get_plugin(self, classname):
        return self.installed_plugins[classname]


class SourceRegistry(Registry):
    module = 'datasets.sources'
    base_class = 'datasets.sources.source_base.SourceBase'


class AnalysisMethodRegistry(Registry):
    module = 'datasets.processing_methods'
    base_class = 'datasets.processing_methods.method_base.AnalysisMethodBase'


source_registry = SourceRegistry()
analysis_method_registry = AnalysisMethodRegistry()
