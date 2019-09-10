import { createSelector } from 'reselect';
import { getAnalysisResults } from './data';

export const getSelectedSnapshot = (state) => state.analysis.selectedSnapshot;
export const getSelectedLabel = (state) => state.analysis.selectedLabel;
export const getSelectedSignals = (state) => state.analysis.selectedSignals;
export const getSelectedMethods = (state) => state.analysis.selectedMethods;
export const getMethodConfigurations = (state) => state.analysis.methodConfigurations;

export const canRunAnalysis = createSelector(
  getSelectedLabel, getSelectedSignals, getSelectedMethods,
  (label, signals, methods) => !!label && signals.length > 0 && methods.length > 0
);

export const getSelectedResults = createSelector(
  getAnalysisResults, getSelectedSnapshot, getSelectedLabel, getSelectedSignals, getSelectedMethods,
  (results, snapshot, label, signals, methods) => {
    if (typeof results !== 'object') return [];
    console.log('all results', snapshot);
    return Object.values(results).filter((each) => {
      return each.snapshot === snapshot &&
        each.label === label &&
        methods.includes(each.method) &&
        signals.includes(each.signal);
    });
  }
);

export const getSelectedResultsByMethod = createSelector(
  getSelectedResults,
  (results) => {
    console.log('selected results', results);
    return results.reduce((byMethod, each) => {
      if (!byMethod[each.method]) {
        byMethod[each.method] = [];
      }
      return {
        ...byMethod,
        [each.method]: [...byMethod[each.method], each],
      };
    }, {});
  }
);
