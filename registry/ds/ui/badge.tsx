'use client';

import { createContext, use, useMemo, type ComponentProps, type ReactNode } from 'react';
import { useLocale } from 'react-aria-components';
import { formatLabel, type LabelTemplate } from '@/registry/ds/lib/labels';
import { tv } from '@/registry/ds/lib/utils';
import { useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';

const seam = 'pointer-events-none absolute ring-2 ring-[color:var(--ds-badge-seam,var(--canvas))]';

export const badgeStyles = tv({
  base: 'inline-flex shrink-0 items-center justify-center rounded-control font-medium whitespace-nowrap tabular-digits select-none',
  variants: {
    variant: {
      solid: '',
      soft: '',
    },
    tone: {
      error: '',
      primary: '',
      neutral: '',
      success: '',
      warning: '',
      info: '',
    },
    size: {
      sm: '',
      md: '',
    },
    isDot: {
      true: '',
      false: '',
    },
    placement: {
      inline: 'relative align-middle',
      rectangular: `${seam} top-0 inset-e-0 translate-x-1/4 -translate-y-1/4 rtl:-translate-x-1/4`,
      circular: `${seam} inset-s-[85.4%] top-[14.6%] -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2`,
    },
    animated: {
      true: 'transition-[scale,opacity] duration-(--ds-duration-spatial-fast) ease-(--ds-ease-spatial-fast) starting:scale-0 starting:opacity-0 motion-reduce:transition-none',
      false: '',
    },
  },
  compoundVariants: [
    { isDot: false, size: 'sm', class: 'h-4 min-w-4 px-1 text-[0.625rem] leading-none' },
    { isDot: false, size: 'md', class: 'h-5 min-w-5 px-1.5 text-xs' },
    { isDot: true, size: 'sm', class: 'size-1.5' },
    { isDot: true, size: 'md', class: 'size-2' },
    { variant: 'solid', tone: 'error', class: 'bg-error-solid text-on-error-solid' },
    { variant: 'solid', tone: 'primary', class: 'bg-primary-solid text-on-primary-solid' },
    { variant: 'solid', tone: 'neutral', class: 'bg-inverse-surface text-inverse-on-surface' },
    { variant: 'solid', tone: 'success', class: 'bg-success-solid text-on-success-solid' },
    { variant: 'solid', tone: 'warning', class: 'bg-warning-solid text-on-warning-solid' },
    { variant: 'solid', tone: 'info', class: 'bg-info-solid text-on-info-solid' },
    { variant: 'soft', isDot: false, tone: 'error', class: 'bg-error-soft text-on-error-soft' },
    {
      variant: 'soft',
      isDot: false,
      tone: 'primary',
      class: 'bg-primary-soft text-on-primary-soft',
    },
    { variant: 'soft', isDot: false, tone: 'neutral', class: 'bg-neutral-soft text-on-surface' },
    {
      variant: 'soft',
      isDot: false,
      tone: 'success',
      class: 'bg-success-soft text-on-success-soft',
    },
    {
      variant: 'soft',
      isDot: false,
      tone: 'warning',
      class: 'bg-warning-soft text-on-warning-soft',
    },
    { variant: 'soft', isDot: false, tone: 'info', class: 'bg-info-soft text-on-info-soft' },
    { variant: 'soft', isDot: true, tone: 'error', class: 'bg-error-solid' },
    { variant: 'soft', isDot: true, tone: 'primary', class: 'bg-primary-solid' },
    { variant: 'soft', isDot: true, tone: 'neutral', class: 'bg-inverse-surface' },
    { variant: 'soft', isDot: true, tone: 'success', class: 'bg-success-solid' },
    { variant: 'soft', isDot: true, tone: 'warning', class: 'bg-warning-solid' },
    { variant: 'soft', isDot: true, tone: 'info', class: 'bg-info-solid' },
  ],
  defaultVariants: {
    variant: 'solid',
    tone: 'error',
    size: 'md',
    isDot: false,
    placement: 'inline',
    animated: false,
  },
});

export const badgeAnchorStyles = tv({
  base: 'relative inline-flex shrink-0 align-middle',
});

export type BadgeVariant = 'solid' | 'soft';

export type BadgeTone = 'error' | 'primary' | 'neutral' | 'success' | 'warning' | 'info';

export type BadgeSize = 'sm' | 'md';

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
  variant?: BadgeVariant;
  tone?: BadgeTone;
  size?: BadgeSize;
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
  variant = 'solid',
  tone = 'error',
  size: sizeProp,
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
  const isDot = !hasVisibleContent(content);
  const size = sizeProp ?? (overlap ? 'sm' : 'md');
  const announced =
    label != null
      ? formatLabel(label, { count: value ?? '' })
      : value != null
        ? t.format('count', { count: value })
        : isDot
          ? t.dot
          : undefined;

  return (
    <span
      {...props}
      data-slot="badge"
      data-variant={variant}
      data-tone={tone}
      data-size={size}
      data-dot={isDot || undefined}
      className={badgeStyles({
        variant,
        tone,
        size,
        isDot,
        placement: overlap ?? 'inline',
        animated: spatialEnabled && overlap != null,
        className,
      })}
    >
      {!isDot ? (
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
