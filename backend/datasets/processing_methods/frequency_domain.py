import json
import pandas as pd
import numpy as np
from scipy import signal
from scipy.interpolate import interp1d
import plotly.graph_objects as go
from plotly.utils import PlotlyJSONEncoder

from datasets.constants import domain_types
from datasets.processing_methods.method_base import AnalysisMethodBase

class FrequencyDomainAnalysis(AnalysisMethodBase):

    FOURIER = 1
    AUTOREGRESSIVE = 2
    LOMB_SCARGLE = 3

    @classmethod
    def name(cls):
        return 'Frequency Domain'

    @classmethod
    def domain(cls):
        return domain_types.FREQUENCY

    @classmethod
    def options(cls):
        return {
            'method': {
                'title': 'Method',
                'type': 'select',
                'items': [
                    {'title': 'Fourier', 'value': cls.FOURIER},
                    {'title': 'Auto-Regressive', 'value': cls.AUTOREGRESSIVE},
                    {'title': 'Lomb-Scargle', 'value': cls.LOMB_SCARGLE},
                ],
                'default': cls.LOMB_SCARGLE,
            },
            'ulf': {
                'title': 'Ultra Low Frequency',
                'type': 'number',
                'unit': 'Hz',
                'limits': [0, 1],
                'default': 0.003
            },
            'vlf': {
                'title': 'Very Low Frequency',
                'type': 'number',
                'unit': 'Hz',
                'limits': [0, 1],
                'default': 0.04
            },
            'lf': {
                'title': 'Low Frequency',
                'type': 'number',
                'unit': 'Hz',
                'limits': [0, 1],
                'default': 0.15
            },
            'hf': {
                'title': 'High Frequency',
                'type': 'number',
                'unit': 'Hz',
                'limits': [0, 1],
                'default': 0.4
            }
        }

    def lombscargle(self):
        ulf_limit = self.configuration['ulf']
        vlf_limit = self.configuration['vlf']
        lf_limit = self.configuration['lf']
        hf_limit = self.configuration['hf']

        freq = np.linspace(0.000001, 0.5, 1000)
        x = np.arange(0, len(self.ibi_series), dtype=np.float64)
        pgram = signal.lombscargle(x, self.ibi_series.values, freq)

        abs_power = np.trapz(abs(np.sqrt(4 * pgram[freq < hf_limit] / len(freq))))
        ulf = np.trapz(abs(np.sqrt(4 * pgram[freq < ulf_limit] / len(freq))))
        vlf = np.trapz(abs(np.sqrt(4 * pgram[(freq >= ulf_limit) & (freq < vlf_limit)] / len(freq))))
        lf = np.trapz(abs(np.sqrt(4 * pgram[(freq >= vlf_limit) & (freq < lf_limit)] / len(freq))))
        hf = np.trapz(abs(np.sqrt(4 * pgram[(freq >= lf_limit) & (freq < hf_limit)] / len(freq))))

        return abs_power, ulf, vlf, lf, hf, freq, pgram


    def fourier(self):
        ulf_limit = self.configuration['ulf']
        vlf_limit = self.configuration['vlf']
        lf_limit = self.configuration['lf']
        hf_limit = self.configuration['hf']

        frq, psd = signal.welch(
            self.ibi_series.values,
            4.0,
            window=np.hamming(512),
            scaling='density',
            return_onesided=True
        )

        abs_power = np.trapz(abs(psd[(frq >= 0.0) & (frq < 4.0)])) * 10**6
        ulf = np.trapz(abs(psd[(frq >= 0.0) & (frq < 0.003)])) * 10**6
        vlf = np.trapz(abs(psd[(frq >= 0.003) & (frq < 0.04)])) * 10**6
        lf = np.trapz(abs(psd[(frq >= 0.04) & (frq < 0.15)])) * 10**6
        hf = np.trapz(abs(psd[(frq >= 0.15) & (frq < 0.4)])) * 10**6

        return abs_power, ulf, vlf, lf, hf, frq, psd


    def process(self):
        # Get selected samples from signal
        data = pd.DataFrame()
        for each in self.analysis_samples:
            data = pd.concat([data, self.signal.samples_dataframe(each.start, each.end)])

        self.ibi_series = data[data.columns[0]]

        method = self.configuration['method']
        if method is self.LOMB_SCARGLE:
            abs_power, ulf, vlf, lf, hf, pgram_x, pgram_y = self.lombscargle()
        # elif methods is self.AUTOREGRESSIVE:
        #     abs_power, ulf, vlf, lf, hf, pgram_x, pgram_y = self.autoregressive()
        else:
            abs_power, ulf, vlf, lf, hf, pgram_x, pgram_y = self.fourier()

        lf_nu = ((lf) / (abs_power - vlf - ulf)) * 100
        hf_nu = ((hf) / (abs_power - vlf - ulf)) * 100

        ulf_perc = (ulf / abs_power) * 100
        vlf_perc = (vlf / abs_power) * 100
        lf_perc = (lf / abs_power) * 100
        hf_perc = (hf / abs_power) * 100

        features = {
            'ULF power': [ulf, 'ms²'],
            'ULF power rel.': [ulf_perc, '%'],
            'VLF power': [vlf, 'ms²'],
            'VLF power rel.': [vlf_perc, '%'],
            'LF power': [lf, 'ms²'],
            'LF power rel.': [lf_perc, '%'],
            'LF power norm.': [lf_nu, 'nu'],
            'HF power': [hf, 'ms²'],
            'HF power rel.': [hf_perc, '%'],
            'HF power norm.': [hf_nu, 'nu'],
            'LF/HF': [lf/hf, '%']
        }

        table_data = pd.DataFrame({
            'Variable': list(features.keys()),
            'Value': np.round([v[0] for v in features.values()], 3),
            'Unit': [v[1] for v in features.values()]
        })

        # Create plot for power density distribution
        pgram_n = pgram_y / np.max(pgram_y)
        ulf_limit = self.configuration['ulf']
        vlf_limit = self.configuration['vlf']
        lf_limit = self.configuration['lf']
        hf_limit = self.configuration['hf']

        psd_plot = go.Figure(
            layout={
                'xaxis_range': [0, 0.5],
                'yaxis_range': [0, 0.03],
                'title_text': 'Periodogram',
                'legend_orientation': 'h',
            }
        )
        psd_plot.add_trace(go.Scatter(
            x=pgram_x[pgram_x <= ulf_limit],
            y=pgram_n[pgram_x <= ulf_limit],
            fill='tozeroy',
            fillcolor='grey',
            mode='lines',
            name='ULF',
        ))
        psd_plot.add_trace(go.Scatter(
            x=pgram_x[(pgram_x >= ulf_limit) & (pgram_x <= vlf_limit)],
            y=pgram_n[(pgram_x >= ulf_limit) & (pgram_x <= vlf_limit)],
            fill='tozeroy',
            fillcolor='red',
            mode='lines',
            name='VLF',
        ))
        psd_plot.add_trace(go.Scatter(
            x=pgram_x[(pgram_x >= vlf_limit) & (pgram_x <= lf_limit)],
            y=pgram_n[(pgram_x >= vlf_limit) & (pgram_x <= lf_limit)],
            fill='tozeroy',
            fillcolor='green',
            mode='lines',
            name='LF',
        ))
        psd_plot.add_trace(go.Scatter(
            x=pgram_x[(pgram_x >= lf_limit) & (pgram_x <= hf_limit)],
            y=pgram_n[(pgram_x >= lf_limit) & (pgram_x <= hf_limit)],
            fill='tozeroy',
            fillcolor='blue',
            mode='lines',
            name='HF',
        ))
        psd_plot.add_trace(go.Scatter(
            x=pgram_x[pgram_x >= hf_limit],
            y=pgram_n[pgram_x >= hf_limit],
            fill='tozeroy',
            fillcolor='white',
            line_color='grey',
            mode='lines',
            showlegend=False,
            name='Above HF'
        ))

        # Return results in JSON compliant format
        return {
            'table': {
                'columns': ['Variable', 'Unit', 'Value'],
                'data': table_data.to_dict('records')
            },
            'plot': json.loads(json.dumps(psd_plot, cls=PlotlyJSONEncoder))
        }
