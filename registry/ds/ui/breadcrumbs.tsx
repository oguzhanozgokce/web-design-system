'use client';

import type { ReactNode, Ref } from 'react';
import {
  Breadcrumb as AriaBreadcrumb,
  Breadcrumbs as AriaBreadcrumbs,
  Link as AriaLink,
  composeRenderProps,
  type BreadcrumbProps as AriaBreadcrumbProps,
  type BreadcrumbsProps as AriaBreadcrumbsProps,
  type LinkProps,
} from 'react-aria-components';
import { tv } from '@/registry/ds/lib/utils';
import { useIcons, useLabels } from '@/registry/ds/ui/ds-provider';

export interface BreadcrumbsLabels {
  navigation: string;
}

export const defaultBreadcrumbsLabels: BreadcrumbsLabels = {
  navigation: 'Breadcrumbs',
};

export const breadcrumbsStyles = tv({
  slots: {
    root: 'min-w-0 text-sm',
    list: 'flex flex-wrap items-center gap-x-1 gap-y-0.5',
    item: 'flex min-w-0 max-w-full items-center gap-1',
    link: [
      'focus-ring no-tap-highlight inline-flex min-h-8 min-w-0 items-center gap-1.5 rounded-item px-2 py-1 text-on-surface-variant no-underline [overflow-wrap:anywhere]',
      'transition-[color,background-color] duration-150 ease-out motion-reduce:transition-none',
      'data-[hovered]:bg-neutral-soft data-[hovered]:text-on-surface data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
    ],
    current:
      'inline-flex min-h-8 min-w-0 items-center gap-1.5 px-2 py-1 font-medium text-on-surface [overflow-wrap:anywhere] [&_svg]:size-4 [&_svg]:shrink-0',
    separator: 'size-3.5 shrink-0 text-on-surface-variant rtl:-scale-x-100',
  },
});

export interface BreadcrumbsProps<T extends object> extends AriaBreadcrumbsProps<T> {
  labels?: Partial<BreadcrumbsLabels>;
  ref?: Ref<HTMLOListElement>;
}

export function Breadcrumbs<T extends object>({
  labels,
  className,
  ...props
}: BreadcrumbsProps<T>) {
  const t = useLabels('breadcrumbs', defaultBreadcrumbsLabels, labels);
  const name = props['aria-label'] ?? (props['aria-labelledby'] ? undefined : t.navigation);
  const styles = breadcrumbsStyles();
  return (
    <nav
      aria-label={name}
      aria-labelledby={props['aria-labelledby']}
      data-slot="breadcrumbs"
      className={styles.root({ className })}
    >
      <AriaBreadcrumbs
        {...props}
        aria-label={name}
        data-slot="breadcrumbs-list"
        className={styles.list()}
      />
    </nav>
  );
}

export interface BreadcrumbProps extends Omit<AriaBreadcrumbProps, 'children'> {
  href?: LinkProps['href'];
  target?: LinkProps['target'];
  rel?: LinkProps['rel'];
  children: ReactNode;
  ref?: Ref<HTMLLIElement>;
}

export function Breadcrumb({ children, href, target, rel, className, ...props }: BreadcrumbProps) {
  const icons = useIcons();
  const styles = breadcrumbsStyles();
  return (
    <AriaBreadcrumb
      {...props}
      data-slot="breadcrumb"
      className={composeRenderProps(className, (className) => styles.item({ className }))}
    >
      {({ isCurrent }) => (
        <>
          {isCurrent ? (
            <span aria-current="page" className={styles.current()}>
              {children}
            </span>
          ) : (
            <AriaLink href={href} target={target} rel={rel} className={styles.link()}>
              {children}
            </AriaLink>
          )}
          {!isCurrent ? (
            <icons.chevronRight aria-hidden="true" className={styles.separator()} />
          ) : null}
        </>
      )}
    </AriaBreadcrumb>
  );
}
