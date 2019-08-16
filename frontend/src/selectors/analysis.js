import { createSelector } from 'reselect';

export const getSelectedLabel = (state) => state.analysis.selectedLabel;
export const getSelectedSignals = (state) => state.analysis.selectedSignals;
export const getSelectedMethods = (state) => state.analysis.selectedMethods;
export const getMethodConfigurations = (state) => state.analysis.methodConfigurations;

export const canRunAnalysis = createSelector(
  getSelectedLabel, getSelectedSignals, getSelectedMethods,
  (label, signals, methods) => !!label && signals.length > 0 && methods.length > 0
);
