import re
import pandas as pd
import numpy as np

from datasets.constants import signal_types
from datasets.utils import create_df, search_dict
from datasets.sources.source_base import SourceBase

import logging
logger = logging.getLogger(__name__)

class EmpaticaE4Source(SourceBase):

    FILES = {
        'acc': 'ACC.csv',
        'bvp': 'BVP.csv',
        'eda': 'EDA.csv',
        'hr': 'HR.csv',
        'ibi': 'IBI.csv',
        'temp': 'TEMP.csv',
    }

    COLUMN_TO_TYPE = {
        'bvp': signal_types.PPG,
        'ibi': signal_types.NN_INTERVAL,
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
                'required': True,
                'timestamp': False
            },
            {
                'label': 'BVP',
                'pattern': 'BVP.csv',
                'required': True,
                'timestamp': False
            },
            {
                'label': 'EDA',
                'pattern': 'EDA.csv',
                'required': True,
                'timestamp': False
            },
            {
                'label': 'HR',
                'pattern': 'HR.csv',
                'required': True,
                'timestamp': False
            },
            {
                'label': 'IBI',
                'pattern': 'IBI.csv',
                'required': True,
                'timestamp': False
            },
            {
                'label': 'TEMP',
                'pattern': 'TEMP.csv',
                'required': True,
                'timestamp': False
            },
            # {
            #     'label': 'Tags',
            #     'pattern': 'tags.csv',
            #     'required': True,
            #     'timestamp': False
            # },
        ]

    # @classmethod
    # def configuration_variables(cls):
    #     return {}

    def parse(self):
        signal_names = ['acc', 'bvp', 'eda', 'hr', 'temp']
        acc_names = ['acc_x', 'acc_y', 'acc_z']

        signals = {}
        start_times = {}
        sample_freqs = {}
        files = {}

        result = {
            key: {'type': value}
            for key, value
            in self.COLUMN_TO_TYPE.items()
        }

        for raw_file in self.raw_files:
            signal_name = search_dict(self.FILES, raw_file.name)
            files[signal_name] = raw_file.path
            if signal_name == 'acc':
                for key in acc_names:
                    result[key] = {}
                    result[key]['raw_file_id'] = raw_file.id
            else:
                if signal_name not in result:
                    result[signal_name] = {}
                result[signal_name]['raw_file_id'] = raw_file.id

        for signal in signal_names:
            file = files[signal]
            with file.open('r') as f:
                ts_line = f.readline()
                start_times[signal] = int(ts_line[:ts_line.find('.')])
                sf_line = f.readline()
                sample_freqs[signal] = int(sf_line[:sf_line.find('.')])
                split = re.split('[,\n]', f.read())
                split = np.array(split[:-1]).astype(float)
                if signal == 'acc':
                    for index, axis in enumerate(acc_names):
                        signals[axis] = split[index::3]
                        sample_freqs[axis] = sample_freqs[signal]
                        start_times[axis] = start_times[signal]
                    del start_times[signal]
                    del sample_freqs[signal]
                    continue
                signals[signal] = split

        # Read inter beat intervals
        with files['ibi'].open('r') as f:
            ts_line = f.readline()
            start_time = pd.to_datetime(int(ts_line[:ts_line.find('.')]), unit='s')
            split = re.split('[,\n]', f.read())
            ibis = np.array(split[1:-1:2]).astype(float)
            timedeltas = list(map(lambda x: pd.Timedelta(x, unit='s'), np.array(split[:-1:2]).astype(float)))
            timestamps = list(map(lambda x: start_time + x, timedeltas))
            df_ibi = pd.DataFrame({'ibi': ibis}, index=timestamps)

        signals['acc_mag'] = np.linalg.norm([signals['acc_x'], signals['acc_y'], signals['acc_z']], axis=0)
        sample_freqs['acc_mag'] = sample_freqs['acc_x']
        start_times['acc_mag'] = start_times['acc_x']
        result['acc_mag'] = {}

        signal_names = signal_names.copy()
        signal_names.remove('acc')
        signal_names = signal_names + acc_names + ['acc_mag']

        df = create_df(signal_names, signals, sample_freqs, start_times)
        df = df.join(df_ibi, how='outer')
        # Timezone is always UTC, see https://support.empatica.com/hc/en-us/articles/201608896-Data-export-and-formatting-from-E4-connect-
        df = df.tz_localize('UTC', copy=False)

        logger.warn(df.columns)
        logger.warn(result)

        for column in df.columns:
            result[column]['series'] = df[column]

        return result
