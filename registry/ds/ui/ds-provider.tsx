'use client';

import { MotionConfig } from 'motion/react';
import { createContext, use, useMemo, type ReactNode } from 'react';
import { I18nProvider, RouterProvider, useLocale } from 'react-aria-components';
import { useMediaQuery } from '@/registry/ds/hooks/use-media-query';
import { dsIcons, type DSIcons } from '@/registry/ds/lib/icons';
import {
  formatMessage,
  localeDirection,
  resolveLocale,
  type MessageDefinition,
} from '@/registry/ds/lib/i18n';
import {
  formatLabel,
  mergeLabels,
  type LabelOverrides,
  type LabelTemplate,
  type LabelTemplateValues,
  type LabelValues,
} from '@/registry/ds/lib/labels';
import type { MotionPreference, MotionProfile } from '@/registry/ds/lib/motion';

type MessageOverrides = Record<string, Record<string, string>>;

interface DSContextValue {
  labels: LabelOverrides;
  messages: MessageOverrides;
  icons: DSIcons;
  motion: MotionPreference;
  motionProfile: MotionProfile;
}

const DSContext = createContext<DSContextValue>({
  labels: {},
  messages: {},
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
  messages?: MessageOverrides;
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
  messages,
  icons,
  motion = 'system',
  motionProfile = 'expressive',
  children,
}: DSProviderProps) {
  const value = useMemo<DSContextValue>(
    () => ({
      labels: labels ?? {},
      messages: messages ?? {},
      icons: icons ? { ...dsIcons, ...icons } : dsIcons,
      motion,
      motionProfile,
    }),
    [labels, messages, icons, motion, motionProfile],
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

export function useMessages<Keys extends string>(definition: MessageDefinition<Keys>) {
  const { locale } = useLocale();
  const { messages } = use(DSContext);
  const override = messages[definition.namespace];

  return useMemo(() => {
    const catalog = definition.catalog[resolveLocale(locale)] ?? definition.catalog.en;
    const merged = override ? { ...catalog, ...override } : catalog;
    return {
      ...(merged as Record<Keys, string>),
      format: (key: Keys, values?: Record<string, string | number>) =>
        formatMessage(merged[key], values),
    };
  }, [definition, locale, override]);
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
  const { locale, direction } = useLocale();
  return direction ?? localeDirection(locale);
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
