import re
import pandas as pd
import numpy as np
import pyedflib
from datetime import datetime

from datasets.constants import signal_types
from datasets.utils import create_df
from datasets.sources.source_base import SourceBase

class FarosSource(SourceBase):

    COLUMN_TO_TYPE = {
        'ECG': signal_types.ECG,
        'HRV': signal_types.RR_INTERVAL,
    }

    @classmethod
    def name(cls):
        return "Faros"

    @classmethod
    def fileOptions(cls):
        return [
            {
                'label': 'EDF File',
                'pattern': '[\d-]{8}\.EDF',
                'required': True,
                'multiple': False,
                'timestamp': False
            }
        ]

    def parse(self):
        signal_names =  ['ECG', 'HRV', 'Accelerometer_X', 'Accelerometer_Y', 'Accelerometer_Z', 'Accelerometer_MAG']
        raw_file = self.raw_files[0]

        with pyedflib.EdfReader(raw_file.path.path) as f:
            # read EDF file into a dictionary, keys: signal_labels
            n = f.signals_in_file    # get num of signal types
            signal_labels = f.getSignalLabels()   # get labels for types of signals
            raw_sample_freqs = f.getSampleFrequencies()
            start_ts = (f.getStartdatetime() - datetime.fromtimestamp(0)).total_seconds()

            raw_data = dict.fromkeys(signal_labels)   # the signals has difference sizes, therefore put into a dictionary
            for i in np.arange(n):
                raw_data[signal_labels[i]] = f.readSignal(i)

        raw_data['Accelerometer_MAG'] = np.linalg.norm([raw_data['Accelerometer_X'], raw_data['Accelerometer_Y'], raw_data['Accelerometer_Z']], axis=0)

        sample_freqs = {}
        for i in range(len(signal_labels)):
            sample_freqs[signal_labels[i]] = raw_sample_freqs[i]
        sample_freqs['Accelerometer_MAG'] = sample_freqs['Accelerometer_X']
        start_timestamps = {}
        for name in signal_names:
            start_timestamps[name] = start_ts

        data = create_df(signal_names, raw_data, sample_freqs, start_timestamps)
        data = data.tz_localize('UTC', copy=False)

        result = {
            column: {
                'raw_file_id': raw_file.id,
                'series': data[column]
            }
            for column
            in data.columns
        }
        for key, value in self.COLUMN_TO_TYPE.items():
            result[key]['type'] = value

        return result
