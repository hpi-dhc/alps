import re
import pandas as pd
import numpy as np
from datetime import datetime

from datasets.constants import signal_types
from datasets.utils import create_df
from datasets.sources.source_base import SourceBase

class CSVPandas(SourceBase):

    @classmethod
    def name(cls):
        return "CSV Pandas"

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
        data = pd.read_csv(raw_file.path, index_col=0, parse_dates=True)

        result = {
            column: {
                'raw_file_id': raw_file.id,
                'series': data[column]
            }
            for column
            in data.columns
        }

        return result
