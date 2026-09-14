import { useMemo, useState } from 'react';
import { useEventStore } from '../../stores/eventStore';
import { useTranslator } from '../../hooks/translator';
import { useVisibleEvents } from '../../hooks/useVisibleEvents';
import bottomPanelStyle from './BottomPanel.module.scss';
import { formatTimestamp, getSortValue, shortenText } from '@packages/utils';
import ButtonInput from '../common/inputs/ButtonInput';
import Modal from '../common/Modal';
import { useBottomStore } from '../../stores/bottomStore';
import { confidenceBadgeClass } from '../../helpers/utils/cssUtils';
import { getMatchingStatus } from '../../helpers/utils/eventUtils';
import { EMatchFilter } from '@packages/enum';

const BottomPanel = () => {
  const { t } = useTranslator();
  const events = useEventStore((s) => s.events);
  const activeEvent = useEventStore((s) => s.activeEvent);
  const setActiveEvent = useEventStore((s) => s.setActiveEvent);
  const selectedEvents = useEventStore((s) => s.selectedEvents);
  const setSelectedEvents = useEventStore((s) => s.setSelectedEvents);

  const filter = useBottomStore((s) => s.filter);
  const setFilter = useBottomStore((s) => s.setFilter);

  const sorts = useBottomStore((s) => s.sorts);
  const setSorts = useBottomStore((s) => s.setSorts);

  const [maximized, setMaximized] = useState(false);

  const unmatchedCount = useMemo(
    () => events.filter((e) => !e.matched_flag).length,
    [events],
  );
  const matchedCount = useMemo(
    () => events.filter((e) => !!e.matched_flag).length,
    [events],
  );

  // Filtered by the matched/unmatched tab, sorted by the active column,
  // rejected events dropped — shared with DetailTab so its Next/Prev buttons
  // step through this exact same order.
  const sortedEvents = useVisibleEvents();

  const sortIndicator = (a_Field: string) => {
    const active = sorts.find((s) => s.sortBy === a_Field);
    return (
      <span className={bottomPanelStyle.sortIndicator} data-active={!!active}>
        {active?.direction === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  const handleSortChange = (a_SortBy: string) => {
    const exists = sorts.some((s) => s.sortBy === a_SortBy);
    if (exists) {
      setSorts((prev) =>
        prev.map((s) =>
          s.sortBy === a_SortBy
            ? { ...s, direction: s.direction === 'asc' ? 'desc' : 'asc' }
            : s,
        ),
      );
    } else {
      setSorts([{ sortBy: a_SortBy, direction: 'asc' }]);
    }
  };

  // A sortable column header -- <th onClick> alone isn't keyboard-operable,
  // so this centralises the tabIndex/onKeyDown/aria-sort additions instead
  // of repeating them across every column below. Deliberately no
  // role="button" override, same call as the row below: a <th> already has
  // a meaningful native role (columnheader) for table navigation, and
  // aria-sort is the correct way to expose "this one's sortable/active" --
  // overriding the role would throw that navigation away for no benefit.
  const sortableHeader = (a_Field: string, a_Label: string) => {
    const active = sorts.find((s) => s.sortBy === a_Field);
    return (
      <th
        className={`focus font-size-xs ${bottomPanelStyle.th} ${bottomPanelStyle.thSortable} ${active ? bottomPanelStyle.thActive : ''}`}
        onClick={() => handleSortChange(a_Field)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSortChange(a_Field);
          }
        }}
        tabIndex={0}
        aria-sort={
          active
            ? active.direction === 'asc'
              ? 'ascending'
              : 'descending'
            : undefined
        }
      >
        {a_Label}
        {sortIndicator(a_Field)}
      </th>
    );
  };

  const handleExportClick = (a_EventId: string) => {
    const event = selectedEvents.find((e) => e.event_id === a_EventId);
    if (!event) {
      const eventToAdd = events.find((e) => e.event_id === a_EventId);
      if (eventToAdd) setSelectedEvents((prev) => [...prev, eventToAdd]);
    } else {
      setSelectedEvents((prev) =>
        prev.filter((e) => e.event_id !== event.event_id),
      );
    }
  };

  const detectionsTable = (
    <table className={`font-family-base ${bottomPanelStyle.table}`}>
      <thead>
        <tr>
          <th className={`font-size-xs ${bottomPanelStyle.th}`}>#</th>
          {sortableHeader('event_id', t('bottomPanel.column.detectionId'))}
          {sortableHeader('lon', t('bottomPanel.column.longitude'))}
          {sortableHeader('lat', t('bottomPanel.column.latitude'))}
          {sortableHeader(
            'distance_to_coast_km',
            t('sidebar.label.distanceToCoast'),
          )}
          {sortableHeader(
            'context_layers.Bathymetry.enrichments[0].value',
            t('sidebar.label.bathymetry'),
          )}
          {sortableHeader('timestamp_utc', t('bottomPanel.column.timestamp'))}
          {sortableHeader(
            'confidence_proxy',
            t('bottomPanel.column.confidenceProxy'),
          )}
          {sortableHeader(
            'scoring.triage_score',
            t('sidebar.label.triageScore'),
          )}
          {sortableHeader(
            'scoring.uncertainty_score',
            t('sidebar.label.uncertaintyScore'),
          )}
          {sortableHeader(
            'confidence_tier',
            t('bottomPanel.column.confidenceTier'),
          )}
          {sortableHeader('matched_flag', t('sidebar.titles.matchingStatus'))}
          <th className={`font-size-xs ${bottomPanelStyle.th}`}>
            {t('bottomPanel.column.actions')}
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedEvents.map((event, index) => {
          const isSelected = activeEvent?.event_id === event.event_id;
          const isExported = selectedEvents.find(
            (e) => e.event_id === event.event_id,
          );
          return (
            <tr
              key={event.event_id}
              className={`focus ${bottomPanelStyle.tr} ${isSelected ? bottomPanelStyle.trSelected : ''}`}
              data-testid="detection-row"
              data-selected={isSelected}
              aria-selected={isSelected}
              tabIndex={0}
              onClick={() => setActiveEvent(isSelected ? null : event)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveEvent(isSelected ? null : event);
                }
              }}
            >
              <td className={`font-size-xs ${bottomPanelStyle.tdMuted}`}>
                {index + 1}
              </td>
              <td
                className={`font-size-xs ${bottomPanelStyle.td}`}
                data-testid="detection-row-id"
              >
                <span title={event.event_id}>
                  {shortenText(event.event_id, 10)}
                </span>
              </td>
              <td className={`font-size-xs ${bottomPanelStyle.td}`}>
                {event.lon.toFixed(3)}
              </td>
              <td className={`font-size-xs ${bottomPanelStyle.td}`}>
                {event.lat.toFixed(3)}
              </td>
              <td className={`font-size-xs ${bottomPanelStyle.td}`}>
                {event.distance_to_coast_km.toFixed(1)}
              </td>
              <td className={`font-size-xs ${bottomPanelStyle.tdMuted}`}>
                {getSortValue(
                  event,
                  'context_layers.Bathymetry.enrichments[0].value',
                ) ?? '—'}
              </td>
              <td className={`font-size-xs ${bottomPanelStyle.td}`}>
                {formatTimestamp(new Date(event.timestamp_utc))}
              </td>
              <td className={`font-size-xs ${bottomPanelStyle.tdMuted}`}>
                {event.confidence_proxy ?? '—'}
              </td>
              <td className={`font-size-xs ${bottomPanelStyle.tdMuted}`}>
                {event.scoring.triage_score?.toFixed(2) ?? '—'}
              </td>
              <td className={`font-size-xs ${bottomPanelStyle.tdMuted}`}>
                {event.scoring.uncertainty_score?.toFixed(2) ?? '—'}
              </td>
              <td className={`font-size-xs ${bottomPanelStyle.td}`}>
                <span
                  className={`badge ${confidenceBadgeClass(event.confidence_tier)}`}
                >
                  {event.confidence_tier}
                </span>
              </td>
              <td className={`font-size-xs ${bottomPanelStyle.td}`}>
                <span
                  className={`badge ${event.matched_flag ? 'badge-matched' : 'badge-unmatched'}`}
                >
                  {getMatchingStatus(event, t)}
                </span>
              </td>
              <td
                className={`font-size-xs ${bottomPanelStyle.tdAction}`}
                onClick={(e) => e.stopPropagation()}
              >
                <ButtonInput
                  active={isSelected}
                  icon
                  label={isSelected ? '←' : '→'}
                  title={
                    isSelected
                      ? t('bottomPanel.action.selected')
                      : t('bottomPanel.action.details')
                  }
                  onClick={() => setActiveEvent(isSelected ? null : event)}
                  size="sm"
                  testId="event-details-button"
                />
                <ButtonInput
                  active={!!isExported}
                  icon
                  label={isExported ? '✓' : '+'}
                  title={
                    isExported
                      ? t('detailPanel.action.removeFromExport')
                      : t('detailPanel.action.addToExport')
                  }
                  onClick={() => handleExportClick(event.event_id)}
                  size="sm"
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  const caveatBar = (
    <div className={bottomPanelStyle.caveatBar}>
      <span className={`font-size-xs caveat`}>
        ⚠ {t('detailPanel.text.dataLimitationBody')}
      </span>
    </div>
  );

  const emptyState = (
    <div className={` ${bottomPanelStyle.emptyState}`}>
      <span className={`font-size-sm font-bold font-family-header`}>
        {t('bottomPanel.empty.title')}
      </span>
      <span className={`font-size-xs font-light font-family-header`}>
        {t('bottomPanel.empty.body')}
      </span>
    </div>
  );

  return (
    <div className={` ${bottomPanelStyle.wrapper}`}>
      <div className={` ${bottomPanelStyle.header}`}>
        <span
          className={`font-size-sm font-bold ${bottomPanelStyle.title}`}
          data-testid="detections-title"
        >
          {t('bottomPanel.title.detections')}
          {events.length > 0 && ` (${events.length})`}
        </span>

        {events.length > 0 && (
          <>
            <div className={` ${bottomPanelStyle.headerButtonsWrapper}`}>
              <ButtonInput
                active={filter === EMatchFilter.all}
                onClick={() => setFilter(EMatchFilter.all)}
                size="sm"
                label={t('general.label.all')}
              />
              <ButtonInput
                active={filter === 'unmatched'}
                onClick={() => setFilter(EMatchFilter.unmatched)}
                size="sm"
                label={`${t('general.label.unmatched')} ${unmatchedCount}`}
              />
              <ButtonInput
                active={filter === 'matched'}
                onClick={() => setFilter(EMatchFilter.matched)}
                size="sm"
                label={`${t('general.label.matched')} ${matchedCount}`}
              />
            </div>
            <div className={` ${bottomPanelStyle.headerButtonsWrapper}`}>
              <ButtonInput
                onClick={() => setSelectedEvents([...events])}
                size="sm"
                label={`${t('general.label.exportAll')}`}
              />
              <ButtonInput
                onClick={() => setMaximized(true)}
                size="sm"
                label={`⤢ ${t('general.label.maximize')}`}
                testId="maximize-panel-button"
              />
            </div>
          </>
        )}
      </div>

      {events.length > 0 && caveatBar}

      <div className={`scrollbar ${bottomPanelStyle.tableWrap}`}>
        {events.length === 0 ? emptyState : detectionsTable}
      </div>

      <Modal
        open={maximized}
        onClose={() => setMaximized(false)}
        title={`${t('bottomPanel.title.detections')}${events.length > 0 ? ` (${events.length})` : ''}`}
      >
        {caveatBar}
        {detectionsTable}
      </Modal>
    </div>
  );
};

export default BottomPanel;
