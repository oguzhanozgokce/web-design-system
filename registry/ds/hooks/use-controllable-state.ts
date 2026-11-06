'use client';

import { useCallback, useState } from 'react';

export function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
) {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;

  const setValue = useCallback(
    (next: T | ((previous: T) => T)) => {
      const resolved = typeof next === 'function' ? (next as (previous: T) => T)(current) : next;
      if (Object.is(resolved, current)) return;
      if (!isControlled) setInternal(resolved);
      onChange?.(resolved);
    },
    [current, isControlled, onChange],
  );

  return [current, setValue] as const;
}
