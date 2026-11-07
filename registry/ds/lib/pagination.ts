export type PaginationEntry =
  { type: 'page'; key: string; page: number } | { type: 'ellipsis'; key: string; position: number };

export interface PaginationSlot {
  entry: PaginationEntry;
  isWide: boolean;
  isCompact: boolean;
}

function range(start: number, end: number) {
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
}

export function clampPage(page: number, pageCount: number) {
  if (pageCount < 1) return 1;
  return Math.min(Math.max(1, Math.round(page)), pageCount);
}

export function getPageNumbers(page: number, pageCount: number, siblingCount = 1) {
  const total = Math.max(0, Math.floor(pageCount));
  const siblings = Math.max(0, Math.floor(siblingCount));
  const current = clampPage(page, total);
  if (siblings * 2 + 5 >= total) return range(1, total);

  const start = Math.max(current - siblings, 1);
  const end = Math.min(current + siblings, total);
  const startGap = start > 3;
  const endGap = end < total - 2;
  const edge = 3 + 2 * siblings;

  if (!startGap && endGap) return [...range(1, edge), null, total];
  if (startGap && !endGap) return [1, null, ...range(total - edge + 1, total)];
  return [1, null, ...range(start, end), null, total];
}

export function getPaginationEntries(
  page: number,
  pageCount: number,
  siblingCount = 1,
): PaginationEntry[] {
  const numbers = getPageNumbers(page, pageCount, siblingCount);
  return numbers.map((value, index) => {
    if (value != null) return { type: 'page', key: `page-${value}`, page: value };
    const before = numbers[index - 1] ?? 0;
    const after = numbers[index + 1] ?? before;
    const position = (before + after) / 2;
    return { type: 'ellipsis', key: `gap-${position}`, position };
  });
}

function positionOf(entry: PaginationEntry) {
  return entry.type === 'page' ? entry.page : entry.position;
}

export function getPaginationSlots(
  page: number,
  pageCount: number,
  siblingCount = 1,
): PaginationSlot[] {
  const wide = getPaginationEntries(page, pageCount, siblingCount);
  const compact = getPaginationEntries(page, pageCount, 0);
  const slots = new Map<string, PaginationSlot>();
  for (const entry of wide) slots.set(entry.key, { entry, isWide: true, isCompact: false });
  for (const entry of compact) {
    const slot = slots.get(entry.key);
    if (slot) slot.isCompact = true;
    else slots.set(entry.key, { entry, isWide: false, isCompact: true });
  }
  return [...slots.values()].sort((a, b) => positionOf(a.entry) - positionOf(b.entry));
}
