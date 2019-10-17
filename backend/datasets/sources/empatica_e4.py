import re
import pandas as pd
import numpy as np

from datasets.constants import signal_types
from datasets.utils import is_zero_file
from datasets.sources.source_base import SourceBase

import logging
logger = logging.getLogger(__name__)

class EmpaticaE4Source(SourceBase):

    FILES = {
        'ACC.csv': ['acc_x', 'acc_y', 'acc_z'],
        'BVP.csv': ['bvp'],
        'EDA.csv': ['eda'],
        'HR.csv': ['hr'],
        'IBI.csv': None,
        'TEMP.csv': ['temp'],
        'tags.csv': None,
    }

    META = {
        'bvp': {
            'type': signal_types.PPG
        },
        'ibi': {
            'type': signal_types.NN_INTERVAL,
            'unit': 'Milliseconds'
        },
        'tags': {
            'type': signal_types.TAGS
        },
        'temp': {
            'unit': 'Celsius'
        },
        'hr': {
            'unit': 'BPM'
        },
        'eda': {
            'unit': 'Microsiemens'
        }
    }

    @classmethod
    def name(cls):
        return "Empatica E4"

    @classmethod
    def fileOptions(cls):
        return [
            {
                'label': 'ACC',
                'pattern': 'ACC.csv',
                'required': False,
                'timestamp': False
            },
            {
                'label': 'BVP',
                'pattern': 'BVP.csv',
                'required': False,
                'timestamp': False
            },
            {
                'label': 'EDA',
                'pattern': 'EDA.csv',
                'required': False,
                'timestamp': False
            },
            {
                'label': 'HR',
                'pattern': 'HR.csv',
                'required': False,
                'timestamp': False
            },
            {
                'label': 'IBI',
                'pattern': 'IBI.csv',
                'required': False,
                'timestamp': False
            },
            {
                'label': 'TEMP',
                'pattern': 'TEMP.csv',
                'required': False,
                'timestamp': False
            },
            {
                'label': 'Tags',
                'pattern': 'tags.csv',
                'required': False,
                'timestamp': False
            },
        ]

    @staticmethod
    def read_value(file):
        line = file.readline()
        return line[:line.find('.')]

    @staticmethod
    def read_default(path, names, dtype='float64'):
        series = dict.fromkeys(names)

        with open(path, 'r') as file:
            start_time = pd.to_datetime(EmpaticaE4Source.read_value(file), unit='s', utc=True)
            sampling_freq = np.int16(EmpaticaE4Source.read_value(file))
            values = np.loadtxt(file, delimiter=',', ndmin=2, dtype=dtype)

        periods = len(values)
        values = values.transpose()
        index = pd.date_range(
            start=start_time,
            periods=periods,
            freq='{}ns'.format(np.int64(1e9 / sampling_freq))
        )

        for i, name in enumerate(names):
            series[name] = pd.Series(data=values[i], index=index, name=name)

        return series

    @staticmethod
    def read_ibi(path):
        with open(path, 'r') as file:
            start_time = pd.to_datetime(EmpaticaE4Source.read_value(file), unit='s', utc=True)
            values = np.loadtxt(file, delimiter=',', dtype='float64')

        df = pd.DataFrame(data=values, columns=['index', 'ibi'])
        df['ibi'] = df['ibi'] * 1000 # convert seconds to milliseonds
        df['index'] = df['index'].apply(lambda x: start_time + pd.Timedelta(x, unit='s'))
        df.set_index('index', inplace=True)

        return {'ibi': df['ibi']}

    @staticmethod
    def read_tags(path):
        with open(path, 'r') as file:
            timestamps = np.loadtxt(file, dtype='float64')

        index = pd.DatetimeIndex(timestamps * 1e9, tz='UTC')
        series = pd.Series(
            index=index,
            data=np.full(len(index), 'Tag'),
            dtype='object'
        )

        return {'tags': series}

    def parse(self):
        result = {}

        for raw_file in self.raw_files:
            path = raw_file.path.path
            if is_zero_file(path):
                continue

            if raw_file.name == 'IBI.csv':
                data = self.read_ibi(path)
            elif raw_file.name == 'tags.csv':
                data = self.read_tags(path)
            else:
                data = self.read_default(path, self.FILES[raw_file.name])

            for name, series in data.items():
                result[name] = {
                    'series': series,
                    'raw_file_id': raw_file.id
                }

        if 'acc_x' in result:
            index = result['acc_x']['series'].index
            data = np.linalg.norm(
                [
                    result['acc_x']['series'],
                    result['acc_y']['series'],
                    result['acc_z']['series']
                ],
                axis=0
            )
            result['acc_mag'] = {
                'series': pd.Series(data=data, index=index, name='acc_mag')
            }

        for name, meta in self.META.items():
            if name in result:
                result[name] = {
                    **result[name],
                    **meta,
                }

        return result
