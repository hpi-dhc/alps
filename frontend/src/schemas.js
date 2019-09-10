import { schema } from 'normalizr';

export const processingMethod = new schema.Entity('processingMethods');

export const source = new schema.Entity('sources');

export const analysisSnapshot = new schema.Entity('analysisSnapshots');

export const analysisLabel = new schema.Entity('analysisLabels');

export const analysisSample = new schema.Entity('analysisSamples');

export const analysisResult = new schema.Entity('analysisResults');

export const signal = new schema.Entity('signals');

export const rawFile = new schema.Entity('rawFiles');

export const dataset = new schema.Entity('datasets', {
  signals: [signal],
  rawFiles: [rawFile],
}, {
  processStrategy: (entity) => {
    // eslint-disable-next-line camelcase
    const { raw_files, ...rest } = entity;
    return {
      ...rest,
      rawFiles: raw_files,
    };
  },
});

export const session = new schema.Entity('sessions', {
  datasets: [dataset],
  analysisSamples: [analysisSample],
}, {
  processStrategy: (entity) => {
    // eslint-disable-next-line camelcase
    const { analysis_samples, ...rest } = entity;
    return {
      ...rest,
      analysisSamples: analysis_samples,
    };
  },
});

export const subject = new schema.Entity('subjects', {
  sessions: [session],
});
