'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

export function useMediaQuery(query: string, serverValue = false) {
  const list = useMemo(
    () => (typeof window === 'undefined' ? null : window.matchMedia(query)),
    [query],
  );
  const subscribe = useCallback(
    (onChange: () => void) => {
      list?.addEventListener('change', onChange);
      return () => list?.removeEventListener('change', onChange);
    },
    [list],
  );
  const getSnapshot = useCallback(() => list?.matches ?? serverValue, [list, serverValue]);
  return useSyncExternalStore(subscribe, getSnapshot, () => serverValue);
}
