import {
  EQueryStepStatus,
  TQueryStepId,
  TQueryStepStatus,
} from '@packages/enum';
import Modal from '../common/Modal';
import List from '../common/List';
import ListItem from '../common/ListItem';
import { useTranslator } from '../../hooks/translator';
import { useQueryProgressStore } from '../../stores/queryProgressStore';
import { TTranslationKey } from '../../helpers/types/translationTypes';
import queryProgressStyle from './QueryProgressModal.module.scss';

// TQueryStepId values are kebab-case ("cache-check"); en.json/de.json key
// segments are camelCase (queryProgress.step.cacheCheck.*) — this is the one
// place that bridges the two, so it stays the single source of truth for it.
const STEP_KEY: Record<TQueryStepId, string> = {
  validate: 'validate',
  'cache-check': 'cacheCheck',
  'fetch-provider': 'fetchProvider',
  'write-cache': 'writeCache',
  'read-cache': 'readCache',
  'filter-scope': 'filterScope',
  'filter-predicates': 'filterPredicates',
  hotspots: 'hotspots',
  paginate: 'paginate',
};

const STATUS_GLYPH: Record<TQueryStepStatus, string> = {
  pending: '○',
  running: '',
  success: '✓',
  skipped: '–',
  error: '✕',
};

const QueryProgressModal = () => {
  const { t } = useTranslator();
  const isOpen = useQueryProgressStore((s) => s.isOpen);
  const steps = useQueryProgressStore((s) => s.steps);
  const close = useQueryProgressStore((s) => s.close);

  return (
    <Modal
      open={isOpen}
      onClose={close}
      title={t('queryProgress.title')}
      size="small"
    >
      <List>
        {steps.map((step) => {
          const key = STEP_KEY[step.id];
          const label = t(`queryProgress.step.${key}.label` as TTranslationKey);
          const statusLabel = t(
            `queryProgress.status.${step.status}` as TTranslationKey,
          );

          let detail: string | undefined;
          if (step.status === EQueryStepStatus.success && step.meta) {
            const vars = Object.fromEntries(
              Object.entries(step.meta).map(([k, v]) => [k, String(v)]),
            );
            detail = t(
              `queryProgress.step.${key}.detail` as TTranslationKey,
              vars,
            );
          } else if (step.status === EQueryStepStatus.skipped && step.reason) {
            detail = t(
              `queryProgress.skipReason.${step.reason}` as TTranslationKey,
            );
          } else if (step.status === EQueryStepStatus.error && step.error) {
            detail = step.error;
          }

          return (
            <ListItem
              key={step.id}
              mode="plain"
              title={label}
              subtitle={detail}
              testId={`query-progress-step-${step.id}`}
              attributes={{
                'data-status': step.status,
                'aria-label': `${label} — ${statusLabel}`,
              }}
              prepend={
                <span className={queryProgressStyle.icon} aria-hidden="true">
                  {step.status === EQueryStepStatus.running ? (
                    <span className={queryProgressStyle.spinner} />
                  ) : (
                    STATUS_GLYPH[step.status]
                  )}
                </span>
              }
            />
          );
        })}
      </List>
    </Modal>
  );
};

export default QueryProgressModal;
