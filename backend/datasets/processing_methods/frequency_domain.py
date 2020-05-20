import json
import pandas as pd
import numpy as np
from scipy import signal
from scipy.interpolate import interp1d
from astropy.timeseries import LombScargle
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
        return 'HRV Frequency Domain'

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
                    #{'title': 'Auto-Regressive', 'value': cls.AUTOREGRESSIVE},
                    {'title': 'Lomb-Scargle', 'value': cls.LOMB_SCARGLE},
                ],
                'default': cls.FOURIER,
            },
            'fft_interpolation': {
                'title': 'FFT interpolation frequency',
                'type': 'number',
                'default': 4.0
            },
            'use_ulf': {
                'title': 'Use ULF Band',
                'type': 'boolean',
                'default': False
            },
            'lomb_smoothing': {
                'title': 'Lomb-Scargle Smoothing',
                'type': 'number',
                'unit': 'Hz',
                'default': 0.02
            },
            'ulf': {
                'title': 'Ultra Low Frequency',
                'type': 'number',
                'unit': 'Hz',
                'limits': [0, 0.5],
                'default': 0.003
            },
            'vlf': {
                'title': 'Very Low Frequency',
                'type': 'number',
                'unit': 'Hz',
                'limits': [0, 0.5],
                'default': 0.04
            },
            'lf': {
                'title': 'Low Frequency',
                'type': 'number',
                'unit': 'Hz',
                'limits': [0, 0.5],
                'default': 0.15
            },
            'hf': {
                'title': 'High Frequency',
                'type': 'number',
                'unit': 'Hz',
                'limits': [0, 0.5],
                'default': 0.4
            },
        }


    def lombscargle(self):
        freq = np.linspace(0, 0.5, 2**10)
        t = np.cumsum(self.ibi_series.values)
        psd = LombScargle(t, self.ibi_series.values, normalization='psd').power(freq)
        psd[0] = np.mean(psd[1:]) # fix nan

        smoothing = self.configuration['lomb_smoothing']
        if smoothing > 0:
            window = np.max([1, int(round(smoothing / (freq[1] - freq[0])))])
            psd = pd.Series(psd).rolling(window, min_periods=1).mean().values

        return freq, psd


    def fourier(self):
        interp_freq = self.configuration['fft_interpolation']
        x = np.cumsum(self.ibi_series.values)
        f_interpol = interp1d(x, self.ibi_series.values, 'cubic')
        t_interpol = np.arange(x[0], x[-1], 1000/interp_freq)
        nn_interpol = f_interpol(t_interpol)

        nperseg = int(round(300 * interp_freq)) # 4 Hz signal => each segment is 300 seconds
        nfft = np.max([nperseg, 2**10])

        freq, psd = signal.welch(
            nn_interpol,
            interp_freq,
            nfft=nfft,
            nperseg=nperseg,
            window='hamming',
            scaling='density',
            detrend='linear'
        )

        return freq, psd


    def process(self):
        # Get selected samples from signal
        data = pd.DataFrame()
        for each in self.analysis_samples:
            data = pd.concat([data, self.signal.samples_dataframe(each.start, each.end)])

        # Make ibi_series available for instance
        self.ibi_series = data[data.columns[0]]

        # Get configuration parameters
        use_ulf = self.configuration['use_ulf']
        if not use_ulf or self.ibi_series.sum() < 300000:
            # Do not use ULF band on sample shorter than 5 minutes
            ulf_limit = 0
        else:
            ulf_limit = self.configuration['ulf']
        vlf_limit = self.configuration['vlf']
        lf_limit = self.configuration['lf']
        hf_limit = self.configuration['hf']
        method = self.configuration['method']

        if method is self.LOMB_SCARGLE:
            freq, psd = self.lombscargle()
        else:
            freq, psd = self.fourier()

        abs_index = freq <= hf_limit
        ulf_index = freq <= ulf_limit
        vlf_index = (freq >= ulf_limit) & (freq <= vlf_limit)
        lf_index = (freq >= vlf_limit) & (freq <= lf_limit)
        hf_index = (freq >= lf_limit) & (freq <= hf_limit)

        # Get power for each band by integrating over spectral density
        abs_power = np.trapz(psd[abs_index], freq[abs_index])
        ulf = np.trapz(psd[ulf_index], freq[ulf_index])
        vlf = np.trapz(psd[vlf_index], freq[vlf_index])
        lf = np.trapz(psd[lf_index], freq[lf_index])
        hf = np.trapz(psd[hf_index], freq[hf_index])

        # Normalized power for LF and HF band
        lf_nu = lf / (abs_power - vlf - ulf) * 100
        hf_nu = hf / (abs_power - vlf - ulf) * 100

        # Relative power of each band
        ulf_perc = (ulf / abs_power) * 100
        vlf_perc = (vlf / abs_power) * 100
        lf_perc = (lf / abs_power) * 100
        hf_perc = (hf / abs_power) * 100

        # Frequency with highest power
        vlf_peak = freq[vlf_index][np.argmax(psd[vlf_index])]
        lf_peak = freq[lf_index][np.argmax(psd[lf_index])]
        hf_peak = freq[hf_index][np.argmax(psd[hf_index])]

        features = {
            'VLF peak': [vlf_peak, 'Hz'],
            'VLF power': [vlf, 'ms²'],
            'VLF power log': [np.log(vlf), ''],
            'VLF power rel.': [vlf_perc, '%'],
            'LF peak': [lf_peak, 'Hz'],
            'LF power': [lf, 'ms²'],
            'LF power log': [np.log(lf), ''],
            'LF power rel.': [lf_perc, '%'],
            'LF power norm.': [lf_nu, 'nu'],
            'HF peak': [hf_peak, 'Hz'],
            'HF power': [hf, 'ms²'],
            'HF power log': [np.log(hf), ''],
            'HF power rel.': [hf_perc, '%'],
            'HF power norm.': [hf_nu, 'nu'],
            'LF/HF': [lf/hf, ''],
        }

        # Add ULF parameters, if band available
        if use_ulf and np.sum(ulf_index) > 0:
            ulf_peak = freq[np.argmax(psd[ulf_index])]
            features = {
                'ULF peak': [ulf_peak, 'Hz'],
                'ULF power': [ulf, 'ms²'],
                'ULF power log': [np.log(ulf), ''],
                'ULF power rel.': [ulf_perc, '%'],
                **features
            }

        # Convert dictionary to dataframe
        table_data = pd.DataFrame({
            'Variable': list(features.keys()),
            'Value': np.round([v[0] for v in features.values()], 3),
            'Unit': [v[1] for v in features.values()]
        })
        table_data['Value'].replace(np.inf, 'inf', inplace=True)
        table_data['Value'].replace(-np.inf, '-inf', inplace=True)

        # Create plot for power density distribution
        # Normalize spectral density for plot
        psd_n = psd / 1000**2 #np.sum(psd)

        psd_plot = go.Figure(
            layout={
                'xaxis_range': [0, 0.5],
                'yaxis_range': [0, 0.1],
                'xaxis_title_text': 'Frequency (Hz)',
                'yaxis_title_text': 'Power (s²/Hz)',
                'title_text': 'Periodogram',
                'legend_orientation': 'h',
            }
        )

        if use_ulf and np.sum(ulf_index) > 0:
            psd_plot.add_trace(go.Scatter(
                x=freq[ulf_index],
                y=psd_n[ulf_index],
                fill='tozeroy',
                fillcolor='purple',
                line_color='black',
                line_width=0.5,
                mode='lines',
                name='ULF',
            ))

        psd_plot.add_trace(go.Scatter(
            x=freq[vlf_index],
            y=psd_n[vlf_index],
            fill='tozeroy',
            fillcolor='grey',
            line_color='black',
            line_width=0.5,
            mode='lines',
            name='VLF',
        ))
        psd_plot.add_trace(go.Scatter(
            x=freq[lf_index],
            y=psd_n[lf_index],
            fill='tozeroy',
            fillcolor='coral',
            line_color='black',
            line_width=0.5,
            mode='lines',
            name='LF',
        ))
        psd_plot.add_trace(go.Scatter(
            x=freq[hf_index],
            y=psd_n[hf_index],
            fill='tozeroy',
            fillcolor='lightgreen',
            line_color='black',
            line_width=0.5,
            mode='lines',
            name='HF',
        ))
        psd_plot.add_trace(go.Scatter(
            x=freq[freq >= hf_limit],
            y=psd_n[freq >= hf_limit],
            fill='tozeroy',
            fillcolor='white',
            line_color='black',
            line_width=0.5,
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
