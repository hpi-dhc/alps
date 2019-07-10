import re
import pandas as pd
import numpy as np
from datetime import datetime

from datasets.constants import signal_types
from datasets.utils import create_df
from datasets.sources.source_base import SourceBase

import logging
logger = logging.getLogger(__name__)

class EverionSource(SourceBase):

    FILES = {
        'signals': r'^CsvData_signals_EV-[A-Z0-9-]{14}\.csv$',
        'sensors': r'^CsvData_sensor_data_EV-[A-Z0-9-]{14}\.csv$',
        'features': r'^CsvData_features_EV-[A-Z0-9-]{14}\.csv$',
        # 'aggregates': r'^CsvData_aggregates_EV-[A-Z0-9-]{14}\.csv$',
        # 'analytics': r'^CsvData_analytics_events_EV-[A-Z0-9-]{14}\.csv$',
        # 'events': r'^CsvData_everion_events_EV-[A-Z0-9-]{14}\.csv$',
    }

    COLUMN_TO_TYPE = {
        'inter_pulse_interval': signal_types.NN_INTERVAL
    }

    SIGNAL_TAGS = {
        6: 'heart_rate',
        7: 'oxygen_saturation',
        8: 'perfusion_index',
        9: 'motion_activity',
        10: 'activity_classification',
        11: 'heart_rate_variability',
        12: 'respiration_rate',
        13: 'energy',
        15: 'ctemp',
        19: 'temperature_local',
        20: 'barometer_pressure',
        21: 'gsr_electrode',
        22: 'health_score',
        23: 'relax_stress_intensity_score',
        24: 'sleep_quality_index_score',
        25: 'training_effect_score',
        26: 'activity_score',
        66: 'richness_score',
        68: 'heart_rate_quality',
        69: 'oxygen_saturation_quality',
        70: 'blood_pulse_wave',
        71: 'number_of_steps',
        72: 'activity_classification_quality',
        73: 'energy_quality',
        74: 'heart_rate_variability_quality',
        75: 'respiration_rate_quality',
        76: 'ctemp_quality',
        118: 'temperature_object',
        119: 'temperature_barometer',
        133: 'perfusion_index_quality',
        134: 'blood_pulse_wave_quality'
    }

    SENSOR_TAGS = {
        80: 'led1_data',
        81: 'led2_data',
        82: 'led3_data',
        83: 'led4_data',
        84: 'accx_data',
        85: 'accy_data',
        86: 'accz_data',
        88: 'led2_current',
        89: 'led3_current',
        90: 'led4_current',
        91: 'current_offset',
        92: 'compressed_data'
    }

    FEATURE_TAGS = {
        14: 'inter_pulse_interval',
        17: 'pis',
        18: 'pid',
        77: 'inter_pulse_deviation',
        78: 'pis_quality',
        79: 'pid_quality'
    }

    ACC_NAMES = ['accx_data', 'accy_data', 'accz_data']

    selected_signal_tags = [6, 7, 11, 12, 15, 19, 20, 21, 118, 119]
    selected_sensor_tags = [80, 81, 82, 83, 84, 85, 86]
    selected_feature_tags = [14]

    @classmethod
    def name(cls):
        return "Biovotion Everion"

    @classmethod
    def fileOptions(cls):
        return [
            {
                'label': 'Signals Data',
                'pattern': '^CsvData_signals_EV-[A-Z0-9-]{14}\.csv$',
                'required': True,
                'multiple': False,
                'timestamp': False
            },
            {
                'label': 'Sensor Data',
                'pattern': '^CsvData_sensor_data_EV-[A-Z0-9-]{14}\.csv$',
                'required': False,
                'multiple': False,
                'timestamp': False
            },
            {
                'label': 'Features Data',
                'pattern': '^CsvData_features_EV-[A-Z0-9-]{14}\.csv$',
                'required': False,
                'multiple': False,
                'timestamp': False
            },
        ]

    def parse(self):
        self.result = {}

        data_signals = self.read_signals()
        data_sensors = self.read_sensors()
        data_features = self.read_features()

        return self.result

    def read_signals(self):
        signals_file = self.get_file('signals')
        if signals_file is None:
            return

        raw_signals = pd.read_csv(signals_file.path.path)
        raw_signals.drop_duplicates(inplace=True)

        data = pd.DataFrame()
        for tag in np.sort(raw_signals['tag'].unique()):
            if tag not in self.selected_signal_tags:
                continue
            tag_name = self.SIGNAL_TAGS[tag]
            sub_df = raw_signals[raw_signals['tag']==tag]
            columns_to_join = [tag_name]
            # Check if signal includes quality value
            if sub_df.loc[sub_df.first_valid_index(), 'values'].find(';') != -1:
                quality_name = '{}_quality'.format(tag_name)
                columns_to_join = columns_to_join + [quality_name]
                sub_df.loc[:, quality_name] = sub_df['values'].apply(lambda val: val[val.find(';')+1:]).astype(float)
                sub_df.loc[:, tag_name] = sub_df['values'].apply(lambda val: val[:val.find(';')]).astype(float)
            else:
                sub_df.loc[:, tag_name] = sub_df['values'].astype(float)
            sub_df.loc[:, 'time'] = pd.to_datetime(sub_df.loc[:, 'time'], unit='s')
            if sub_df.empty or (sub_df[tag_name]==0).all():
                continue
            sub_df.set_index('time', inplace=True, verify_integrity=True)
            sub_df.sort_index(inplace=True)
            data = data.join(sub_df[columns_to_join], how='outer')

        data.tz_localize('UTC', copy=False)

        self.write_result(data, signals_file)

        return data

    def read_sensors(self):
        sensors_file = self.get_file('sensors')
        if sensors_file is None:
            return

        raw_sensors = pd.read_csv(sensors_file.path.path)
        raw_sensors.drop_duplicates(inplace=True)

        min_count_dict = {}
        count_ts_dict = {}
        data = pd.DataFrame()
        sub_df = raw_sensors[raw_sensors['tag']==self.selected_sensor_tags[0]]
        for ts in raw_sensors['time'].unique():
            min_count_dict[ts] = sub_df[sub_df['time']==ts].loc[:, 'count'].min()
            count_ts_dict[ts] = sub_df[sub_df['time']==ts].loc[:, 'count'].max() - min_count_dict[ts] + 1

        for tag in np.sort(raw_sensors['tag'].unique()):
            if tag not in self.selected_sensor_tags:
                continue
            tag_name = self.SENSOR_TAGS[tag]
            sub_df = raw_sensors[raw_sensors['tag']==tag]

            sub_df.loc[:, 'time'] = pd.to_datetime(sub_df.apply(lambda x: x['time'] + (x['count'] - min_count_dict[x['time']]) / count_ts_dict[x['time']], axis=1), unit='s')
            sub_df.loc[:, tag_name] = sub_df['values']
            if sub_df.empty or (sub_df[tag_name]==0).all():
                continue
            sub_df.set_index('time', inplace=True, verify_integrity=True)
            sub_df.sort_index(inplace=True)
            data = data.join(sub_df[tag_name], how='outer')

        if all(x in set(data.columns) for x in self.ACC_NAMES):
            data['acc_mag'] = np.linalg.norm(data[self.ACC_NAMES], axis='1')

        data.tz_localize('UTC', copy=False)

        self.write_result(data, sensors_file)

        return data

    def read_features(self):
        features_file = self.get_file('features')
        if features_file is None:
            return

        raw_features = pd.read_csv(features_file.path.path)
        raw_features.drop_duplicates(inplace=True)

        min_count_dict = {}
        count_ts_dict = {}
        data = pd.DataFrame()
        sub_df = raw_features[raw_features['tag']==self.selected_feature_tags[0]]
        for ts in raw_features['time'].unique():
            min_count_dict[ts] = sub_df[sub_df['time']==ts].loc[:, 'count'].min()
            count_ts_dict[ts] = sub_df[sub_df['time']==ts].loc[:, 'count'].max() - min_count_dict[ts] + 1

        for tag in np.sort(raw_features['tag'].unique()):
            if tag not in self.selected_feature_tags:
                continue
            tag_name = self.FEATURE_TAGS[tag]
            sub_df = raw_features[raw_features['tag']==tag]

            columns_to_join = [tag_name]
            # Check if signal includes quality value
            if sub_df.loc[sub_df.first_valid_index(), 'values'].find(';') != -1:
                if tag == 14: # inter pulse interval quality is given as deviation
                    quality_name = '{}_deviation'.format(tag_name)
                else:
                    quality_name = '{}_quality'.format(tag_name)
                columns_to_join = columns_to_join + [quality_name]
                sub_df.loc[:, quality_name] = sub_df['values'].apply(lambda val: val[val.find(';')+1:]).astype(float)
                sub_df.loc[:, tag_name] = sub_df['values'].apply(lambda val: val[:val.find(';')]).astype(float)
            else:
                sub_df.loc[:, tag_name] = sub_df['values'].astype(float)
            sub_df.loc[:, 'time'] = pd.to_datetime(sub_df.apply(lambda x: x['time'] + (x['count'] - min_count_dict[x['time']]) / count_ts_dict[x['time']], axis=1), unit='s')
            if sub_df.empty or (sub_df[tag_name]==0).all():
                continue
            sub_df.set_index('time', inplace=True, verify_integrity=True)
            sub_df.sort_index(inplace=True)
            data = data.join(sub_df[columns_to_join], how='outer')

        data.tz_localize('UTC', copy=False)

        self.write_result(data, features_file)

        return data

    def get_file(self, name):
        for file in self.raw_files:
            if re.match(self.FILES[name], file.name):
                return file
        return None

    def write_result(self, data, file):
        if type(self.result) is not dict:
            self.result = {}
        for column in data.columns:
            self.result[column] = {
                'raw_file_id': file.id,
                'series': data[column],
            }
            if column in self.COLUMN_TO_TYPE:
                self.result[column]['type'] = self.COLUMN_TO_TYPE[column]
