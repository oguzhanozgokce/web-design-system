'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';

export function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
) {
  const [internal, setInternal] = useState({ value: defaultValue });
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal.value;
  const latest = useRef(current);

  useLayoutEffect(() => {
    latest.current = current;
  });

  const setValue = useCallback(
    (next: T | ((previous: T) => T)) => {
      const previous = latest.current;
      const resolved = typeof next === 'function' ? (next as (previous: T) => T)(previous) : next;
      if (Object.is(resolved, previous)) return;
      latest.current = resolved;
      setInternal({ value: resolved });
      onChange?.(resolved);
    },
    [onChange],
  );

  return [current, setValue] as const;
}
