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

    META = {
        'inter_pulse_interval': {
            'type': signal_types.RR_INTERVAL,
            'unit': 'Milliseconds'
        },
        'heart_rate': {
            'unit': 'BPM'
        },
        'heart_rate_variability': {
            'unit': 'Milliseconds'
        },
        'gsr_electrode': {
            'unit': 'Microsiemens'
        },
        'ctemp': {
            'unit': 'Celsius'
        },
        'temperature_object': {
            'unit': 'Celsius'
        },
        'temperature_barometer': {
            'unit': 'Celsius'
        },
        'temperature_local': {
            'unit': 'Celsius'
        },
        'barometer_pressure': {
            'unit': 'Millibar'
        },
        'respiration_rate': {
            'unit': 'BPM'
        },
        'oxygen_saturation': {
            'unit': 'Percent'
        },
    }

    SIGNAL_TAGS = {
        6: ['heart_rate'],
        7: ['oxygen_saturation'],
        #8: ['perfusion_index'],
        #9: ['motion_activity'],
        #10: ['activity_classification'],
        11: ['heart_rate_variability', 'heart_rate_variability_quality'],
        12: ['respiration_rate'],
        #13: ['energy'],
        15: ['ctemp'],
        19: ['temperature_local'],
        20: ['barometer_pressure'],
        21: ['gsr_electrode'],
        #22: ['health_score'],
        #23: ['relax_stress_intensity_score'],
        #24: ['sleep_quality_index_score'],
        #25: ['training_effect_score'],
        #26: ['activity_score'],
        #66: ['richness_score'],
        #68: ['heart_rate_quality'],
        #69: ['oxygen_saturation_quality'],
        #70: ['blood_pulse_wave', 'blood_pulse_wave_quality'],
        #71: ['number_of_steps'],
        #72: ['activity_classification_quality'],
        #73: ['energy_quality'],
        #74: ['heart_rate_variability_quality'],
        #75: ['respiration_rate_quality'],
        #76: ['ctemp_quality'],
        118: ['temperature_object'],
        119: ['temperature_barometer'],
        #133: ['perfusion_index_quality'],
        #134: ['blood_pulse_wave_quality']
    }

    SENSOR_TAGS = {
        80: ['led1_data'],
        81: ['led2_data'],
        82: ['led3_data'],
        83: ['led4_data'],
        84: ['accx_data'],
        85: ['accy_data'],
        86: ['accz_data'],
        #88: ['led2_current'],
        #89: ['led3_current'],
        #90: ['led4_current'],
        #91: ['current_offset'],
        #92: ['compressed_data']
    }

    FEATURE_TAGS = {
        14: ['inter_pulse_interval', 'inter_pulse_interval_deviation'],
        #17: ['pis'],
        #18: ['pid'],
        #77: ['inter_pulse_deviation'],
        #78: ['pis_quality'],
        #79: ['pid_quality']
    }

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

    @staticmethod
    def extend_values(df, dtype='float64'):
        values_extended = df['values'].str.extract(r'(?P<value>[\d.]+);?(?P<value2>[\d.]+)?') \
            .astype({ 'value': dtype, 'value2': dtype }, copy=False)
        df_extended = pd.concat([df, values_extended], axis=1)
        df_extended.drop(columns='values', inplace=True)
        return df_extended

    @staticmethod
    def get_dataframe_iterator(path, cols=['count', 'tag', 'time', 'values']):
        parse_dates = ['time'] if 'time' in cols else None
        return pd.read_csv(
            path,
            usecols=cols,
            dtype={
                'count': 'uint32',
                'streamType': 'int8',
                'tag': 'int8',
                'values': 'object'
            },
            parse_dates=parse_dates,
            date_parser=lambda x: pd.to_datetime(x, unit='s', utc=True),
            chunksize=100000
        )

    @classmethod
    def create_time_lookup(cls, path, tag):
        if isinstance(tag, int):
            tag = [tag]
        elif not isinstance(tag, list):
            raise TypeError(f'Expected tag to be int or list, but got {type(tag)}')

        df = pd.DataFrame()
        df_iterator = cls.get_dataframe_iterator(path, ['tag', 'count', 'time'])

        # append data from csv in chunks and drop duplicates
        for chunk in df_iterator:
            chunk.drop_duplicates(subset=['count', 'tag'], inplace=True)
            subset = chunk['tag'].isin(tag)
            df = pd.concat([df, chunk[subset]])

        # drop missed duplicates
        df.drop_duplicates(subset=['count', 'tag'], inplace=True)
        df.sort_values(['tag', 'count'], inplace=True)

        samples_per_sec = df.groupby(['tag', 'time']).count()
        frequency = samples_per_sec.groupby('tag').mean()['count']
        frequency.rename('frequency', inplace=True)
        frequency = frequency.round(1)

        if any(value != 1 for value in frequency.values):
            # drop first second, since it's probably not complete
            start_time = df['time'].min()
            df = df[df['time'] > start_time]

            # get minimum time and count values for each tag
            reference = df.groupby('tag').min()

            # calculate correct sample time
            df = df.merge(reference, left_on='tag', right_on='tag', suffixes=('', '_start'), copy=False)
            df['frequency'] = df['tag'].map(frequency)
            df['time'] = df['time_start'] + pd.to_timedelta((df['count'] - df['count_start']) / df['frequency'], unit='s')

        # Necessary for some cases, device hiccup?
        df.drop_duplicates(['tag', 'time'], inplace=True)

        return df[['tag', 'count', 'time']]

    @classmethod
    def get_tags(cls, filename):
        if re.match(cls.FILES['signals'], filename):
            return cls.SIGNAL_TAGS
        if re.match(cls.FILES['sensors'], filename):
            return cls.SENSOR_TAGS
        if re.match(cls.FILES['features'], filename):
            return cls.FEATURE_TAGS
        return None

    @classmethod
    def read_file(cls, file):
        path = file.path.path
        tags = cls.get_tags(file.name)
        name_list = [name for tag in tags for name in tags[tag]]
        result = {
            name: pd.Series(name=name)
            for name
            in name_list
        }

        time_lookup = cls.create_time_lookup(path, list(tags))
        df_iterator = cls.get_dataframe_iterator(path, ['tag', 'count', 'values'])

        for chunk in df_iterator:
            chunk.drop_duplicates(['count', 'tag'], inplace=True)
            chunk.sort_values('count', inplace=True)
            df = cls.extend_values(chunk)
            for tag, names in tags.items():
                df_tag = df.loc[df['tag'] == tag]
                time_lookup_tag = time_lookup.loc[time_lookup['tag'] == tag]
                df_tag = df_tag.merge(
                    time_lookup_tag,
                    left_on=['count', 'tag'],
                    right_on=['count', 'tag'],
                    how='inner'
                )
                df_tag.set_index('time', inplace=True)
                result[names[0]] = result[names[0]].combine_first(df_tag['value'])
                if len(names) == 2:
                    result[names[1]] = result[names[1]].combine_first(df_tag['value2'])

        for name, series in result.items():
            series.sort_index(inplace=True)

        return result

    def parse(self):
        result = {}

        for file in self.raw_files:
            series = self.read_file(file)
            for name, data in series.items():
                result[name] = {
                    'series': data,
                    'raw_file_id': file.id,
                }

        if 'accx_data' in result:
            index = result['accx_data']['series'].index
            data = np.linalg.norm(
                [
                    result['accx_data']['series'],
                    result['accy_data']['series'],
                    result['accz_data']['series']
                ],
                axis=0
            )
            result['acc_mag'] = {
                'series': pd.Series(data=data, index=index, name='acc_mag')
            }

        if 'gsr_electrode' in result:
            # convert kOhm to uSiemens
            result['gsr_electrode']['series'] = (1 / (result['gsr_electrode']['series'] * 1000)) * 1e6

        for name, meta in self.META.items():
            if name in result:
                result[name] = {
                    **result[name],
                    **meta
                }

        return result


