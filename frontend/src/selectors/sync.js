import DataFrame from 'dataframe-js';
import { createSelector } from 'reselect';
import { getAllSignals } from './data';

export const getIsLoading = (state) => state.sync.isLoading;
export const getError = (state) => state.sync.error;
export const getReference = (state) => state.sync.reference;
export const getSelectedSignals = (state) => state.sync.signals;
export const getSamples = (state) => state.sync.samples;
export const getDomain = (state) => state.sync.domain;
export const getParams = (state) => state.sync.params;
export const getSegments = (state) => state.sync.segments;
export const getOptions = (state) => state.sync.options;

export const getReferenceDate = createSelector(
  getAllSignals, getReference, getSelectedSignals,
  (allSignals, reference, selectedSignals) => {
    if (!reference) return undefined;
    const referenceSignal = selectedSignals[reference];
    if (!referenceSignal) return undefined;
    return new Date(allSignals[referenceSignal].firstTimestamp);
  }
);

export const getPlotData = createSelector(
  getSamples,
  (samples) => {
    const dataFrames = Object.entries(samples).reduce((data, [dataset, signalSamples]) => {
      if (signalSamples && signalSamples.length) {
        let datasetDf = new DataFrame(signalSamples, Object.keys(signalSamples[0]));
        datasetDf = datasetDf.rename('y', 'y-' + dataset);
        datasetDf = datasetDf.rename('mean', 'mean-' + dataset);
        datasetDf = datasetDf.rename('range', 'range-' + dataset);
        data[dataset] = datasetDf;
      }
      return data;
    }, {});

    const plotDataFrame = Object.values(dataFrames).reduce(
      (df, each) => df.fullJoin(each, 'x'),
      new DataFrame([], ['x'])
    );
    return plotDataFrame.toCollection();
  }
);

export const canGetParameters = createSelector(
  getIsLoading, getReference, getSelectedSignals,
  (isLoading, reference, signals) => {
    return !isLoading &&
      Boolean(reference) &&
      Object.values(signals).filter(each => !!each).length > 1;
  }
);

export const getParametersForSync = createSelector(
  getSelectedSignals, getParams,
  (signals, params) => Object.entries(signals).reduce((object, [dataset, signal]) => {
    if (signal && params[dataset]) {
      object[dataset] = params[dataset];
    }
    return object;
  }, {})
);

export const canSyncSignals = createSelector(
  getIsLoading, getParametersForSync, getReferenceDate,
  (isLoading, paramsForSync, referenceDate) => {
    return !isLoading &&
      referenceDate &&
      Object.keys(paramsForSync).length > 1;
  }
);
