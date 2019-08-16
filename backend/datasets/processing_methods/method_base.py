from abc import ABC, abstractmethod
from django.apps import apps

class AnalysisMethodBase(ABC):

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
    def domain(cls):
        """
        Returns one of the predefined domain types.
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

    def __init__(self, analysis_id):
        analysis_model = apps.get_model(app_label='datasets', model_name='Analysis')
        analysis_sample_model = apps.get_model(app_label='datasets', model_name='AnalysisSample')
        analysis = analysis_model.objects.get(id=analysis_id)
        self.signal = analysis.signal
        self.analysis_samples = analysis_sample_model.objects.filter(
            session=self.signal.dataset.session.id,
            label=analysis.label.id
        )
        self.configuration = analysis.configuration
