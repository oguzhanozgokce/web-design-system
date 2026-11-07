'use client';

import type { ReactNode } from 'react';
import {
  Dialog as AriaDialog,
  DialogTrigger,
  Heading,
  OverlayArrow,
  Popover as AriaPopover,
  composeRenderProps,
  useLocale,
  type DialogProps as AriaDialogProps,
  type DialogRenderProps,
  type DialogTriggerProps,
  type OverlayArrowProps,
  type PopoverProps as AriaPopoverProps,
} from 'react-aria-components';
import { tv, type VariantProps } from '@/registry/ds/lib/utils';
import { ButtonGroupContext } from '@/registry/ds/ui/button';
import { useIcons, useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';
import { IconButton } from '@/registry/ds/ui/icon-button';
import { useThemeScopeProps } from '@/registry/ds/lib/theme-scope';

export type PopoverMotion = 'spatial' | 'fade' | 'none';

export interface PopoverLabels {
  close: string;
}

export const defaultPopoverLabels: PopoverLabels = {
  close: 'Close',
};

export const popoverMotion = {
  spatial: [
    'data-[entering]:animate-ds-popover-in data-[exiting]:animate-ds-popover-out',
    'motion-reduce:data-[entering]:animate-ds-fade-in motion-reduce:data-[exiting]:animate-ds-fade-out',
  ],
  fade: 'data-[entering]:animate-ds-fade-in data-[exiting]:animate-ds-fade-out',
  none: '',
} satisfies Record<PopoverMotion, string | string[]>;

export function usePopoverMotion(): PopoverMotion {
  const { spatialEnabled, effectsEnabled } = useMotionPreference();
  if (spatialEnabled) return 'spatial';
  return effectsEnabled ? 'fade' : 'none';
}

export const popoverStyles = tv({
  base: [
    'max-w-[calc(100vw-1.5rem)] rounded-overlay bg-surface-overlay text-sm text-on-surface shadow-md outline-none',
    'origin-(--trigger-anchor-point) [--ds-popover-scale:0.9] forced-colors:border',
  ],
  variants: {
    motion: popoverMotion,
  },
  defaultVariants: {
    motion: 'spatial',
  },
});

export type PopoverStyleProps = VariantProps<typeof popoverStyles>;

export const popoverArrowStyles = tv({
  slots: {
    base: 'group/arrow text-surface-overlay',
    shape: [
      'block fill-current forced-colors:fill-[CanvasText]',
      'group-data-[placement=bottom]/arrow:rotate-180',
      'group-data-[placement=left]/arrow:-rotate-90',
      'group-data-[placement=right]/arrow:rotate-90',
    ],
  },
});

export type PopoverArrowProps = Omit<OverlayArrowProps, 'children'>;

export function PopoverArrow({ className, ...props }: PopoverArrowProps) {
  const styles = popoverArrowStyles();

  return (
    <OverlayArrow
      {...props}
      data-slot="arrow"
      className={composeRenderProps(className, (className) => styles.base({ className }))}
    >
      <svg
        width={12}
        height={12}
        viewBox="0 0 12 12"
        aria-hidden="true"
        focusable="false"
        className={styles.shape()}
      >
        <path d="M0 0L6 6L12 0" />
      </svg>
    </OverlayArrow>
  );
}

export type PopoverTriggerProps = DialogTriggerProps;

export function PopoverTrigger(props: PopoverTriggerProps) {
  return <DialogTrigger {...props} />;
}

export interface PopoverProps extends Omit<AriaPopoverProps, 'className'> {
  showArrow?: boolean;
  className?: AriaPopoverProps['className'];
}

export function Popover({
  showArrow = false,
  offset,
  className,
  children,
  ...props
}: PopoverProps) {
  const motion = usePopoverMotion();
  const { locale } = useLocale();
  const themeScope = useThemeScopeProps();

  return (
    <AriaPopover
      lang={locale}
      {...themeScope}
      {...props}
      offset={offset ?? (showArrow ? 12 : 8)}
      data-slot="popover"
      data-arrow={showArrow || undefined}
      className={composeRenderProps(className, (className) => popoverStyles({ motion, className }))}
    >
      {composeRenderProps(children, (children) => (
        <ButtonGroupContext value={null}>
          {showArrow ? <PopoverArrow /> : null}
          {children}
        </ButtonGroupContext>
      ))}
    </AriaPopover>
  );
}

export type PopoverDialogPadding = 'sm' | 'md';

export const popoverDialogStyles = tv({
  slots: {
    base: 'flex max-h-[inherit] max-w-[min(24rem,calc(100vw-1.5rem))] flex-col overflow-auto outline-none',
    header: 'flex items-start gap-2',
    title: 'min-w-0 flex-1 text-sm font-semibold text-on-surface',
    close: '-my-1 ms-auto',
    body: 'text-sm text-on-surface-variant',
  },
  variants: {
    padding: {
      sm: { base: 'gap-1.5 p-3', close: '-me-1.5' },
      md: { base: 'gap-2 p-4', close: '-me-2' },
    },
  },
  defaultVariants: {
    padding: 'md',
  },
});

export interface PopoverDialogProps extends Omit<AriaDialogProps, 'children' | 'className'> {
  title?: ReactNode;
  showCloseButton?: boolean;
  padding?: PopoverDialogPadding;
  labels?: Partial<PopoverLabels>;
  children?: ReactNode | ((renderProps: DialogRenderProps) => ReactNode);
  className?: string;
}

export function PopoverDialog({
  title,
  showCloseButton = false,
  padding = 'md',
  labels,
  children,
  className,
  ...props
}: PopoverDialogProps) {
  const t = useLabels('popover', defaultPopoverLabels, labels);
  const icons = useIcons();
  const styles = popoverDialogStyles({ padding });
  const hasHeader = title != null || showCloseButton;

  return (
    <AriaDialog
      {...props}
      data-slot="popover-dialog"
      data-padding={padding}
      className={styles.base({ className })}
    >
      {(renderProps) => (
        <>
          {hasHeader ? (
            <div data-slot="header" className={styles.header()}>
              {title != null ? (
                <Heading slot="title" data-slot="title" className={styles.title()}>
                  {title}
                </Heading>
              ) : null}
              {showCloseButton ? (
                <IconButton
                  slot="close"
                  aria-label={t.close}
                  icon={<icons.close />}
                  variant="ghost"
                  tone="neutral"
                  size="xs"
                  className={styles.close()}
                />
              ) : null}
            </div>
          ) : null}
          <div data-slot="body" className={styles.body()}>
            {typeof children === 'function' ? children(renderProps) : children}
          </div>
        </>
      )}
    </AriaDialog>
  );
}
