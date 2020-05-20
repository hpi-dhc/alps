import logging
import json
import pandas as pd
import numpy as np
import nolds
from scipy import sparse
from scipy.sparse.linalg import cg
from scipy.interpolate import interp1d
import plotly.graph_objects as go
from plotly.utils import PlotlyJSONEncoder

from datasets.constants import domain_types
from datasets.processing_methods.method_base import AnalysisMethodBase

LOGGER = logging.getLogger(__name__)

class NonLinearDomainAnalysis(AnalysisMethodBase):

    @classmethod
    def name(cls):
        return 'HRV Non-Linear Domain'

    @classmethod
    def domain(cls):
        return domain_types.NONLINEAR

    @classmethod
    def options(cls):
        return {}

    def process(self):
        # Get selected samples from signal
        data = pd.DataFrame()
        for each in self.analysis_samples:
            data = pd.concat([data, self.signal.samples_dataframe(each.start, each.end)])

        # Prepare data
        ibi_series = data[data.columns[0]]
        tolerance = ibi_series.std() * 0.2

        # Create dictionary with values and units
        features = {
            'SampEn': [float(nolds.sampen(ibi_series.to_numpy(), 2, tolerance)), None],
        }

        # Create dataframe for plot creation and conversion to standard format
        table_data = pd.DataFrame({
            'Variable': list(features.keys()),
            'Unit': [value[1] for value in features.values()],
            'Value': np.round([value[0] for value in features.values()], 3)
        })

        # Return results in JSON compliant format
        return {
            'table': {
                'columns': list(table_data.columns),
                'data': table_data.to_dict('records')
            }
        }
