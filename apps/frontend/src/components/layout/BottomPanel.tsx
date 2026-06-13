import { useMemo } from 'react';
import { useEventStore } from '@/stores/eventStore';
import { useTranslator } from '@/hooks/translator';
import { EConfidenceTiers } from '@packages/enum';
import bottomPanelStyle from './BottomPanel.module.scss';
import { formatTimestamp, getSortValue, shortenText, sortEventSchema } from '@packages/utils';
import ButtonInput from '../common/inputs/ButtonInput';
import { EMatchFilter } from '@/helpers/enum/generalEnum';
import { useBottomStore } from '@/stores/bottomStore';



const confidenceBadgeClass = (tier: EConfidenceTiers, s: typeof bottomPanelStyle) => {
  if (tier === EConfidenceTiers.high) return s.badgeConfHigh;
  if (tier === EConfidenceTiers.medium) return s.badgeConfMed;
  return s.badgeConfLow;
};

const BottomPanel = () => {
  const { t } = useTranslator();
  const events = useEventStore((s) => s.events);
  const selectedEvent = useEventStore((s) => s.selectedEvent);
  const setSelectedEvent = useEventStore((s) => s.setSelectedEvent);

  const filter = useBottomStore(s => s.filter);
  const setFilter = useBottomStore(s => s.setFilter);

  const sorts = useBottomStore(s => s.sorts);
  const setSorts = useBottomStore(s => s.setSorts);

  const unmatchedCount = useMemo(() => events.filter((e) => !e.matched_flag).length, [events]);
  const matchedCount = useMemo(() => events.filter((e) => !!e.matched_flag).length, [events]);

  const filteredEvents = useMemo(() => {
    if (filter === 'unmatched') return events.filter((e) => !e.matched_flag);
    if (filter === 'matched') return events.filter((e) => !!e.matched_flag);
    return events;
  }, [events, filter]);

  const sortedEvents = useMemo(() => {
    return sortEventSchema(filteredEvents, sorts).filter((e) => !e.rejected);
  }, [filteredEvents, sorts]);

  const sortIndicator = (a_Field: string) => {
    const active = sorts.find(s => s.sortBy === a_Field);
    return (
      <span className={bottomPanelStyle.sortIndicator} data-active={!!active}>
        {active?.direction === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  const handleSortChange = (a_SortBy: string) => {
    const exists = sorts.some(s => s.sortBy === a_SortBy);
    if (exists) {
      setSorts(prev => prev.map(s => s.sortBy === a_SortBy
        ? { ...s, direction: s.direction === 'asc' ? 'desc' : 'asc' }
        : s
      ));
    } else {
      setSorts([{ sortBy: a_SortBy, direction: 'asc' }]);
    }
  }

  return (
    <div className={` ${bottomPanelStyle.wrapper}`}>
      <div className={` ${bottomPanelStyle.header}`}>
        <span className={`font-size-sm font-bold ${bottomPanelStyle.title}`}>
          {t('bottomPanel.title.detections')}
          {events.length > 0 && ` (${events.length})`}
        </span>

        {events.length > 0 && (
          <>
            <div className={` ${bottomPanelStyle.headerButtonsWrapper}`}>
              <ButtonInput
                active={filter === EMatchFilter.all}
                onClick={() => setFilter(EMatchFilter.all)}
                size='sm'
                label={t('general.label.all')}
              />
              <ButtonInput
                active={filter === 'unmatched'}
                onClick={() => setFilter(EMatchFilter.unmatched)}
                size='sm'
                label={`${t('general.label.unmatched')} ${unmatchedCount}`}
              />
              <ButtonInput
                active={filter === 'matched'}
                onClick={() => setFilter(EMatchFilter.matched)}
                size='sm'
                label={`${t('general.label.matched')} ${matchedCount}`}
              />
            </div>
            <div className={` `}>
              <ButtonInput
                onClick={() => setFilter(EMatchFilter.matched)}
                size='sm'
                label={`${t('general.label.exportAll')}`}
              />
            </div>
          </>
        )}
      </div>

      <div className={`scrollbar ${bottomPanelStyle.tableWrap}`}>
        {events.length === 0 ? (
          <div className={` ${bottomPanelStyle.emptyState}`}>
            <span className={`font-size-sm font-bold font-family-header`}>
              {t('bottomPanel.empty.title')}
            </span>
            <span className={`font-size-xs font-light font-family-header`}>
              {t('bottomPanel.empty.body')}
            </span>
          </div>
        ) : (
          <table className={` ${bottomPanelStyle.table}`}>
            <thead>
              <tr>
                <th className={`font-size-xs ${bottomPanelStyle.th}`}>#</th>
                <th className={`font-size-xs ${bottomPanelStyle.th} ${bottomPanelStyle.thSortable} ${sorts.some(s => s.sortBy === 'event_id') ? bottomPanelStyle.thActive : ''}`} onClick={() => handleSortChange("event_id")}>{t('bottomPanel.column.detectionId')}{sortIndicator('event_id')}</th>
                <th className={`font-size-xs ${bottomPanelStyle.th} ${bottomPanelStyle.thSortable} ${sorts.some(s => s.sortBy === 'lon') ? bottomPanelStyle.thActive : ''}`} onClick={() => handleSortChange("lon")}>{t('bottomPanel.column.longitude')}{sortIndicator('lon')}</th>
                <th className={`font-size-xs ${bottomPanelStyle.th} ${bottomPanelStyle.thSortable} ${sorts.some(s => s.sortBy === 'lat') ? bottomPanelStyle.thActive : ''}`} onClick={() => handleSortChange("lat")}>{t('bottomPanel.column.latitude')}{sortIndicator('lat')}</th>
                <th className={`font-size-xs ${bottomPanelStyle.th} ${bottomPanelStyle.thSortable} ${sorts.some(s => s.sortBy === 'distance_to_coast_km') ? bottomPanelStyle.thActive : ''}`} onClick={() => handleSortChange("distance_to_coast_km")}>{t('bottomPanel.column.distanceToCoast')}{sortIndicator('distance_to_coast_km')}</th>
                <th className={`font-size-xs ${bottomPanelStyle.th} ${bottomPanelStyle.thSortable} ${sorts.some(s => s.sortBy === 'context_layers.Bathymetry.enrichments[0].value') ? bottomPanelStyle.thActive : ''}`} onClick={() => handleSortChange("context_layers.Bathymetry.enrichments[0].value")}>{t('bottomPanel.column.bathymetryValue')}{sortIndicator('context_layers.Bathymetry.enrichments[0].value')}</th>
                <th className={`font-size-xs ${bottomPanelStyle.th} ${bottomPanelStyle.thSortable} ${sorts.some(s => s.sortBy === 'timestamp_utc') ? bottomPanelStyle.thActive : ''}`} onClick={() => handleSortChange("timestamp_utc")}>{t('bottomPanel.column.timestamp')}{sortIndicator('timestamp_utc')}</th>
                <th className={`font-size-xs ${bottomPanelStyle.th} ${bottomPanelStyle.thSortable} ${sorts.some(s => s.sortBy === 'confidence_proxy') ? bottomPanelStyle.thActive : ''}`} onClick={() => handleSortChange("confidence_proxy")}>{t('bottomPanel.column.confidenceProxy')}{sortIndicator('confidence_proxy')}</th>
                <th className={`font-size-xs ${bottomPanelStyle.th} ${bottomPanelStyle.thSortable} ${sorts.some(s => s.sortBy === 'scoring.triage_score') ? bottomPanelStyle.thActive : ''}`} onClick={() => handleSortChange("scoring.triage_score")}>{t('bottomPanel.column.triageScore')}{sortIndicator('scoring.triage_score')}</th>
                <th className={`font-size-xs ${bottomPanelStyle.th} ${bottomPanelStyle.thSortable} ${sorts.some(s => s.sortBy === 'scoring.uncertainty_score') ? bottomPanelStyle.thActive : ''}`} onClick={() => handleSortChange("scoring.uncertainty_score")}>{t('bottomPanel.column.uncertaintyScore')}{sortIndicator('scoring.uncertainty_score')}</th>
                <th className={`font-size-xs ${bottomPanelStyle.th} ${bottomPanelStyle.thSortable} ${sorts.some(s => s.sortBy === 'confidence_tier') ? bottomPanelStyle.thActive : ''}`} onClick={() => handleSortChange("confidence_tier")}>{t('bottomPanel.column.confidenceTier')}{sortIndicator('confidence_tier')}</th>
                <th className={`font-size-xs ${bottomPanelStyle.th} ${bottomPanelStyle.thSortable} ${sorts.some(s => s.sortBy === 'matched_flag') ? bottomPanelStyle.thActive : ''}`} onClick={() => handleSortChange("matched_flag")}>{t('sidebar.titles.matchingStatus')}{sortIndicator('matched_flag')}</th>
                <th className={`font-size-xs ${bottomPanelStyle.th}`}>{t('bottomPanel.column.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {sortedEvents.map((event, index) => {
                const isSelected = selectedEvent?.event_id === event.event_id;
                return (
                  <tr
                    key={event.event_id}
                    className={`${bottomPanelStyle.tr} ${isSelected ? bottomPanelStyle.trSelected : ''}`}
                    onClick={() => setSelectedEvent(isSelected ? null : event)}
                  >
                    <td className={`font-size-xs ${bottomPanelStyle.tdMuted}`}>{index + 1}</td>
                    <td className={`font-size-xs ${bottomPanelStyle.td} ${isSelected ? bottomPanelStyle.bold : ''}`}>
                      {shortenText(event.event_id, 10)}
                    </td>
                    <td className={`font-size-xs ${bottomPanelStyle.td}`}>{event.lon.toFixed(3)}</td>
                    <td className={`font-size-xs ${bottomPanelStyle.td}`}>{event.lat.toFixed(3)}</td>
                    <td className={`font-size-xs ${bottomPanelStyle.td}`}>{event.distance_to_coast_km.toFixed(1)}</td>
                    <td className={`font-size-xs ${bottomPanelStyle.tdMuted}`}>{getSortValue(event, 'context_layers.Bathymetry.enrichments[0].value') ?? '—'}</td>
                    <td className={`font-size-xs ${bottomPanelStyle.td}`}>{formatTimestamp(new Date(event.timestamp_utc))}</td>
                    <td className={`font-size-xs ${bottomPanelStyle.tdMuted}`}>{event.confidence_proxy ?? '—'}</td>
                    <td className={`font-size-xs ${bottomPanelStyle.tdMuted}`}>{event.scoring.triage_score?.toFixed(2) ?? '—'}</td>
                    <td className={`font-size-xs ${bottomPanelStyle.tdMuted}`}>{event.scoring.uncertainty_score?.toFixed(2) ?? '—'}</td>
                    <td className={`font-size-xs ${bottomPanelStyle.td}`}>
                      <span className={`${bottomPanelStyle.badge} ${confidenceBadgeClass(event.confidence_tier, bottomPanelStyle)}`}>
                        {event.confidence_tier}
                      </span>
                    </td>
                    <td className={`font-size-xs ${bottomPanelStyle.td}`}>
                      <span className={`${bottomPanelStyle.badge} ${event.matched_flag ? bottomPanelStyle.badgeMatched : bottomPanelStyle.badgeUnmatched}`}>
                        {event.matched_flag ? t('general.label.matched') : t('general.label.unmatched')}
                      </span>
                    </td>
                    <td className={`font-size-xs ${bottomPanelStyle.tdAction}`}>
                      <ButtonInput
                        label={isSelected
                          ? `← ${t('bottomPanel.action.selected')}`
                          : `${t('bottomPanel.action.details')} →`}
                        size='sm'
                      />
                      <ButtonInput
                        label={`${t('bottomPanel.action.export')} \u21E9`}
                        size='sm'
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BottomPanel;
