import Modal from '../common/Modal';
import ButtonInput from '../common/inputs/ButtonInput';
import Banner from './Banner';
import { useTranslator } from '../../hooks/translator';
import { useAppStore } from '../../stores/appStore';
import { TTranslationKey } from '../../helpers/types/translationTypes';
import welcomeStyle from './WelcomeModal.module.scss';

const TERM_KEYS = [
  'matching',
  'triage',
  'contextLayers',
  'vesselInfo',
  'mcpServer',
  'export',
] as const;

const TERM_ICON: Record<(typeof TERM_KEYS)[number], string> = {
  matching: '📡',
  triage: '🎯',
  contextLayers: '🗺️',
  vesselInfo: '🪪',
  mcpServer: '🤖',
  export: '📦',
};

const TERM_TITLE_KEY: Record<(typeof TERM_KEYS)[number], TTranslationKey> = {
  matching: 'sidebar.titles.matchingStatus',
  triage: 'sidebar.label.triageScore',
  contextLayers: 'detailPanel.title.contextLayers',
  vesselInfo: 'welcome.term.vesselInfo.title',
  mcpServer: 'welcome.term.mcpServer.title',
  export: 'welcome.term.export.title',
};

const STEP_KEYS = [
  'aoi',
  'timeRange',
  'runQuery',
  'inspect',
  'export',
] as const;

const PROPERTY_KEYS = [
  'secure',
  'traceable',
  'flexible',
  'lightweight',
] as const;

const PROPERTY_ICON: Record<(typeof PROPERTY_KEYS)[number], string> = {
  secure: '🔒',
  traceable: '🧭',
  flexible: '🧩',
  lightweight: '⚡',
};

const WelcomeModal = () => {
  const { t } = useTranslator();
  const hasSeenWelcome = useAppStore((s) => s.hasSeenWelcome);
  const setHasSeenWelcome = useAppStore((s) => s.setHasSeenWelcome);

  const dismiss = () => setHasSeenWelcome(true);

  return (
    <Modal
      open={!hasSeenWelcome}
      onClose={dismiss}
      title={t('welcome.title')}
      size="portrait"
      footer={
        <div className={welcomeStyle.actions}>
          <ButtonInput
            label={t('welcome.action.getStarted')}
            onClick={dismiss}
            testId="welcome-get-started-button"
          />
        </div>
      }
    >
      <div className={welcomeStyle.wrapper}>
        <header className={welcomeStyle.hero}>
          <div className={welcomeStyle.bannerFrame}>
            <Banner />
          </div>
          <p className={`font-size-base ${welcomeStyle.subtitle}`}>
            {t('welcome.subtitle')}
          </p>
          <p className={`font-size-sm ${welcomeStyle.intro}`}>
            {t('welcome.intro')}
          </p>
        </header>

        <div className={welcomeStyle.termGrid}>
          {TERM_KEYS.map((key) => (
            <div className={welcomeStyle.termCard} key={key}>
              <div className={welcomeStyle.termHeader}>
                <span className={welcomeStyle.termIcon} aria-hidden="true">
                  {TERM_ICON[key]}
                </span>
                <span
                  className={`font-size-sm font-bold font-family-header ${welcomeStyle.termLabel}`}
                >
                  {t(TERM_TITLE_KEY[key])}
                </span>
              </div>
              <span className={`font-size-sm ${welcomeStyle.termDescription}`}>
                {t(`welcome.term.${key}.description` as TTranslationKey)}
              </span>
            </div>
          ))}
        </div>

        <ol className={welcomeStyle.stepList}>
          {STEP_KEYS.map((key, index) => (
            <li className={welcomeStyle.stepItem} key={key}>
              <div className={welcomeStyle.stepHeader}>
                <span className={welcomeStyle.stepNumber} aria-hidden="true">
                  {index + 1}
                </span>
                <span
                  className={`font-size-sm font-bold font-family-header ${welcomeStyle.stepTitle}`}
                >
                  {t(`welcome.step.${key}.title` as TTranslationKey)}
                </span>
              </div>
              <span className={`font-size-sm ${welcomeStyle.stepDescription}`}>
                {t(`welcome.step.${key}.description` as TTranslationKey)}
              </span>
            </li>
          ))}
        </ol>

        <div className={welcomeStyle.propertyRow}>
          {PROPERTY_KEYS.map((key) => (
            <div className={welcomeStyle.propertyTag} key={key}>
              <div className={welcomeStyle.propertyHeader}>
                <span className={welcomeStyle.propertyIcon} aria-hidden="true">
                  {PROPERTY_ICON[key]}
                </span>
                <span
                  className={`font-size-sm font-bold font-family-header ${welcomeStyle.propertyLabel}`}
                >
                  {t(`welcome.property.${key}.title` as TTranslationKey)}
                </span>
              </div>
              <span
                className={`font-size-sm ${welcomeStyle.propertyDescription}`}
              >
                {t(`welcome.property.${key}.description` as TTranslationKey)}
              </span>
            </div>
          ))}
        </div>

        <p className={`font-size-sm ${welcomeStyle.disclaimer}`}>
          {t('welcome.disclaimer')}
        </p>
      </div>
    </Modal>
  );
};

export default WelcomeModal;
