import { schema } from 'normalizr'

export const source = new schema.Entity('sources')

export const sourceList = [source]

export const signal = new schema.Entity('signals')

export const rawFile = new schema.Entity('rawFiles')

export const dataset = new schema.Entity('datasets', {
  signals: [signal],
  raw_files: [rawFile]
})

export const session = new schema.Entity('sessions', {
  datasets: [dataset]
})

export const subject = new schema.Entity('subjects', {
  sessions: [session]
})

export const subjectList = [subject]
