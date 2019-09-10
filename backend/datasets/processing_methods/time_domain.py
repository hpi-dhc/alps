import logging
import json
import pandas as pd
import numpy as np
from scipy import sparse
from scipy.sparse.linalg import cg
from scipy.interpolate import interp1d
import plotly.graph_objects as go
from plotly.utils import PlotlyJSONEncoder

from datasets.constants import domain_types
from datasets.processing_methods.method_base import AnalysisMethodBase

LOGGER = logging.getLogger(__name__)

def detrendingKubios(RR_interval, lambda_v=300):

    z = np.matrix(RR_interval).T
    T = len(z)
    I = np.ones([T - 2, 1])
    v = [1, -2, 1]
    data = I * v
    II = sparse.eye(T)

    D2 = sparse.spdiags(data.transpose(), [0, 1, 2], T - 2, T)
    D2 = sparse.lil_matrix(D2)
    D2[-2, -2] = 1
    D2[-1, -2] = -2
    D2[-1, -1] = 1
    D2 = sparse.csc_matrix(D2)

    DD = II + ((lambda_v**2) * (D2.T * D2))
    DD = sparse.csc_matrix(DD)

    # start = time()
    xx_tmp = cg(DD, z)
    # print(time() - start)

    xx = xx_tmp[0]
    z_stat = II * z - np.matrix(xx).T
    return z_stat.T.tolist()[0]


class TimeDomainAnalysis(AnalysisMethodBase):

    @classmethod
    def name(cls):
        return 'HRV Time Domain'

    @classmethod
    def domain(cls):
        return domain_types.TIME

    @classmethod
    def options(cls):
        return {
            'hr_window': {
                'title': 'Min/max HR as average of',
                'type': 'number',
                'unit': 'beats',
                'default': 5,
                'limits': [1, 1000]
            },
            'threshold': {
                'title': 'Threshold for NNxx',
                'type': 'number',
                'unit': 'ms',
                'default': 50
            }
        }

    def process(self):
        # Get selected samples from signal
        data = pd.DataFrame()
        for each in self.analysis_samples:
            data = pd.concat([data, self.signal.samples_dataframe(each.start, each.end)])

        # Read parameters from configuration
        nn_threshold = self.configuration['threshold']
        window = self.configuration['hr_window']

        # Prepare data
        ibi_series = data[data.columns[0]]
        instantaneous_hr = 60 / (ibi_series / 1000)
        rolling_mean_hr = instantaneous_hr.rolling(window).mean()
        rolling_24h = ibi_series.rolling('5min')

        # Precalculate data for standard indexes
        nn_diff = np.diff(ibi_series)
        nn_xx = np.sum(np.abs(nn_diff) > nn_threshold)

        # Precalculate data for geometrical indexes
        bin_size = 7.8125
        hist_middle = (ibi_series.min() + ibi_series.max()) / 2
        hist_bound_lower = hist_middle - bin_size * np.ceil((hist_middle - ibi_series.min()) / bin_size)
        hist_length = int(np.ceil((ibi_series.max() - hist_bound_lower) / bin_size) + 1)
        hist_bins = hist_bound_lower + np.arange(hist_length) * bin_size
        hist, _ = np.histogram(ibi_series, hist_bins)
        hist_height = np.max(hist)

        # Calculate TINN measure
        hist_max_index = np.argmax(hist)
        min_n = 0
        min_m = len(hist) - 1
        min_error = np.finfo(np.float64).max
        # Ignore bins that do not contain any intervals
        nonzero_indices = np.nonzero(hist)
        for n in range(hist_max_index):
            for m in reversed(range(hist_max_index + 1, len(hist))):
                # Create triangular interpolation function for n and m
                tri_interp = interp1d(
                    [n, hist_max_index, m],
                    [0, hist[hist_max_index], 0],
                    bounds_error=False,
                    fill_value=0
                )
                # Square difference of histogram and triangle
                error = np.trapz(
                    [(hist[t] - tri_interp(t)) ** 2 for t in nonzero_indices],
                    [hist_bins[t] for t in nonzero_indices]
                )
                if min_error > error:
                    min_n = n
                    min_m = m
                    min_error = error
        n = hist_bins[min_n]
        m = hist_bins[min_m]

        # Create dictionary with values and units
        features = {
            'Mean NN': [ibi_series.mean(), 'ms'],
            'Mean HR': [instantaneous_hr.mean(), 'bpm'],
            'Max HR': [rolling_mean_hr.max(), 'bpm'],
            'Min HR': [rolling_mean_hr.min(), 'bpm'],
            'STD HR': [instantaneous_hr.std(), 'bpm'],
            'SDNN': [np.std(ibi_series), 'ms'],
            'SDNN index': [rolling_24h.std().mean(), 'ms'],
            'SDANN': [rolling_24h.mean().std(), 'ms'],
            'RMSSD': [np.sqrt(np.mean(nn_diff ** 2)), 'ms'],
            f'NN{nn_threshold}': [nn_xx, None],
            f'pNN{nn_threshold}': [nn_xx / len(ibi_series) * 100, '%'],
            'HRV triangular index': [len(ibi_series) / hist_height, None],
            'TINN': [m - n, 'ms'],
        }

        # Create dataframe for plot creation and conversion to standard format
        table_data = pd.DataFrame({
            'Variable': list(features.keys()),
            'Unit': [value[1] for value in features.values()],
            'Value': np.round([value[0] for value in features.values()], 3)
        })

        distribution_plot = go.Figure(
            layout={
                'xaxis_title_text': 'IBI (ms)',
                'title_text': 'Distribution',
                'legend_orientation': 'h',
            }
        )
        distribution_plot.add_trace(go.Histogram(
            x=ibi_series.values,
            xbins={
                'start': hist_bins[0],
                'end': hist_bins[-1],
                'size': bin_size,
            },
            name='Interval distribution'
        ))
        distribution_plot.add_trace(go.Scatter(
            x=[
                n + bin_size / 2,
                hist_bins[hist_max_index] + bin_size / 2,
                m + bin_size / 2
            ],
            y=[0, hist_height, 0],
            name='TINN',
            mode='lines',
            line_color='Crimson',
            hoverinfo='none',
        ))

        # Return results in JSON compliant format
        return {
            'table': {
                'columns': list(table_data.columns),
                'data': table_data.to_dict('records')
            },
            'plot': json.loads(json.dumps(distribution_plot, cls=PlotlyJSONEncoder))
        }
