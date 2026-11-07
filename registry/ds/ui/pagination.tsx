'use client';

import { motion } from 'motion/react';
import { useEffect, useId, useMemo, useRef, type ComponentProps } from 'react';
import { Button as AriaButton, useLocale } from 'react-aria-components';
import { useControllableState } from '@/registry/ds/hooks/use-controllable-state';
import type { LabelTemplate } from '@/registry/ds/lib/labels';
import { fluidTween } from '@/registry/ds/lib/motion';
import {
  clampPage,
  getPaginationSlots,
  type PaginationSlot,
} from '@/registry/ds/lib/pagination.ts';
import { cn, tv } from '@/registry/ds/lib/utils';
import { Button } from '@/registry/ds/ui/button';
import { useIcons, useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';

export type PaginationSize = 'sm' | 'md';

export interface PaginationLabels {
  navigation: string;
  previous: string;
  next: string;
  previousPage: string;
  nextPage: string;
  page: LabelTemplate<{ page: string }>;
}

export const defaultPaginationLabels: PaginationLabels = {
  navigation: 'Pagination',
  previous: 'Previous',
  next: 'Next',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  page: 'Page {page}',
};

export const paginationStyles = tv({
  slots: {
    root: '@container/pagination w-full min-w-0',
    layout: 'flex w-full items-center justify-between gap-2',
    list: 'flex min-w-0 items-center gap-1',
    item: 'inline-flex',
    page: [
      'focus-ring transition-control no-tap-highlight relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center rounded-control font-medium whitespace-nowrap text-on-surface-variant tabular-digits select-none',
      'data-[hovered]:bg-neutral-soft data-[hovered]:text-on-surface data-[pressed]:bg-neutral-soft-hover',
      'data-[current]:cursor-default data-[current]:text-on-surface data-[current]:data-[hovered]:bg-transparent data-[current]:data-[pressed]:scale-100',
      'motion-reduce:data-[pressed]:scale-100',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
    ],
    indicator:
      'pointer-events-none absolute inset-0 -z-10 rounded-control border border-outline-variant bg-surface-segment shadow-xs',
    ellipsis:
      'inline-flex shrink-0 items-center justify-center text-on-surface-variant select-none',
    arrow: '',
    arrowLabel: '',
  },
  variants: {
    size: {
      sm: {
        page: 'h-8 min-w-8 px-1.5 text-sm data-[pressed]:scale-[0.98]',
        ellipsis: 'h-8 w-6 text-sm',
        arrow: '@max-[30rem]/pagination:w-8 @max-[30rem]/pagination:px-0',
        arrowLabel: '@max-[30rem]/pagination:sr-only',
      },
      md: {
        page: 'h-10 min-w-10 px-2 text-sm data-[pressed]:scale-[0.97]',
        ellipsis: 'h-10 w-7 text-sm',
        arrow: '@max-[36rem]/pagination:w-10 @max-[36rem]/pagination:px-0',
        arrowLabel: '@max-[36rem]/pagination:sr-only',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const slotVisibility: Record<PaginationSize, { wideOnly: string; compactOnly: string }> = {
  sm: {
    wideOnly: '@max-[30rem]/pagination:hidden',
    compactOnly: 'hidden @max-[30rem]/pagination:inline-flex',
  },
  md: {
    wideOnly: '@max-[36rem]/pagination:hidden',
    compactOnly: 'hidden @max-[36rem]/pagination:inline-flex',
  },
};

function visibilityClass(slot: PaginationSlot, size: PaginationSize) {
  if (slot.isWide && slot.isCompact) return '';
  return slot.isWide ? slotVisibility[size].wideOnly : slotVisibility[size].compactOnly;
}

export interface PaginationProps extends Omit<ComponentProps<'nav'>, 'children' | 'onChange'> {
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  pageCount: number;
  siblingCount?: number;
  size?: PaginationSize;
  isDisabled?: boolean;
  labels?: Partial<PaginationLabels>;
}

export function Pagination({
  page: pageProp,
  defaultPage = 1,
  onPageChange,
  pageCount,
  siblingCount = 1,
  size = 'md',
  isDisabled = false,
  labels,
  className,
  'aria-label': ariaLabel,
  ...props
}: PaginationProps) {
  const t = useLabels('pagination', defaultPaginationLabels, labels);
  const icons = useIcons();
  const { locale } = useLocale();
  const { spatialEnabled, profile } = useMotionPreference();
  const indicatorId = useId();
  const currentRef = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  const [rawPage, setPage] = useControllableState(pageProp, defaultPage, onPageChange);
  const total = Math.max(1, Math.floor(pageCount));
  const current = clampPage(rawPage, total);
  const formatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const slots = useMemo(
    () => getPaginationSlots(current, total, siblingCount),
    [current, total, siblingCount],
  );
  const styles = paginationStyles({ size });

  useEffect(() => {
    if (!restoreFocus.current) return;
    restoreFocus.current = false;
    const active = document.activeElement;
    if (active == null || active === document.body) currentRef.current?.focus();
  }, [current]);

  function go(next: number, fromArrow = false) {
    const target = clampPage(next, total);
    if (target === current) return;
    restoreFocus.current = fromArrow;
    setPage(target);
  }

  return (
    <nav
      {...props}
      aria-label={ariaLabel ?? t.navigation}
      data-slot="pagination"
      data-size={size}
      data-disabled={isDisabled || undefined}
      className={styles.root({ className })}
    >
      <div data-slot="pagination-layout" className={styles.layout()}>
        <Button
          variant="outline"
          size={size}
          aria-label={t.previousPage}
          isDisabled={isDisabled || current <= 1}
          onPress={() => go(current - 1, true)}
          startIcon={<icons.arrowBack className="rtl:-scale-x-100" />}
          className={styles.arrow()}
        >
          <span className={styles.arrowLabel()}>{t.previous}</span>
        </Button>
        <ul data-slot="pagination-list" className={styles.list()}>
          {slots.map((slot) => {
            const visibility = visibilityClass(slot, size);
            if (slot.entry.type === 'ellipsis') {
              return (
                <li
                  key={slot.entry.key}
                  aria-hidden="true"
                  data-slot="pagination-ellipsis"
                  className={cn(styles.ellipsis(), visibility)}
                >
                  …
                </li>
              );
            }
            const value = slot.entry.page;
            const isCurrent = value === current;
            const label = formatter.format(value);
            return (
              <li key={slot.entry.key} className={cn(styles.item(), visibility)}>
                <AriaButton
                  ref={isCurrent ? currentRef : undefined}
                  aria-label={t.format('page', { page: label })}
                  aria-current={isCurrent ? 'page' : undefined}
                  isDisabled={isDisabled}
                  onPress={() => go(value)}
                  data-slot="pagination-page"
                  data-current={isCurrent || undefined}
                  className={styles.page()}
                >
                  {isCurrent ? (
                    spatialEnabled ? (
                      <motion.span
                        layoutId={indicatorId}
                        transition={profile === 'productive' ? fluidTween(150) : fluidTween()}
                        data-slot="pagination-indicator"
                        className={styles.indicator()}
                      />
                    ) : (
                      <span data-slot="pagination-indicator" className={styles.indicator()} />
                    )
                  ) : null}
                  {label}
                </AriaButton>
              </li>
            );
          })}
        </ul>
        <Button
          variant="outline"
          size={size}
          aria-label={t.nextPage}
          isDisabled={isDisabled || current >= total}
          onPress={() => go(current + 1, true)}
          endIcon={<icons.arrowForward className="rtl:-scale-x-100" />}
          className={styles.arrow()}
        >
          <span className={styles.arrowLabel()}>{t.next}</span>
        </Button>
      </div>
    </nav>
  );
}
