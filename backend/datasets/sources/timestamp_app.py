import pandas as pd

from datasets.constants import signal_types
from datasets.sources.source_base import SourceBase

class TimestampAppSource(SourceBase):

    @classmethod
    def name(cls):
        return "Timestamp App"

    @classmethod
    def fileOptions(cls):
        return [
            {
                'label': 'CSV File',
                'pattern': '.+\.csv',
                'required': True,
                'multiple': False,
                'timestamp': False
            }
        ]

    def parse(self):
        raw_file = self.raw_files[0]
        parse_datetime = lambda x: pd.to_datetime(x, format='%Y/%m/%d(%a) %H:%M:%S')
        data = pd.read_csv(
            raw_file.path,
            header=None,
            names=[None, 'time', 'tag'],
            usecols=['time', 'tag'],
            index_col=0,
            parse_dates=True,
            date_parser=parse_datetime
        )
        data.sort_index(inplace=True)
        data = data.tz_localize('Europe/Berlin', copy=False)

        result = {
            column: {
                'raw_file_id': raw_file.id,
                'series': data[column],
                'type': signal_types.TAGS
            }
            for column
            in data.columns
        }

        return result
