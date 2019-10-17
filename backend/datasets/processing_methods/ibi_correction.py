import pandas as pd
import numpy as np

from datasets.processing_methods.method_base import FilterMethodBase

class IBICorrection(FilterMethodBase):
    @classmethod
    def name(cls):
        return 'IBI Correction'

    @classmethod
    def options(cls):
        return {
            'threshold': {
                'title': 'Threshold',
                'type': 'number',
                'unit': '%',
                'default': 20,
            },
            'max_ibi': {
                'title': 'Maximal IBI',
                'type': 'number',
                'unit': 'ms',
                'default': 2500,
            },
            'min_ibi': {
                'title': 'Minimal IBI',
                'type': 'number',
                'unit': 'ms',
                'default': 250,
            }
        }

    def process(self):
        threshold = np.float(self.configuration.get('threshold', 20)) / 100
        max_ibi = self.configuration.get('max_ibi', 2500)
        min_ibi = self.configuration.get('min_ibi', 250)

        column = self.samples.columns[0]
        ibi = self.samples[column]

        # filter according to threshold compared to previous and next
        ibi_next = ibi.shift(-1, fill_value=ibi[-1])
        ibi_prev = ibi.shift(1, fill_value=ibi[0])
        ibi_upper = ibi + (ibi * threshold)
        ibi_lower = ibi - (ibi * threshold)
        # delete ibi intervals that differ by more than 20% compared to next and previous interval
        ibi_to_delete = ((ibi_next > ibi_upper) | (ibi_next < ibi_lower)) & ((ibi_prev > ibi_upper) | (ibi_prev < ibi_lower))
        ibi[ibi_to_delete] = np.nan

        # ibi values above lower and upper limit
        out_of_range_index = (ibi > max_ibi) | (ibi < min_ibi)
        ibi[out_of_range_index] = np.nan

        return {
            'series': ibi.dropna(),
            'info': f'Removed {ibi.isna().sum()} artefacts.'
        }
