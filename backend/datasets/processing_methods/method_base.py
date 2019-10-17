from abc import ABC, abstractmethod
from django.apps import apps
from datasets.constants import method_types

class MethodBase(ABC):

    @classmethod
    @abstractmethod
    def name(cls):
        """
        Returns the name of the source.
        This will be used to identify it in the user interface.
        Thus a precise and unique identifier is recommended.
        """

    @classmethod
    @abstractmethod
    def type(cls):
        """
        Returns one of the predefined method types.
        """

    @classmethod
    def options(cls):
        """
        Returns a dictionary with configuration variables, their type, title,
        unit, default and type specific properties.

        Type can be string, number, range or boolean.
        """
        return {}

    @classmethod
    def default_configuration(cls):
        return {
            key: value['default']
            for key, value
            in cls.options().items()
        }

    @abstractmethod
    def process(self):
        """
        Returns a dictionary with the results of the analysis.
        """


class AnalysisMethodBase(MethodBase):

    @classmethod
    def type(cls):
        return method_types.ANALYSIS

    @abstractmethod
    def process(self):
        """
        Returns a dictionary with the results of the analysis.
        """

    def __init__(self, analysis_id):
        analysis_model = apps.get_model(app_label='datasets', model_name='Analysis')
        analysis_sample_model = apps.get_model(app_label='datasets', model_name='AnalysisSample')
        analysis = analysis_model.objects.get(id=analysis_id)
        self.signal = analysis.signal
        self.analysis_samples = analysis_sample_model.objects.filter(
            session=self.signal.dataset.session.id,
            label=analysis.label.id
        )
        self.configuration = analysis.process.configuration


class FilterMethodBase(MethodBase):

    @classmethod
    def type(cls):
        return method_types.FILTER

    @abstractmethod
    def process(self):
        """
        Returns a dictionary with pandas dataframe and comments about
        the filtering, e.g. number of removed or corrected samples
        """

    def __init__(self, signal_id):
        signal_model = apps.get_model(app_label='datasets', model_name='Signal')
        self.signal = signal_model.objects.get(id=signal_id)
        self.samples = self.signal.raw_signal.samples_dataframe()
        self.configuration = self.signal.process.configuration
