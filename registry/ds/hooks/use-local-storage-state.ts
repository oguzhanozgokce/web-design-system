'use client';

import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';

const listeners = new Map<string, Set<() => void>>();
const missing = Symbol('missing');

function notify(key: string) {
  listeners.get(key)?.forEach((listener) => listener());
}

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function parse(raw: string | null): unknown {
  if (raw === null) return missing;
  try {
    return JSON.parse(raw);
  } catch {
    return missing;
  }
}

export function useLocalStorageState<T>(key: string, defaultValue: T) {
  const initialDefault = useRef(defaultValue);

  const subscribe = useCallback(
    (onChange: () => void) => {
      const set = listeners.get(key) ?? new Set();
      set.add(onChange);
      listeners.set(key, set);
      const onStorage = (event: StorageEvent) => {
        if (event.key === key || event.key === null) onChange();
      };
      window.addEventListener('storage', onStorage);
      return () => {
        set.delete(onChange);
        if (!set.size) listeners.delete(key);
        window.removeEventListener('storage', onStorage);
      };
    },
    [key],
  );

  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  );

  const parsed = useMemo(() => parse(raw), [raw]);
  const value = parsed === missing ? defaultValue : (parsed as T);

  const setValue = useCallback(
    (next: T | undefined | ((previous: T) => T | undefined)) => {
      const stored = parse(read(key));
      const previous = stored === missing ? initialDefault.current : (stored as T);
      const resolved =
        typeof next === 'function' ? (next as (previous: T) => T | undefined)(previous) : next;
      try {
        if (resolved === undefined) localStorage.removeItem(key);
        else localStorage.setItem(key, JSON.stringify(resolved));
      } catch {}
      notify(key);
    },
    [key],
  );

  return [value, setValue] as const;
}
