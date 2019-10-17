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
});

export const session = new schema.Entity('sessions', {
  datasets: [dataset],
  analysisSamples: [analysisSample],
});

export const subject = new schema.Entity('subjects', {
  sessions: [session],
});
