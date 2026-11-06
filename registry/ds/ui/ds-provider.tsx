'use client';

import { MotionConfig } from 'motion/react';
import { createContext, use, useMemo, type ReactNode } from 'react';
import { I18nProvider, RouterProvider, useLocale } from 'react-aria-components';
import { useMediaQuery } from '@/registry/ds/hooks/use-media-query';
import { dsIcons, type DSIcons } from '@/registry/ds/lib/icons';
import {
  formatLabel,
  mergeLabels,
  type LabelOverrides,
  type LabelTemplate,
  type LabelTemplateValues,
  type LabelValues,
} from '@/registry/ds/lib/labels';
import type { MotionPreference, MotionProfile } from '@/registry/ds/lib/motion';

interface DSContextValue {
  labels: LabelOverrides;
  icons: DSIcons;
  motion: MotionPreference;
  motionProfile: MotionProfile;
}

const DSContext = createContext<DSContextValue>({
  labels: {},
  icons: dsIcons,
  motion: 'system',
  motionProfile: 'expressive',
});

type RouterNavigate = (href: string, options?: unknown) => void;

export interface DSProviderProps {
  locale?: string;
  navigate?: RouterNavigate;
  useHref?: (href: string) => string;
  labels?: LabelOverrides;
  icons?: Partial<DSIcons>;
  motion?: MotionPreference;
  motionProfile?: MotionProfile;
  children: ReactNode;
}

export function DSProvider({
  locale = 'en',
  navigate,
  useHref,
  labels,
  icons,
  motion = 'system',
  motionProfile = 'expressive',
  children,
}: DSProviderProps) {
  const value = useMemo<DSContextValue>(
    () => ({
      labels: labels ?? {},
      icons: icons ? { ...dsIcons, ...icons } : dsIcons,
      motion,
      motionProfile,
    }),
    [labels, icons, motion, motionProfile],
  );

  const content = (
    <DSContext value={value}>
      <MotionConfig reducedMotion={motion === 'system' ? 'user' : 'always'}>
        {children}
      </MotionConfig>
    </DSContext>
  );

  return (
    <I18nProvider locale={locale}>
      {navigate ? (
        <RouterProvider navigate={navigate} useHref={useHref}>
          {content}
        </RouterProvider>
      ) : (
        content
      )}
    </I18nProvider>
  );
}

export function useDS() {
  return use(DSContext);
}

export function useIcons() {
  return use(DSContext).icons;
}

export function useLabels<T extends object>(namespace: string, defaults: T, labels?: Partial<T>) {
  const overrides = use(DSContext).labels[namespace] as Partial<T> | undefined;
  const merged = mergeLabels(defaults, overrides, labels);
  return {
    ...merged,
    format<K extends keyof T>(key: K, values: LabelTemplateValues<T[K]>) {
      return formatLabel(merged[key] as LabelTemplate, values as LabelValues);
    },
  };
}

export function useDirection() {
  return useLocale().direction;
}

export function useMotionPreference() {
  const { motion, motionProfile } = use(DSContext);
  const systemReduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const spatial = motion === 'system' && !systemReduced;
  return {
    preference: motion,
    profile: motionProfile,
    spatialEnabled: spatial,
    effectsEnabled: motion !== 'disabled',
    decorativeEnabled: spatial,
  };
}
