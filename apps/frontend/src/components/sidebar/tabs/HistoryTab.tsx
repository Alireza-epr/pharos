import sidebarStyle from '../Sidebar.module.scss';
import Section from '../../common/section/Section';
import SectionInputGroup from '../../common/section/SectionInputGroup';
import List from '../../common/List';
import ListItem from '../../common/ListItem';
import ButtonInput from '../../common/inputs/ButtonInput';
import { useTranslator } from '../../../hooks/translator';
import { useHistoryStore } from '../../../stores/historyStore';
import { applyHistoryEntry } from '../../../helpers/utils/historyUtils';
import { ESidebarTab } from '../../../helpers/enum/storeEnum';
import { IHistoryEntry } from '../../../helpers/types/storeTypes';
import { formatTimestamp } from '@packages/utils';

const HistoryTab = () => {
  const { t } = useTranslator();
  const entries = useHistoryStore((s) => s.entries);
  const clearHistory = useHistoryStore((s) => s.clearHistory);

  const reportEntries = entries.filter((e) => e.tab === ESidebarTab.report);
  const vesselEntries = entries.filter((e) => e.tab === ESidebarTab.vessel);
  const eventEntries = entries.filter((e) => e.tab === ESidebarTab.event);

  const renderEntries = (a_Entries: IHistoryEntry[]) => (
    <List testId="history-list">
      {a_Entries.map((entry) => (
        <ListItem
          key={entry.id}
          title={formatTimestamp(new Date(entry.timestamp))}
          subtitle={
            entry.success
              ? t('historyPanel.subtitle.resultCount', {
                count: String(entry.resultCount),
              })
              : t('historyPanel.subtitle.failed')
          }
          subtitleError={!entry.success}
          testId="history-entry"
          action={
            <ButtonInput
              label={t('historyPanel.action.apply')}
              size="sm"
              onClick={() => void applyHistoryEntry(entry)}
              testId="history-apply-button"
            />
          }
        />
      ))}
    </List>
  );

  const renderEmpty = (a_Title: string, a_Body: string) => (
    <div className={` ${sidebarStyle.emptyState}`}>
      <span className={`font-size-sm font-bold font-family-header`}>
        {a_Title}
      </span>
      <span className={`font-size-xs font-light font-family-header`}>
        {a_Body}
      </span>
    </div>
  );

  const hasAnyEntries = entries.length > 0;

  return (
    <>
      <div className={`scrollbar ${sidebarStyle.scrollArea}`}>
        <Section title={t('sidebar.tab.report')} collapsible={false}>
          {reportEntries.length > 0
            ? renderEntries(reportEntries)
            : renderEmpty(
              t('historyPanel.empty.title'),
              t('historyPanel.empty.body'),
            )}
        </Section>

        <Section title={t('sidebar.tab.vessel')} collapsible={false}>
          {vesselEntries.length > 0
            ? renderEntries(vesselEntries)
            : renderEmpty(
              t('historyPanel.empty.titleVessel'),
              t('historyPanel.empty.bodyVessel'),
            )}
        </Section>

        <Section title={t('sidebar.tab.event')} collapsible={false}>
          {eventEntries.length > 0
            ? renderEntries(eventEntries)
            : renderEmpty(
              t('historyPanel.empty.titleEvent'),
              t('historyPanel.empty.bodyEvent'),
            )}
        </Section>
      </div>
      <div className={` ${sidebarStyle.footer}`}>
        <SectionInputGroup direction="row">
          <ButtonInput
            label={t('general.label.clear')}
            onClick={clearHistory}
            disabled={!hasAnyEntries}
            testId="history-clear-button"
          />
        </SectionInputGroup>
      </div>
    </>
  );
};

export default HistoryTab;
