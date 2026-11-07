import type { Key, Selection, SortDescriptor } from 'react-aria-components';

export type DataTableAccessor<T> = keyof T | ((row: T) => unknown);

export type DataTableFilterValues = Record<string, Key | null | undefined>;

export function readValue<T>(row: T, accessor: DataTableAccessor<T> | undefined): unknown {
  if (accessor == null) return undefined;
  return typeof accessor === 'function' ? accessor(row) : row[accessor];
}

export function toDate(value: unknown): Date | null {
  if (value == null || value === '') return null;
  const date = value instanceof Date ? value : new Date(value as string | number);
  return Number.isNaN(date.getTime()) ? null : date;
}

function primitive(value: unknown): string | number | boolean | null {
  if (value == null) return null;
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) return value.map((item) => textOf(item)).join(', ');
  return textOf(value);
}

export function textOf(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(textOf).join(' ');
  if (typeof value === 'object' && 'label' in value) return textOf(value.label);
  return String(value);
}

export function compareValues(a: unknown, b: unknown, collator: Intl.Collator) {
  const left = primitive(a);
  const right = primitive(b);
  if (left === right) return 0;
  if (left === null || left === '') return 1;
  if (right === null || right === '') return -1;
  if (typeof left === 'number' && typeof right === 'number') return left - right;
  if (typeof left === 'boolean' && typeof right === 'boolean') return left ? 1 : -1;
  return collator.compare(String(left), String(right));
}

export function sortRows<T>(
  rows: readonly T[],
  compare: (a: T, b: T) => number,
  direction: SortDescriptor['direction'],
) {
  const sign = direction === 'descending' ? -1 : 1;
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => compare(a.row, b.row) * sign || a.index - b.index)
    .map((entry) => entry.row);
}

export function normalizeSearch(value: string, locale?: string) {
  return value
    .toLocaleLowerCase(locale)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}

export function searchRows<T>(
  rows: readonly T[],
  query: string,
  getText: (row: T) => string,
  locale?: string,
) {
  const terms = normalizeSearch(query, locale).split(/\s+/).filter(Boolean);
  if (!terms.length) return [...rows];
  return rows.filter((row) => {
    const text = normalizeSearch(getText(row), locale);
    return terms.every((term) => text.includes(term));
  });
}

export function matchesFilterValue(value: unknown, selected: Key) {
  const target = String(selected);
  if (Array.isArray(value)) {
    return value.some((item) => {
      if (item != null && typeof item === 'object' && 'id' in item)
        return String(item.id) === target;
      return textOf(item) === target;
    });
  }
  if (value != null && typeof value === 'object' && 'id' in value) {
    return String(value.id) === target;
  }
  return textOf(value) === target;
}

export function hasActiveFilters(values: DataTableFilterValues | undefined) {
  return Object.values(values ?? {}).some((value) => value != null);
}

export function getPageCount(total: number, pageSize: number) {
  if (pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(total / pageSize));
}

export function paginateRows<T>(rows: readonly T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

export function scopeSelection(selection: Selection, pageKeys: readonly Key[]): Selection {
  if (selection === 'all') return 'all';
  return new Set(pageKeys.filter((key) => selection.has(key)));
}

export function mergePageSelection(
  previous: Selection,
  next: Selection,
  pageKeys: readonly Key[],
  allKeys?: Iterable<Key>,
): Set<Key> {
  const page = new Set(pageKeys);
  const before = previous === 'all' ? new Set(allKeys ?? pageKeys) : previous;
  const chosen = next === 'all' ? page : next;
  const merged = new Set<Key>();
  for (const key of before) if (!page.has(key)) merged.add(key);
  for (const key of chosen) merged.add(key);
  return merged;
}

export function selectionSize(selection: Selection, total: number) {
  return selection === 'all' ? total : selection.size;
}
