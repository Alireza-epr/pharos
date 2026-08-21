import { EQueryStepStatus, TQueryStepId, TQueryStepStatus } from '@packages/enum';
import Modal from '../common/Modal';
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
    <Modal open={isOpen} onClose={close} title={t('queryProgress.title')} size="small">
      <ol className={` ${queryProgressStyle.list}`}>
        {steps.map((step) => {
          const key = STEP_KEY[step.id];
          // Dynamically composed from STEP_KEY/step.status, so t()'s static key
          // check can't verify these — correctness is guaranteed by construction
          // instead (every id/status pair above has a matching en.json/de.json entry).
          const label = t(`queryProgress.step.${key}.label` as TTranslationKey);
          const statusLabel = t(`queryProgress.status.${step.status}` as TTranslationKey);

          let detail: string | undefined;
          if (step.status === EQueryStepStatus.success && step.meta) {
            const vars = Object.fromEntries(
              Object.entries(step.meta).map(([k, v]) => [k, String(v)]),
            );
            detail = t(`queryProgress.step.${key}.detail` as TTranslationKey, vars);
          } else if (step.status === EQueryStepStatus.skipped && step.reason) {
            detail = t(`queryProgress.skipReason.${step.reason}` as TTranslationKey);
          } else if (step.status === EQueryStepStatus.error && step.error) {
            detail = step.error;
          }

          return (
            <li
              key={step.id}
              className={`${queryProgressStyle.row} ${queryProgressStyle[step.status] ?? ''}`}
              data-testid={`query-progress-step-${step.id}`}
              data-status={step.status}
              aria-label={`${label} — ${statusLabel}`}
            >
              <span className={` ${queryProgressStyle.icon}`} aria-hidden="true">
                {step.status === EQueryStepStatus.running ? (
                  <span className={` ${queryProgressStyle.spinner}`} />
                ) : (
                  STATUS_GLYPH[step.status]
                )}
              </span>
              <span className={` ${queryProgressStyle.text}`}>
                <span
                  className={`font-size-sm font-family-header ${queryProgressStyle.label ?? ''}`}
                >
                  {label}
                </span>
                {detail && (
                  <span
                    className={
                      step.status === EQueryStepStatus.error
                        ? `font-size-xs error`
                        : `font-size-xs font-light ${queryProgressStyle.detail ?? ''}`
                    }
                  >
                    {detail}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </Modal>
  );
};

export default QueryProgressModal;
