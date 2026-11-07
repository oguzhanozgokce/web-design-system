import type { Key } from 'react-aria-components';
import {
  compareValues,
  getPageCount,
  matchesFilterValue,
  mergePageSelection,
  paginateRows,
  scopeSelection,
  searchRows,
  sortRows,
  textOf,
} from '@/registry/ds/lib/data-table';

describe('data table helpers', () => {
  const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

  it('compares numbers, dates, text and empty values', () => {
    expect(compareValues(2, 10, collator)).toBeLessThan(0);
    expect(compareValues('Item 2', 'Item 10', collator)).toBeLessThan(0);
    expect(compareValues(new Date(2026, 0, 2), new Date(2026, 0, 1), collator)).toBeGreaterThan(0);
    expect(compareValues(null, 'a', collator)).toBeGreaterThan(0);
    expect(compareValues('a', '', collator)).toBeLessThan(0);
    expect(compareValues('Écran', 'ecran', collator)).toBe(0);
  });

  it('sorts stably in both directions', () => {
    const rows = [
      { id: 'a', group: 1 },
      { id: 'b', group: 2 },
      { id: 'c', group: 1 },
    ];
    const byGroup = (left: (typeof rows)[number], right: (typeof rows)[number]) =>
      left.group - right.group;
    expect(sortRows(rows, byGroup, 'ascending').map((row) => row.id)).toEqual(['a', 'c', 'b']);
    expect(sortRows(rows, byGroup, 'descending').map((row) => row.id)).toEqual(['b', 'a', 'c']);
  });

  it('searches every term, ignoring case and accents', () => {
    const rows = ['Café Menu', 'Weather Lite', 'Music Pro'];
    expect(searchRows(rows, 'cafe', (row) => row)).toEqual(['Café Menu']);
    expect(searchRows(rows, 'lite weather', (row) => row)).toEqual(['Weather Lite']);
    expect(searchRows(rows, '  ', (row) => row)).toEqual(rows);
  });

  it('does not turn Turkish dotted I into dotless I before matching', () => {
    const rows = ['\u0130stanbul', 'Isparta', '\u0130zmir'];
    expect(searchRows(rows, 'istanbul', (row) => row, 'tr')).toEqual(['\u0130stanbul']);
    expect(searchRows(rows, '\u0131sparta', (row) => row, 'tr')).toEqual(['Isparta']);
  });

  it('matches filter values in lists and objects', () => {
    expect(matchesFilterValue(['iOS', 'Web'], 'Web')).toBe(true);
    expect(matchesFilterValue([{ id: 'ios', label: 'iOS' }], 'ios')).toBe(true);
    expect(matchesFilterValue('live', 'draft')).toBe(false);
    expect(textOf({ label: 'Beta' })).toBe('Beta');
  });

  it('pages and keeps selection from other pages', () => {
    expect(getPageCount(12, 5)).toBe(3);
    expect(getPageCount(0, 5)).toBe(1);
    expect(paginateRows([1, 2, 3, 4, 5, 6], 2, 4)).toEqual([5, 6]);
    expect([...mergePageSelection(new Set(['a', 'd']), new Set(['b']), ['a', 'b', 'c'])]).toEqual([
      'd',
      'b',
    ]);
    expect([...mergePageSelection(new Set(['d']), 'all', ['a', 'b'])]).toEqual(['d', 'a', 'b']);
    expect([...(scopeSelection(new Set(['a', 'z']), ['a', 'b']) as Set<Key>)]).toEqual(['a']);
  });
});
