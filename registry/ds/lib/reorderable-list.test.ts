import { reorderItems } from '@/registry/ds/lib/reorderable-list';

const items = ['a', 'b', 'c', 'd'].map((id) => ({ id }));
const getKey = (item: (typeof items)[number]) => item.id;

describe('reorderItems', () => {
  it.each([
    ['a', 'c', 'after', ['b', 'c', 'a', 'd']],
    ['d', 'b', 'before', ['a', 'd', 'b', 'c']],
    ['d', 'a', 'after', ['a', 'd', 'b', 'c']],
    ['a', 'd', 'before', ['b', 'c', 'a', 'd']],
  ] as const)('moves %s %s %s without changing the original', (key, target, position, expected) => {
    const next = reorderItems(items, new Set([key]), target, position, getKey);
    expect(next.map(getKey)).toEqual(expected);
    expect(items.map(getKey)).toEqual(['a', 'b', 'c', 'd']);
    expect(next.find((item) => item.id === key)).toBe(items.find((item) => item.id === key));
  });

  it('preserves the original relative order of multiple moved items', () => {
    const next = reorderItems(items, new Set(['d', 'b']), 'a', 'before', getKey);
    expect(next.map(getKey)).toEqual(['b', 'd', 'a', 'c']);
  });

  it.each([
    ['a', 'a', 'after'],
    ['a', 'b', 'before'],
    ['b', 'a', 'after'],
    ['missing', 'a', 'before'],
    ['a', 'missing', 'after'],
  ] as const)('keeps the same array for a no-op (%s, %s, %s)', (key, target, position) => {
    expect(reorderItems(items, new Set([key]), target, position, getKey)).toBe(items);
  });
});
