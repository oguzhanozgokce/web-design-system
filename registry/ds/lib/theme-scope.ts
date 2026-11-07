'use client';

import { createContext, use } from 'react';
import type { MotionPreference, MotionProfile } from '@/registry/ds/lib/motion';

export interface ThemeScope {
  key: string;
  mode?: 'light' | 'dark';
}

export const ThemeScopeContext = createContext<ThemeScope | null>(null);

export const MotionScopeContext = createContext<{
  motion: MotionPreference;
  motionProfile: MotionProfile;
}>({ motion: 'system', motionProfile: 'expressive' });

export function useThemeScopeProps(): {
  'data-ds-scheme'?: string;
  'data-theme'?: 'light' | 'dark';
  'data-ds-motion': MotionPreference;
  'data-motion-profile': MotionProfile;
} {
  const scope = use(ThemeScopeContext);
  const { motion, motionProfile } = use(MotionScopeContext);
  return {
    ...(scope ? { 'data-ds-scheme': scope.key, 'data-theme': scope.mode } : {}),
    'data-ds-motion': motion,
    'data-motion-profile': motionProfile,
  };
}
