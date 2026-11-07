import {
  clampPage,
  getPageNumbers,
  getPaginationEntries,
  getPaginationSlots,
} from '@/registry/ds/lib/pagination';

describe('pagination helpers', () => {
  it('clamps pages into range', () => {
    expect(clampPage(0, 5)).toBe(1);
    expect(clampPage(9, 5)).toBe(5);
    expect(clampPage(2.6, 5)).toBe(3);
    expect(clampPage(3, 0)).toBe(1);
  });

  it('shows every page when they fit', () => {
    expect(getPageNumbers(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(getPageNumbers(1, 1)).toEqual([1]);
    expect(getPageNumbers(1, 0)).toEqual([]);
  });

  it('collapses the far side into an ellipsis and keeps the slot count', () => {
    expect(getPageNumbers(1, 20)).toEqual([1, 2, 3, 4, 5, null, 20]);
    expect(getPageNumbers(4, 20)).toEqual([1, 2, 3, 4, 5, null, 20]);
    expect(getPageNumbers(5, 20)).toEqual([1, null, 4, 5, 6, null, 20]);
    expect(getPageNumbers(16, 20)).toEqual([1, null, 15, 16, 17, null, 20]);
    expect(getPageNumbers(17, 20)).toEqual([1, null, 16, 17, 18, 19, 20]);
    expect(getPageNumbers(20, 20)).toEqual([1, null, 16, 17, 18, 19, 20]);
    for (let current = 1; current <= 20; current++) {
      expect(getPageNumbers(current, 20)).toHaveLength(7);
      expect(getPageNumbers(current, 20, 2)).toHaveLength(9);
      expect(getPageNumbers(current, 20, 0)).toHaveLength(5);
    }
  });

  it('never hides a single page behind an ellipsis', () => {
    for (let total = 1; total <= 30; total++) {
      for (let current = 1; current <= total; current++) {
        const numbers = getPageNumbers(current, total);
        numbers.forEach((value, index) => {
          if (value !== null) return;
          const before = numbers[index - 1] as number;
          const after = numbers[index + 1] as number;
          expect(after - before).toBeGreaterThan(2);
        });
      }
    }
  });

  it('gives ellipses stable keys and merges wide and compact layouts', () => {
    const entries = getPaginationEntries(10, 20);
    expect(entries.filter((entry) => entry.type === 'ellipsis').map((entry) => entry.key)).toEqual([
      'gap-5',
      'gap-15.5',
    ]);
    const slots = getPaginationSlots(10, 20, 1);
    expect(slots.filter((slot) => slot.isWide).map((slot) => slot.entry.key)).toEqual(
      getPaginationEntries(10, 20, 1).map((entry) => entry.key),
    );
    expect(slots.filter((slot) => slot.isCompact).map((slot) => slot.entry.key)).toEqual(
      getPaginationEntries(10, 20, 0).map((entry) => entry.key),
    );
  });
});
