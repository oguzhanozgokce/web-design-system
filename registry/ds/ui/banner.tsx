'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
  type Ref,
} from 'react';
import { Button as AriaButton } from 'react-aria-components';
import { useControllableState } from '@/registry/ds/hooks/use-controllable-state';
import { tv } from '@/registry/ds/lib/utils';
import { ButtonGroupContext } from '@/registry/ds/ui/button';
import { useIcons, useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';

export type BannerTone = 'info' | 'success' | 'warning' | 'error' | 'neutral';

export type BannerVariant = 'tonal' | 'outlined';

export type BannerLayout = 'inline' | 'page';

export interface BannerLabels {
  dismiss: string;
  info: string;
  success: string;
  warning: string;
  error: string;
}

export const defaultBannerLabels: BannerLabels = {
  dismiss: 'Dismiss',
  info: 'Information:',
  success: 'Success:',
  warning: 'Warning:',
  error: 'Error:',
};

export const bannerStyles = tv({
  slots: {
    root: [
      'group/banner relative flex w-full items-start gap-3 text-start',
      'data-[exiting]:pointer-events-none data-[exiting]:animate-ds-fade-out',
    ],
    icon: 'inline-flex size-5 shrink-0 items-center justify-center text-[1.25rem] [&_svg]:size-[1em]',
    body: 'flex min-w-0 flex-1 flex-col',
    content: 'flex min-w-0 flex-col gap-0.5 [overflow-wrap:anywhere]',
    title: 'text-title-sm',
    description: 'text-body-md',
    extra: 'text-body-md',
    actions: 'flex flex-wrap items-center gap-2',
    dismiss: [
      'state-layer focus-ring inline-flex size-8 shrink-0 cursor-default items-center justify-center rounded-full',
      'transition-colors duration-150 ease-standard [&_svg]:size-5',
    ],
  },
  variants: {
    layout: {
      inline: {
        root: 'rounded-md py-2 ps-4',
        icon: 'mt-2',
        content: 'py-2',
        actions: 'pb-1 has-[>[data-slot=button][data-variant=text]:first-child]:-ms-3.5',
        dismiss: 'mt-0.5',
      },
      page: {
        root: '@container/banner rounded-none py-2 ps-4 sm:ps-6',
        icon: 'mt-1.5',
        body: 'gap-x-6 @2xl/banner:flex-row @2xl/banner:items-start',
        content: 'py-1.5 @2xl/banner:flex-1',
        actions: 'justify-end pb-1 @2xl/banner:shrink-0 @2xl/banner:pb-0',
      },
    },
    variant: {
      tonal: {
        actions: '[&_[data-slot=button][data-variant=text]]:text-current',
      },
      outlined: {
        root: 'border bg-surface text-on-surface',
        description: 'text-on-surface-variant',
        extra: 'text-on-surface-variant',
        dismiss: 'text-on-surface-variant',
      },
    },
    tone: {
      info: {},
      success: {},
      warning: {},
      error: {},
      neutral: {},
    },
    isDismissable: {
      true: { root: 'pe-2' },
      false: { root: 'pe-4' },
    },
  },
  compoundVariants: [
    { layout: 'page', isDismissable: false, class: { root: 'sm:pe-6' } },
    { layout: 'page', isDismissable: true, class: { root: 'sm:pe-4' } },
    { layout: 'page', variant: 'outlined', class: { root: 'border-x-0 border-t-0' } },
    {
      variant: 'tonal',
      tone: 'info',
      class: {
        root: 'bg-info-container text-on-info-container [&_[data-focus-visible]]:outline-on-info-container',
      },
    },
    {
      variant: 'tonal',
      tone: 'success',
      class: {
        root: 'bg-success-container text-on-success-container [&_[data-focus-visible]]:outline-on-success-container',
      },
    },
    {
      variant: 'tonal',
      tone: 'warning',
      class: {
        root: 'bg-warning-container text-on-warning-container [&_[data-focus-visible]]:outline-on-warning-container',
      },
    },
    {
      variant: 'tonal',
      tone: 'error',
      class: {
        root: 'bg-error-container text-on-error-container [&_[data-focus-visible]]:outline-on-error-container',
      },
    },
    {
      variant: 'tonal',
      tone: 'neutral',
      class: { root: 'bg-surface-container-high text-on-surface', icon: 'text-on-surface-variant' },
    },
    { variant: 'outlined', tone: 'info', class: { root: 'border-info/50', icon: 'text-info' } },
    {
      variant: 'outlined',
      tone: 'success',
      class: { root: 'border-success/50', icon: 'text-success' },
    },
    {
      variant: 'outlined',
      tone: 'warning',
      class: { root: 'border-warning/50', icon: 'text-warning' },
    },
    { variant: 'outlined', tone: 'error', class: { root: 'border-error/50', icon: 'text-error' } },
    {
      variant: 'outlined',
      tone: 'neutral',
      class: { root: 'border-outline-variant', icon: 'text-on-surface-variant' },
    },
  ],
  defaultVariants: {
    layout: 'inline',
    variant: 'tonal',
    tone: 'info',
    isDismissable: false,
  },
});

const exitDuration = 100;

const tabbableSelector = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  'iframe',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

interface DomPosition {
  parent: Element;
  next: Node | null;
}

function positionOf(node: Element): DomPosition | null {
  return node.parentElement ? { parent: node.parentElement, next: node.nextSibling } : null;
}

function follows({ parent, next }: DomPosition, element: Element) {
  if (next?.parentNode === parent) {
    return (
      element === next ||
      !!(next.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING)
    );
  }
  return (
    !parent.contains(element) &&
    !!(parent.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING)
  );
}

function findNeighbour(position: DomPosition, exclude: Element | null) {
  const candidates = Array.from(
    position.parent.ownerDocument.querySelectorAll<HTMLElement>(tabbableSelector),
  ).filter(
    (element) =>
      !exclude?.contains(element) &&
      element.tabIndex >= 0 &&
      !element.closest('[inert]') &&
      element.getClientRects().length > 0,
  );
  return candidates.find((element) => follows(position, element)) ?? candidates.at(-1) ?? null;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

export interface BannerProps extends Omit<ComponentProps<'div'>, 'title' | 'role' | 'children'> {
  tone?: BannerTone;
  variant?: BannerVariant;
  layout?: BannerLayout;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  isDismissable?: boolean;
  onDismiss?: () => void;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  announce?: boolean;
  labels?: Partial<BannerLabels>;
}

export function Banner({
  tone = 'info',
  variant = 'tonal',
  layout = 'inline',
  title,
  description,
  children,
  icon,
  actions,
  isDismissable = false,
  onDismiss,
  isOpen: isOpenProp,
  defaultOpen = true,
  onOpenChange,
  announce = false,
  labels,
  className,
  ref,
  ...props
}: BannerProps) {
  const t = useLabels('banner', defaultBannerLabels, labels);
  const icons = useIcons();
  const { effectsEnabled } = useMotionPreference();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const dismissedFrom = useRef<DomPosition | null>(null);
  const [isOpen, setOpen] = useControllableState(isOpenProp, defaultOpen, onOpenChange);
  const [shownOpen, setShownOpen] = useState(isOpen);
  const [isExiting, setExiting] = useState(false);

  if (shownOpen !== isOpen) {
    setShownOpen(isOpen);
    setExiting(!isOpen && effectsEnabled);
  }

  useEffect(() => {
    if (!isExiting) return;
    const timer = setTimeout(() => setExiting(false), exitDuration);
    return () => clearTimeout(timer);
  }, [isExiting]);

  useLayoutEffect(() => {
    if (isOpen) return;
    const pressed = dismissedFrom.current;
    dismissedFrom.current = null;
    if (!pressed?.parent.isConnected) return;
    const node = rootRef.current?.isConnected ? rootRef.current : null;
    const { activeElement, body } = pressed.parent.ownerDocument;
    if (activeElement && activeElement !== body && !node?.contains(activeElement)) return;
    const position = (node && positionOf(node)) ?? pressed;
    findNeighbour(position, node)?.focus();
  }, [isOpen]);

  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      assignRef(ref, node);
    },
    [ref],
  );

  if (!isOpen && !isExiting) return null;

  const styles = bannerStyles({ tone, variant, layout, isDismissable });
  const toneIcons = {
    info: icons.info,
    success: icons.checkCircle,
    warning: icons.warning,
    error: icons.error,
    neutral: icons.info,
  } as const;
  const ToneIcon = toneIcons[tone];
  const glyph = icon === undefined ? <ToneIcon /> : icon;
  const role = announce && tone === 'error' ? 'alert' : 'status';

  function dismiss() {
    const node = rootRef.current;
    dismissedFrom.current =
      node && node.contains(node.ownerDocument.activeElement) ? positionOf(node) : null;
    onDismiss?.();
    setOpen(false);
  }

  return (
    <div
      {...props}
      ref={setRootRef}
      data-slot="banner"
      data-tone={tone}
      data-variant={variant}
      data-layout={layout}
      data-exiting={isExiting || undefined}
      inert={isExiting || undefined}
      className={styles.root({ className })}
    >
      {glyph != null && glyph !== false ? (
        <span data-slot="icon" aria-hidden="true" className={styles.icon()}>
          {glyph}
        </span>
      ) : null}
      <div data-slot="body" className={styles.body()}>
        <div data-slot="content" role={role} className={styles.content()}>
          {tone !== 'neutral' ? <span className="sr-only">{t[tone]} </span> : null}
          {title != null ? (
            <div data-slot="title" className={styles.title()}>
              {title}
            </div>
          ) : null}
          {description != null ? (
            <div data-slot="description" className={styles.description()}>
              {description}
            </div>
          ) : null}
          {children != null ? (
            <div data-slot="extra" className={styles.extra()}>
              {children}
            </div>
          ) : null}
        </div>
        {actions != null ? (
          <div data-slot="actions" className={styles.actions()}>
            <ButtonGroupContext value={{ variant: 'text', size: 'sm' }}>
              {actions}
            </ButtonGroupContext>
          </div>
        ) : null}
      </div>
      {isDismissable ? (
        <AriaButton
          aria-label={t.dismiss}
          data-slot="dismiss"
          className={styles.dismiss()}
          onPress={dismiss}
        >
          <icons.close />
        </AriaButton>
      ) : null}
    </div>
  );
}
