import { EConfidenceTiers } from '@packages/enum';

export const confidenceBadgeClass = (a_Tier: EConfidenceTiers) => {
  if (a_Tier === EConfidenceTiers.high) return 'badge-conf-high';
  if (a_Tier === EConfidenceTiers.medium) return 'badge-conf-med';
  return 'badge-conf-low';
};
