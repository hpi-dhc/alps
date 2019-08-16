import { createSelector } from 'reselect';
import { filterObjectByValue } from '../utils';

export const getIsLoading = (state) => state.data.isLoading;
export const getError = (state) => state.data.error;

export const getProcessingMethods = (state) => state.data.processingMethods;
export const getInstalledProcessingMethods = createSelector(
  getProcessingMethods,
  (methods) => filterObjectByValue(methods, (each) => each.installed)
);

export const getSources = (state) => state.data.sources;
export const getInstalledSources = createSelector(
  getSources,
  (sources) => filterObjectByValue(sources, (each) => each.installed)
);

export const getSubjects = (state) => state.data.subjects;
export const getSubjectsArray = createSelector(getSubjects, subjects => Object.values(subjects));

export const getSessions = (state) => state.data.sessions;
export const getSessionsArrayBySubject = createSelector(
  getSubjects, getSessions,
  (subjects, sessions) => {
    return Object.values(subjects).reduce((sessionsBySubject, subject) => ({
      ...sessionsBySubject,
      [subject.id]: subject.sessions.reduce((subjectSessions, each) => {
        if (sessions[each]) subjectSessions.push(sessions[each]);
        return subjectSessions;
      }, []),
    }), {});
  }
);

export const getDatasets = (state) => state.data.datasets;
export const getDatasetsArrayBySession = createSelector(
  getSessions, getDatasets,
  (sessions, datasets) => {
    return Object.values(sessions).reduce((datasetsBySession, session) => ({
      ...datasetsBySession,
      [session.id]: session.datasets.reduce((sessionDatasets, each) => {
        if (datasets[each]) sessionDatasets.push(datasets[each]);
        return sessionDatasets;
      }, []),
    }), {});
  }
);

export const getAllSignals = (state) => state.data.signals;
export const getSignals = createSelector(
  getAllSignals,
  (signals) => filterObjectByValue(signals, (each) => each.type !== 'TAG')
);
export const getIBISignals = createSelector(
  getSignals,
  (signals) => filterObjectByValue(signals, (each) => ['NNI', 'RRI'].includes(each.type))
);
export const getTagSignalsArrayBySession = createSelector(
  getDatasets, getAllSignals,
  (datasets, signals) => {
    const tagSignals = filterObjectByValue(signals, (each) => each.type === 'TAG');
    return Object.values(tagSignals).reduce((tagSignalsBySession, tagSignal) => {
      const session = datasets[tagSignal.dataset].session;
      const tagsOfSession = tagSignalsBySession[session] ? [...tagSignalsBySession[session], tagSignal] : [tagSignal];
      return {
        ...tagSignalsBySession,
        [session]: tagsOfSession,
      };
    }, {});
  }
);

export const getRawFiles = (state) => state.data.rawFiles;

export const getAnalysisLabels = (state) => state.data.analysisLabels;

export const getAnalysisResults = (state) => state.data.analysisResults;

export const getAnalysisSamples = (state) => state.data.analysisSamples;
export const getAnalysisSamplesArrayBySession = createSelector(
  getSessions, getAnalysisSamples,
  (sessions, analysisSamples) => {
    return Object.values(sessions).reduce((analysisSamplesBySession, session) => ({
      ...analysisSamplesBySession,
      [session.id]: session.analysisSamples.reduce((sessionAnalysisSamples, each) => {
        if (analysisSamples[each]) sessionAnalysisSamples.push(analysisSamples[each]);
        return sessionAnalysisSamples;
      }, []),
    }), {});
  }
);
