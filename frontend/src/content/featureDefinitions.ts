
import type { FeatureCode } from '../api/types';

export interface FeatureDefinition {
  code: FeatureCode;
  definition: string;
}

export const FEATURE_DEFINITIONS: Record<FeatureCode, FeatureDefinition> = {
  la: {
    code: 'la',
    definition: 'Number of lines of code added by the commit.',
  },
  ld: {
    code: 'ld',
    definition: 'Number of lines of code deleted by the commit.',
  },
  nf: {
    code: 'nf',
    definition: 'Number of files modified by the commit.',
  },
  nd: {
    code: 'nd',
    definition: 'Number of directories modified by the commit.',
  },
  ns: {
    code: 'ns',
    definition: 'Number of subsystems modified by the commit.',
  },
  ent: {
    code: 'ent',
    definition: 'Entropy measuring how modifications are distributed across affected files.',
  },
  ndev: {
    code: 'ndev',
    definition: 'Number of distinct developers who previously modified the affected files.',
  },
  age: {
    code: 'age',
    definition: 'Average time interval since the previous modifications to the affected files.',
  },
  nuc: {
    code: 'nuc',
    definition: 'Number of distinct prior changes to the affected files.',
  },
  aexp: {
    code: 'aexp',
    definition: 'Commit author experience measured using previous commits.',
  },
  arexp: {
    code: 'arexp',
    definition: 'Commit author recent experience, based on recent development activity.',
  },
  asexp: {
    code: 'asexp',
    definition: 'Commit author experience in the subsystems affected by this change.',
  },
};
