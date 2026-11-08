import type { Key } from 'react-aria-components';

export function reorderItems<T>(
  items: T[],
  keys: ReadonlySet<Key>,
  targetKey: Key,
  position: 'before' | 'after',
  getKey: (item: T) => Key,
): T[] {
  if (keys.has(targetKey)) return items;
  const moved: T[] = [];
  const remaining: T[] = [];
  for (const item of items) {
    (keys.has(getKey(item)) ? moved : remaining).push(item);
  }
  const target = remaining.findIndex((item) => getKey(item) === targetKey);
  if (!moved.length || target < 0) return items;
  const insertion = target + (position === 'after' ? 1 : 0);
  const next = [...remaining.slice(0, insertion), ...moved, ...remaining.slice(insertion)];
  return next.every((item, index) => item === items[index]) ? items : next;
}
