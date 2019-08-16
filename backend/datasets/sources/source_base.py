from abc import ABC, abstractmethod
import re
from rest_framework.exceptions import ValidationError

from datasets.models.files import RawFile

class SourceBase(ABC):

    @classmethod
    @abstractmethod
    def name(cls):
        """
        Returns the name of the source.
        This will be used to identify it in the user interface.
        Thus a precise and unique identifier is recommended.
        """
        pass

    @classmethod
    @abstractmethod
    def fileOptions(cls):
        """
        Returns a list of dicts for each possible file.

        [
            {
                'label': <string>,
                'description': <string>,
                'pattern': <string>,
                'required': <boolean>,
                'timestamp': <boolean>
            },
            ...
        ]

        The pattern can either be string or string represantation of a
        regular expression and must include the file extension.
        Descriptions are optional.
        """
        pass

    # @classmethod
    # def configuration_variables(cls):
    #     """
    #     Returns a dictionary with configuration variables, their type, label,
    #     default and a short help text.

    #     Type can be string, number or boolean.
    #     """
    #     return {
    #         'timezone': {
    #             'type': 'string',
    #             'label': "Timezone",
    #             'helptext': "Timezone to interpret timestamps of device",
    #             'default': 'UTC'
    #         }
    #     }

    @abstractmethod
    def parse(self):
        """
        Returns a dict with meta information and parsed signal data.
        Parsed data has to be passed as Series with tz-aware DateTimeIndex.
        Each result must include either a raw_file_id or the parsed data.
        If no signal type is given, it will be set to signal_type.OTHER.

        Source file objects can be accessed via self.raw_files.

        Result format:
        {
            'signal_name': {
                'type': "NNI",
                'raw_file_id': "4079f31e-5daf-472c-86d4-a2a30142b843",
                'series': <pandas.Series>,
                'frequency': 51.2,
                'unit': "Milliseconds"
            },
            ...
        }
        """
        pass

    def __init__(self, raw_file_ids):
        self.raw_files = RawFile.objects.filter(id__in=raw_file_ids)
        # self.configuration = self.raw_files[0].dataset.configuration

    @classmethod
    def validate_files(cls, files):
        missing_files = []
        for options in cls.fileOptions():
            found = False
            pattern = re.compile(options['pattern'])
            for file in files:
                if pattern.match(file['name']):
                    found = True
                    break
            if options['required'] and not found:
                missing_files.append(options['label'])
        if missing_files:
            raise ValidationError("Missing files {}".format(missing_files))
