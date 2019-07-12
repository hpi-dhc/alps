import { createSelector } from 'reselect';
import { filterObjectByValue } from '../utils';

export const getIsLoading = (state) => state.data.isLoading;
export const getError = (state) => state.data.error;

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

export const getSignals = (state) => state.data.signals;
export const getTagSignals = createSelector(
  getSignals,
  (signals) => filterObjectByValue(signals, (each) => each.type === 'TAG')
);

export const getRawFiles = (state) => state.data.rawFiles;
