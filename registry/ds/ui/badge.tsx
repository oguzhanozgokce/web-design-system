'use client';

import { createContext, use, useMemo, type ComponentProps, type ReactNode } from 'react';
import { useLocale } from 'react-aria-components';
import { formatLabel, type LabelTemplate } from '@/registry/ds/lib/labels';
import { tv } from '@/registry/ds/lib/utils';
import { useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';

export const badgeStyles = tv({
  base: 'inline-flex shrink-0 items-center justify-center rounded-full font-medium whitespace-nowrap tabular-digits select-none',
  variants: {
    size: {
      small: 'size-1.5',
      large: 'h-4 min-w-4 px-1 text-label-sm',
    },
    tone: {
      error: 'bg-error text-on-error',
      primary: 'bg-primary text-on-primary',
      success: 'bg-success text-on-success',
      warning: 'bg-warning text-on-warning',
      neutral: 'bg-inverse-surface text-inverse-on-surface',
    },
    placement: {
      inline: 'relative align-middle',
      rectangular: 'pointer-events-none absolute',
      circular:
        'pointer-events-none absolute inset-s-[85.4%] top-[14.6%] -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2',
    },
    animated: {
      true: 'transition-[scale,opacity] duration-(--ds-duration-spatial-fast) ease-spatial-fast starting:scale-0 starting:opacity-0 motion-reduce:transition-none',
      false: '',
    },
  },
  compoundVariants: [
    { placement: 'rectangular', size: 'small', class: 'inset-e-0 top-0' },
    {
      placement: 'rectangular',
      size: 'large',
      class: 'inset-s-[calc(100%-0.75rem)] -top-0.5',
    },
  ],
  defaultVariants: {
    size: 'large',
    tone: 'error',
    placement: 'inline',
    animated: false,
  },
});

export const badgeAnchorStyles = tv({
  base: 'relative inline-flex shrink-0 align-middle',
});

export type BadgeTone = 'error' | 'primary' | 'success' | 'warning' | 'neutral';

export type BadgeOverlap = 'rectangular' | 'circular';

const BadgeAnchorContext = createContext<BadgeOverlap | null>(null);

export interface BadgeLabels {
  count: LabelTemplate<{ count: string }>;
  dot: string;
  overflow: LabelTemplate<{ max: string }>;
}

export const defaultBadgeLabels: BadgeLabels = {
  count: '{count} new',
  dot: 'New',
  overflow: '{max}+',
};

export interface BadgeProps extends Omit<ComponentProps<'span'>, 'children'> {
  count?: number;
  max?: number;
  showZero?: boolean;
  tone?: BadgeTone;
  label?: string;
  labels?: Partial<BadgeLabels>;
  children?: ReactNode;
}

function hasVisibleContent(node: ReactNode) {
  return node != null && node !== false && node !== '';
}

export function Badge({
  count,
  max = 99,
  showZero = false,
  tone = 'error',
  label,
  labels,
  children,
  className,
  ...props
}: BadgeProps) {
  const overlap = use(BadgeAnchorContext);
  const t = useLabels('badge', defaultBadgeLabels, labels);
  const { locale } = useLocale();
  const { spatialEnabled } = useMotionPreference();
  const formatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  if (count != null && count <= 0 && !showZero) return null;

  const value =
    count == null
      ? undefined
      : count > max
        ? t.format('overflow', { max: formatter.format(max) })
        : formatter.format(Math.max(0, count));
  const content = value ?? children;
  const size = hasVisibleContent(content) ? 'large' : 'small';
  const announced =
    label != null
      ? formatLabel(label, { count: value ?? '' })
      : value != null
        ? t.format('count', { count: value })
        : size === 'small'
          ? t.dot
          : undefined;

  return (
    <span
      {...props}
      data-slot="badge"
      data-size={size}
      data-tone={tone}
      className={badgeStyles({
        size,
        tone,
        placement: overlap ?? 'inline',
        animated: spatialEnabled && overlap != null,
        className,
      })}
    >
      {size === 'large' ? (
        <span data-slot="badge-label" aria-hidden={announced != null ? true : undefined}>
          {content}
        </span>
      ) : null}
      {announced != null ? <span className="sr-only">{announced}</span> : null}
    </span>
  );
}

export interface BadgeAnchorProps extends Omit<ComponentProps<'span'>, 'children'> {
  badge: ReactNode;
  overlap?: BadgeOverlap;
  children: ReactNode;
}

export function BadgeAnchor({
  badge,
  overlap = 'rectangular',
  className,
  children,
  ...props
}: BadgeAnchorProps) {
  return (
    <span
      {...props}
      data-slot="badge-anchor"
      data-overlap={overlap}
      className={badgeAnchorStyles({ className })}
    >
      {children}
      <BadgeAnchorContext value={overlap}>{badge}</BadgeAnchorContext>
    </span>
  );
}
