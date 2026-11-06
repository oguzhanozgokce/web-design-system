'use client';

import type { ReactNode } from 'react';
import {
  Button as AriaButton,
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
import { SurfaceContext } from '@/registry/ds/ui/card';
import { useIcons, useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';
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
    'max-w-[calc(100vw-1.5rem)] rounded-md bg-surface-container-high text-on-surface shadow-elevation-2 outline-none',
    'origin-(--trigger-anchor-point) forced-colors:border',
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
    base: 'group/arrow text-surface-container-high',
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
        <SurfaceContext value="surface-container-high">
          <ButtonGroupContext value={null}>
            {showArrow ? <PopoverArrow /> : null}
            {children}
          </ButtonGroupContext>
        </SurfaceContext>
      ))}
    </AriaPopover>
  );
}

export const popoverDialogStyles = tv({
  slots: {
    base: 'flex max-h-[inherit] max-w-[min(24rem,calc(100vw-1.5rem))] flex-col gap-2 overflow-auto p-4 outline-none',
    header: 'flex items-start gap-2',
    title: 'min-w-0 flex-1 text-title-md text-on-surface',
    close: [
      'state-layer focus-ring -me-2 -mt-1.5 ms-auto inline-flex size-8 shrink-0 cursor-default items-center justify-center rounded-full text-on-surface-variant',
      'transition-colors duration-150 ease-standard [&_svg]:size-5',
      'pointer-coarse:after:absolute pointer-coarse:after:-inset-2',
    ],
    body: 'text-body-md text-on-surface-variant',
  },
});

export interface PopoverDialogProps extends Omit<AriaDialogProps, 'children' | 'className'> {
  title?: ReactNode;
  showCloseButton?: boolean;
  labels?: Partial<PopoverLabels>;
  children?: ReactNode | ((renderProps: DialogRenderProps) => ReactNode);
  className?: string;
}

export function PopoverDialog({
  title,
  showCloseButton = false,
  labels,
  children,
  className,
  ...props
}: PopoverDialogProps) {
  const t = useLabels('popover', defaultPopoverLabels, labels);
  const icons = useIcons();
  const styles = popoverDialogStyles();
  const hasHeader = title != null || showCloseButton;

  return (
    <AriaDialog {...props} data-slot="popover-dialog" className={styles.base({ className })}>
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
                <AriaButton
                  slot="close"
                  aria-label={t.close}
                  data-slot="close"
                  className={styles.close()}
                >
                  <icons.close />
                </AriaButton>
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
