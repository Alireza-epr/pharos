import { IConfigJSON } from '@packages/types';
import { useHistoryStore } from '../src/stores/historyStore';
import { IHistoryEntry } from '../src/helpers/types/storeTypes';

const DEFAULT_STATE = useHistoryStore.getState();

const makeEntry = (id: string): IHistoryEntry => ({
  id,
  tab: 'report',
  timestamp: new Date().toISOString(),
  success: true,
  resultCount: 1,
  config: {} as IConfigJSON,
  result: { events: [], pagination: null },
});

describe('useHistoryStore', () => {
  afterEach(() => {
    useHistoryStore.setState(DEFAULT_STATE, true);
  });

  it('prepends_new_entries_so_the_most_recent_run_is_first', () => {
    useHistoryStore.getState().addEntry(makeEntry('a'));
    useHistoryStore.getState().addEntry(makeEntry('b'));

    expect(useHistoryStore.getState().entries.map((e) => e.id)).toEqual([
      'b',
      'a',
    ]);
  });

  it('caps_entries_at_20_dropping_the_oldest', () => {
    for (let i = 0; i < 25; i++) {
      useHistoryStore.getState().addEntry(makeEntry(String(i)));
    }

    const { entries } = useHistoryStore.getState();
    expect(entries).toHaveLength(20);
    // Most recent (24) first; oldest kept is 5 (0-4 dropped).
    expect(entries[0]!.id).toBe('24');
    expect(entries[19]!.id).toBe('5');
  });

  it('clearHistory_empties_the_list', () => {
    useHistoryStore.getState().addEntry(makeEntry('a'));
    useHistoryStore.getState().clearHistory();

    expect(useHistoryStore.getState().entries).toEqual([]);
  });
});
