import importlib
import pkgutil

class SourceRegistry(object):

    def __init__(self):
        self._load_plugins()

    def _load_plugins(self):
        import datasets.sources
        namespace_iter = pkgutil.iter_modules(
            datasets.sources.__path__,
            datasets.sources.__name__ + "."
        )

        for finder, name, ispkg in namespace_iter:
            importlib.import_module(name)

        subclasses = datasets.sources.source_base.SourceBase.__subclasses__()
        self.installed_plugins = {
            self._get_classname(cls):cls
            for cls in subclasses
        }

    def _get_classname(self, cls):
        return ".".join([cls.__module__, cls.__name__])

    def get_plugin(self, classname):
        return self.installed_plugins[classname]


source_registry = SourceRegistry()
