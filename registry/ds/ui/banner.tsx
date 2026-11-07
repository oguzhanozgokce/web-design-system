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

export type BannerVariant = 'soft' | 'surface';

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
      'group/banner relative flex w-full items-start gap-3 px-4 py-3 text-start',
      'data-[exiting]:pointer-events-none data-[exiting]:animate-ds-fade-out',
    ],
    icon: 'mt-0.5 inline-flex size-4 shrink-0 items-center justify-center [&_svg]:size-4',
    body: 'flex min-w-0 flex-1 flex-col gap-2',
    content: 'flex min-w-0 flex-col gap-0.5 [overflow-wrap:anywhere]',
    title: 'text-sm font-semibold',
    description: 'text-sm',
    extra: 'text-sm',
    actions:
      'flex flex-wrap items-center gap-2 has-[>[data-slot=button][data-variant=ghost]:first-child]:-ms-3',
    dismiss: [
      'focus-ring transition-control no-tap-highlight -my-1 -me-1.5 inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full',
      'data-[hovered]:bg-neutral-soft data-[pressed]:bg-neutral-soft-hover [&_svg]:size-4',
    ],
  },
  variants: {
    layout: {
      inline: { root: 'rounded-container' },
      page: {
        root: '@container/banner rounded-none sm:px-6',
        body: 'gap-x-6 @2xl/banner:flex-row @2xl/banner:items-start',
        content: '@2xl/banner:flex-1',
        actions: '@2xl/banner:-my-1.5 @2xl/banner:shrink-0 @2xl/banner:justify-end',
      },
    },
    variant: {
      soft: {
        actions: '[&>[data-slot=button][data-variant=ghost]]:text-current',
        dismiss: 'text-current',
      },
      surface: {
        root: 'border border-outline-subtle bg-surface-raised text-on-surface',
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
  },
  compoundVariants: [
    { layout: 'page', variant: 'surface', class: { root: 'border-x-0 border-t-0' } },
    { variant: 'soft', tone: 'info', class: { root: 'bg-info-soft text-on-info-soft' } },
    { variant: 'soft', tone: 'success', class: { root: 'bg-success-soft text-on-success-soft' } },
    { variant: 'soft', tone: 'warning', class: { root: 'bg-warning-soft text-on-warning-soft' } },
    { variant: 'soft', tone: 'error', class: { root: 'bg-error-soft text-on-error-soft' } },
    {
      variant: 'soft',
      tone: 'neutral',
      class: {
        root: 'bg-neutral-soft text-on-surface',
        icon: 'text-on-surface-variant',
        description: 'text-on-surface-variant',
        extra: 'text-on-surface-variant',
      },
    },
    { variant: 'surface', tone: 'info', class: { icon: 'text-info' } },
    { variant: 'surface', tone: 'success', class: { icon: 'text-success' } },
    { variant: 'surface', tone: 'warning', class: { icon: 'text-warning' } },
    { variant: 'surface', tone: 'error', class: { icon: 'text-error' } },
    { variant: 'surface', tone: 'neutral', class: { icon: 'text-on-surface-variant' } },
  ],
  defaultVariants: {
    layout: 'inline',
    variant: 'soft',
    tone: 'info',
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
  variant = 'soft',
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

  const styles = bannerStyles({ tone, variant, layout });
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
            <ButtonGroupContext value={{ variant: 'ghost', size: 'sm' }}>
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
