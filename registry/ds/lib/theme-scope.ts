'use client';

import { createContext, use } from 'react';

export interface ThemeScope {
  key: string;
  mode?: 'light' | 'dark';
}

export const ThemeScopeContext = createContext<ThemeScope | null>(null);

export function useThemeScopeProps(): {
  'data-ds-scheme'?: string;
  'data-theme'?: 'light' | 'dark';
} {
  const scope = use(ThemeScopeContext);
  if (!scope) return {};
  return { 'data-ds-scheme': scope.key, ...(scope.mode ? { 'data-theme': scope.mode } : {}) };
}
