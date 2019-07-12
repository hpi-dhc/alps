import { schema } from 'normalizr';

export const source = new schema.Entity('sources');

export const sourceList = [source];

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
});

export const subject = new schema.Entity('subjects', {
  sessions: [session],
});

export const subjectList = [subject];
