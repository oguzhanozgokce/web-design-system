'use client';

import { useSyncExternalStore } from 'react';

export type KbdPlatform = 'apple' | 'other';

interface NavigatorWithUAData extends Navigator {
  userAgentData?: { platform?: string };
}

function subscribe() {
  return () => {};
}

function detectPlatform(): KbdPlatform {
  const nav = navigator as NavigatorWithUAData;
  const platform = nav.userAgentData?.platform || nav.platform || nav.userAgent;
  return /mac|iphone|ipad|ipod/i.test(platform) ? 'apple' : 'other';
}

function serverPlatform(): KbdPlatform | undefined {
  return undefined;
}

export function useKbdPlatform(override?: KbdPlatform): KbdPlatform | undefined {
  const detected = useSyncExternalStore(subscribe, detectPlatform, serverPlatform);
  return override ?? detected;
}
