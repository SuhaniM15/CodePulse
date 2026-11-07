// The ONLY place feature definitions may live. Do not write feature names or
// definitions anywhere else (including the Check a commit form, which shows
// feature codes only). Every definition stays "To be confirmed" until the
// team verifies it against the ApacheJIT paper.

import type { FeatureCode } from '../api/types';

export const TO_BE_CONFIRMED = 'To be confirmed';

export interface FeatureDefinition {
  code: FeatureCode;
  definition: string;
}

export const FEATURE_DEFINITIONS: Record<FeatureCode, FeatureDefinition> = {
  la: { code: 'la', definition: TO_BE_CONFIRMED },
  ld: { code: 'ld', definition: TO_BE_CONFIRMED },
  nf: { code: 'nf', definition: TO_BE_CONFIRMED },
  nd: { code: 'nd', definition: TO_BE_CONFIRMED },
  ns: { code: 'ns', definition: TO_BE_CONFIRMED },
  ent: { code: 'ent', definition: TO_BE_CONFIRMED },
  ndev: { code: 'ndev', definition: TO_BE_CONFIRMED },
  age: { code: 'age', definition: TO_BE_CONFIRMED },
  nuc: { code: 'nuc', definition: TO_BE_CONFIRMED },
  aexp: { code: 'aexp', definition: TO_BE_CONFIRMED },
  arexp: { code: 'arexp', definition: TO_BE_CONFIRMED },
  asexp: { code: 'asexp', definition: TO_BE_CONFIRMED },
};
