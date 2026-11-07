'use client';

import {
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  Button as AriaButton,
  Text,
  UNSTABLE_Toast as AriaToast,
  UNSTABLE_ToastContent as AriaToastContent,
  UNSTABLE_ToastQueue as AriaToastQueue,
  UNSTABLE_ToastRegion as AriaToastRegion,
  type QueuedToast,
} from 'react-aria-components';
import { tv, type VariantProps } from '@/registry/ds/lib/utils';
import { Button } from '@/registry/ds/ui/button';
import { useIcons, useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';
import { Spinner } from '@/registry/ds/ui/spinner';

export type ToastTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';

export type ToastPlacement =
  'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end';

export type ToastCloseReason = 'timeout' | 'close' | 'escape' | 'action' | 'programmatic';

export interface ToastLabels {
  close: string;
  notifications: string;
}

export const defaultToastLabels: ToastLabels = {
  close: 'Close',
  notifications: 'Notifications',
};

export interface ToastAction {
  label: ReactNode;
  onAction: () => void | Promise<unknown>;
}

export interface ToastContentOptions {
  title?: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
  icon?: ReactNode;
  action?: ToastAction | null;
  duration?: number;
}

export interface ToastOptions extends ToastContentOptions {
  id?: string;
  toasterId?: string;
  onClose?: (reason: ToastCloseReason) => void;
}

export interface ToastUpdate extends ToastContentOptions {
  message?: ReactNode;
  isLoading?: boolean;
}

export interface ToastMessage extends ToastContentOptions {
  message: ReactNode;
}

export type ToastPromiseResult<Input> =
  ReactNode | ToastMessage | ((input: Input) => ReactNode | ToastMessage);

export interface ToastPromiseOptions<Value> extends Omit<ToastOptions, 'tone' | 'action'> {
  loading: ReactNode;
  success: ToastPromiseResult<Value>;
  error: ToastPromiseResult<unknown>;
}

interface ToastRecord extends Omit<ToastContentOptions, 'tone'> {
  id: string;
  toasterId: string;
  message: ReactNode;
  tone: ToastTone;
  isLoading: boolean;
  revision: number;
  onClose?: (reason: ToastCloseReason) => void;
  exitReason?: ToastCloseReason;
}

interface ToastEntry {
  queued: QueuedToast<string>;
  record: ToastRecord;
}

interface ToasterStore {
  queue: AriaToastQueue<string>;
  entries: readonly ToastEntry[];
  listeners: Set<() => void>;
  owners: symbol[];
}

interface Countdown {
  revision: number;
  duration: number;
  remaining: number;
}

const defaultToasterId = 'default';
const exitDuration = 250;
const stackGap = 12;
const stackPeek = 12;
const stackScaleStep = 0.05;
const noEntries: readonly ToastEntry[] = [];

const toasters = new Map<string, ToasterStore>();
const records = new Map<string, ToastRecord>();
const queueKeys = new Map<string, string>();
const shownToasts = new Set<string>();
const countdowns = new Map<string, Countdown>();
const ownerListeners = new Set<() => void>();
let toastCount = 0;

function publish(store: ToasterStore) {
  store.entries = store.queue.visibleToasts.flatMap((queued) => {
    const record = records.get(queued.content);
    return record ? [{ queued, record }] : [];
  });
  for (const listener of store.listeners) listener();
}

function toasterStore(toasterId: string) {
  const existing = toasters.get(toasterId);
  if (existing) return existing;
  const store: ToasterStore = {
    queue: new AriaToastQueue<string>(),
    entries: noEntries,
    listeners: new Set(),
    owners: [],
  };
  store.queue.subscribe(() => publish(store));
  toasters.set(toasterId, store);
  return store;
}

function subscribeToaster(store: ToasterStore, listener: () => void) {
  store.listeners.add(listener);
  return () => {
    store.listeners.delete(listener);
  };
}

function subscribeOwners(listener: () => void) {
  ownerListeners.add(listener);
  return () => {
    ownerListeners.delete(listener);
  };
}

function registerOwner(store: ToasterStore, token: symbol) {
  store.owners.push(token);
  for (const listener of ownerListeners) listener();
  return () => {
    store.owners.splice(store.owners.indexOf(token), 1);
    for (const listener of ownerListeners) listener();
  };
}

function handleClosed(id: string) {
  const record = records.get(id);
  if (!record) return;
  records.delete(id);
  queueKeys.delete(id);
  shownToasts.delete(id);
  countdowns.delete(id);
  record.onClose?.(record.exitReason ?? 'programmatic');
}

function removeToast(id: string) {
  const record = records.get(id);
  const key = queueKeys.get(id);
  if (record && key) toasterStore(record.toasterId).queue.close(key);
}

function dismissToast(id: string, reason: ToastCloseReason) {
  const record = records.get(id);
  if (!record || record.exitReason) return;
  records.set(id, { ...record, exitReason: reason });
  if (shownToasts.has(id)) publish(toasterStore(record.toasterId));
  else removeToast(id);
}

function markShown(id: string) {
  shownToasts.add(id);
  return () => {
    shownToasts.delete(id);
    if (records.get(id)?.exitReason) removeToast(id);
  };
}

function remainingTime(id: string, revision: number, duration: number) {
  const countdown = countdowns.get(id);
  if (countdown && countdown.revision === revision && countdown.duration === duration) {
    return countdown.remaining;
  }
  countdowns.set(id, { revision, duration, remaining: duration });
  return duration;
}

function consumeTime(id: string, revision: number, duration: number, elapsed: number) {
  const countdown = countdowns.get(id);
  if (countdown && countdown.revision === revision && countdown.duration === duration) {
    countdown.remaining = Math.max(0, countdown.remaining - elapsed);
  }
}

function withoutUndefined<Value extends object>(value: Value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as Partial<Value>;
}

function nextToastId() {
  do {
    toastCount += 1;
  } while (records.has(`toast-${toastCount}`));
  return `toast-${toastCount}`;
}

function showToast(message: ReactNode, options: ToastOptions & { isLoading?: boolean } = {}) {
  const {
    id: requestedId,
    toasterId = defaultToasterId,
    tone = 'neutral',
    isLoading = false,
    ...content
  } = options;
  const existing = requestedId ? records.get(requestedId) : undefined;

  if (existing && !existing.exitReason && existing.toasterId === toasterId) {
    records.set(existing.id, {
      ...content,
      id: existing.id,
      toasterId,
      message,
      tone,
      isLoading,
      revision: existing.revision + 1,
    });
    publish(toasterStore(toasterId));
    return existing.id;
  }
  if (existing) removeToast(existing.id);

  const id = requestedId ?? nextToastId();
  records.set(id, { ...content, id, toasterId, message, tone, isLoading, revision: 0 });
  const key = toasterStore(toasterId).queue.add(id, { onClose: () => handleClosed(id) });
  queueKeys.set(id, key);
  return id;
}

function updateToast(id: string, update: ToastUpdate) {
  const record = records.get(id);
  if (!record || record.exitReason) return false;
  records.set(id, {
    ...record,
    ...withoutUndefined(update),
    revision: record.revision + 1,
  });
  publish(toasterStore(record.toasterId));
  return true;
}

function isToastMessage(value: unknown): value is ToastMessage {
  return (
    typeof value === 'object' && value !== null && !isValidElement(value) && 'message' in value
  );
}

function resolveResult<Input>(result: ToastPromiseResult<Input>, input: Input): ToastMessage {
  const resolved = typeof result === 'function' ? result(input) : result;
  return isToastMessage(resolved) ? resolved : { message: resolved };
}

function startPromise<Value>(promise: Promise<Value> | (() => Promise<Value>)) {
  if (typeof promise !== 'function') return promise;
  try {
    return promise();
  } catch (reason) {
    return Promise.reject(reason);
  }
}

function promiseToast<Value>(
  promise: Promise<Value> | (() => Promise<Value>),
  { loading, success, error, duration, ...options }: ToastPromiseOptions<Value>,
) {
  const id = showToast(loading, { ...options, isLoading: true });
  startPromise(promise).then(
    (value) =>
      updateToast(id, {
        tone: 'success',
        duration,
        ...resolveResult(success, value),
        isLoading: false,
      }),
    (reason: unknown) =>
      updateToast(id, {
        tone: 'error',
        duration,
        ...resolveResult(error, reason),
        isLoading: false,
      }),
  );
  return id;
}

function createToast(message: ReactNode, options?: ToastOptions) {
  return showToast(message, options);
}

type ToneOptions = Omit<ToastOptions, 'tone'>;

export const toast = Object.assign(createToast, {
  info: (message: ReactNode, options?: ToneOptions) =>
    showToast(message, { ...options, tone: 'info' }),
  success: (message: ReactNode, options?: ToneOptions) =>
    showToast(message, { ...options, tone: 'success' }),
  warning: (message: ReactNode, options?: ToneOptions) =>
    showToast(message, { ...options, tone: 'warning' }),
  error: (message: ReactNode, options?: ToneOptions) =>
    showToast(message, { ...options, tone: 'error' }),
  loading: (message: ReactNode, options?: ToastOptions) =>
    showToast(message, { ...options, isLoading: true }),
  promise: promiseToast,
  update: updateToast,
  dismiss: (id?: string) => {
    for (const target of id === undefined ? [...records.keys()] : [id]) {
      dismissToast(target, 'programmatic');
    }
  },
});

const toneIconColours: Record<ToastTone, string> = {
  neutral: 'text-on-surface-variant',
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
};

export const toastStyles = tv({
  slots: {
    region: [
      'fixed z-100 rounded-container focus-ring',
      'max-sm:inset-x-4 sm:w-[min(25rem,calc(100vw-2rem))]',
    ],
    list: 'relative m-0 list-none p-0',
    toast: [
      'group/toast absolute inset-x-0 overflow-hidden rounded-container bg-surface-overlay text-on-surface shadow-md focus-ring forced-colors:border',
      'h-(--ds-toast-height) [scale:var(--ds-toast-scale)] [translate:0_var(--ds-toast-y)]',
      'data-[exiting]:pointer-events-none data-[exiting]:opacity-0',
    ],
    body: [
      'flex items-start gap-3 px-4 py-3',
      'transition-opacity duration-250 ease-out group-data-[stacked]/toast:opacity-0',
    ],
    icon: 'mt-0.5 inline-flex size-4 shrink-0 items-center justify-center [&_svg]:size-4',
    main: 'flex min-w-0 flex-1 gap-x-3 gap-y-2',
    content: 'flex min-w-0 flex-col gap-0.5 [overflow-wrap:anywhere]',
    title: 'text-sm font-medium',
    message: 'text-sm',
    description: 'text-sm text-on-surface-variant',
    action: 'shrink-0',
    close: [
      'focus-ring transition-control no-tap-highlight relative -my-1 -me-1.5 inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-on-surface-variant',
      'data-[hovered]:bg-neutral-soft data-[pressed]:bg-neutral-soft-hover [&_svg]:size-4',
      'pointer-coarse:after:absolute pointer-coarse:after:-inset-2',
    ],
  },
  variants: {
    placement: {
      'top-start': { region: 'sm:inset-s-4' },
      'top-center': { region: 'sm:inset-x-0 sm:mx-auto' },
      'top-end': { region: 'sm:inset-e-4' },
      'bottom-start': { region: 'sm:inset-s-4' },
      'bottom-center': { region: 'sm:inset-x-0 sm:mx-auto' },
      'bottom-end': { region: 'sm:inset-e-4' },
    },
    side: {
      top: {
        region: 'top-[calc(1rem+env(safe-area-inset-top))]',
        toast: 'top-0 origin-bottom',
      },
      bottom: {
        region: 'bottom-[calc(1rem+env(safe-area-inset-bottom))]',
        toast: 'bottom-0 origin-top',
      },
    },
    tone: {
      neutral: { icon: toneIconColours.neutral },
      info: { icon: toneIconColours.info },
      success: { icon: toneIconColours.success },
      warning: { icon: toneIconColours.warning },
      error: { icon: toneIconColours.error },
    },
    motion: {
      spatial: {
        toast: [
          'transition-[translate,scale,opacity,height] duration-350 ease-fluid starting:opacity-0',
          'data-[exiting]:duration-250',
          'motion-reduce:transition-opacity motion-reduce:duration-150',
        ],
      },
      fade: {
        toast: 'transition-opacity duration-150 ease-out starting:opacity-0',
      },
      none: {
        toast: 'transition-none',
        body: 'transition-none',
      },
    },
    actionPlacement: {
      inline: { main: 'flex-wrap items-center justify-end', content: 'flex-[1_1_10rem]' },
      below: { main: 'flex-col items-start', content: 'w-full' },
    },
    hasTitle: {
      true: { message: 'text-on-surface-variant' },
      false: { message: 'font-medium' },
    },
    isCloseRevealed: {
      true: {},
      false: {
        close:
          'pointer-fine:not-data-[focus-visible]:opacity-0 pointer-fine:group-hover/toast:opacity-100 pointer-fine:group-focus-within/toast:opacity-100',
      },
    },
  },
  compoundVariants: [
    {
      motion: 'spatial',
      side: 'bottom',
      class: { toast: 'motion-safe:starting:data-[front]:[translate:0_100%]' },
    },
    {
      motion: 'spatial',
      side: 'top',
      class: { toast: 'motion-safe:starting:data-[front]:[translate:0_-100%]' },
    },
  ],
  defaultVariants: {
    placement: 'bottom-end',
    side: 'bottom',
    tone: 'neutral',
    motion: 'spatial',
    actionPlacement: 'inline',
    hasTitle: false,
    isCloseRevealed: true,
  },
});

export type ToastStyleProps = VariantProps<typeof toastStyles>;

type ToastMotion = 'spatial' | 'fade' | 'none';

type ToastSide = 'top' | 'bottom';

interface ToastLayout {
  y: number;
  scale: number;
  height?: number;
  isFront: boolean;
  isStacked: boolean;
}

function useToastMotion(): ToastMotion {
  const { spatialEnabled, effectsEnabled } = useMotionPreference();
  if (spatialEnabled) return 'spatial';
  return effectsEnabled ? 'fade' : 'none';
}

function subscribeVisibility(listener: () => void) {
  document.addEventListener('visibilitychange', listener);
  return () => document.removeEventListener('visibilitychange', listener);
}

function useDocumentHidden() {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === 'hidden',
    () => false,
  );
}

function useToasterOwnership(toasterId: string) {
  const [token] = useState(() => Symbol(toasterId));
  useEffect(() => registerOwner(toasterStore(toasterId), token), [toasterId, token]);
  return useSyncExternalStore(
    subscribeOwners,
    () => toasterStore(toasterId).owners.at(-1) === token,
    () => false,
  );
}

function useToastEntries(toasterId: string) {
  const subscribe = useCallback(
    (listener: () => void) => subscribeToaster(toasterStore(toasterId), listener),
    [toasterId],
  );
  return useSyncExternalStore(
    subscribe,
    () => toasterStore(toasterId).entries,
    () => noEntries,
  );
}

type FocusSource = 'none' | 'mouse' | 'other';

function useStackInteraction(listRef: RefObject<HTMLOListElement | null>) {
  const modality = useRef('keyboard');
  const [isHovered, setHovered] = useState(false);
  const [focusSource, setFocusSource] = useState<FocusSource>('none');
  const isDocumentHidden = useDocumentHidden();

  useEffect(() => {
    const onKeyDown = () => {
      modality.current = 'keyboard';
    };
    const onPointerDown = (event: globalThis.PointerEvent) => {
      modality.current = event.pointerType;
    };
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (focusSource === 'none' || !list) return;
    const observer = new MutationObserver(() => {
      if (!list.contains(document.activeElement)) setFocusSource('none');
    });
    observer.observe(list, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [focusSource, listRef]);

  const listProps = {
    onPointerEnter: (event: PointerEvent<HTMLOListElement>) => {
      if (event.pointerType !== 'touch') setHovered(true);
    },
    onPointerLeave: (event: PointerEvent<HTMLOListElement>) => {
      if (event.pointerType !== 'touch') setHovered(false);
    },
    onFocus: () => {
      setFocusSource(modality.current === 'mouse' ? 'mouse' : 'other');
    },
    onBlur: (event: FocusEvent<HTMLOListElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setFocusSource('none');
    },
  };

  const holdsStack = isHovered || focusSource === 'other';

  return {
    listProps,
    isExpanded: holdsStack,
    isPaused: holdsStack || isDocumentHidden,
  };
}

function selectRendered(entries: readonly ToastEntry[], limit: number) {
  let open = 0;
  return entries.filter(({ record }) => {
    if (record.exitReason) return true;
    open += 1;
    return open <= limit;
  });
}

function stackLayouts(
  entries: readonly ToastEntry[],
  heights: Record<string, number>,
  isExpanded: boolean,
  side: ToastSide,
) {
  const direction = side === 'bottom' ? -1 : 1;
  const frontHeight = entries[0] ? heights[entries[0].record.id] : undefined;
  const layouts = new Map<string, ToastLayout>();
  let offset = 0;

  entries.forEach(({ record }, index) => {
    const height = heights[record.id];
    layouts.set(record.id, {
      y: direction * (isExpanded ? offset : index * stackPeek),
      scale: isExpanded ? 1 : Math.max(0, 1 - index * stackScaleStep),
      height: isExpanded || index === 0 ? height : frontHeight,
      isFront: index === 0,
      isStacked: !isExpanded && index > 0,
    });
    offset += (height ?? 0) + stackGap;
  });

  const extent = isExpanded
    ? Math.max(0, offset - stackGap)
    : (frontHeight ?? 0) + Math.max(0, entries.length - 1) * stackPeek;

  return { layouts, extent };
}

const defaultLayout: ToastLayout = { y: 0, scale: 1, isFront: true, isStacked: false };

export interface ToasterProps {
  toasterId?: string;
  placement?: ToastPlacement;
  maxVisibleToasts?: number;
  duration?: number;
  showCloseButton?: boolean;
  isExpanded?: boolean;
  labels?: Partial<ToastLabels>;
  'aria-label'?: string;
  className?: string;
}

export function Toaster({
  toasterId = defaultToasterId,
  placement = 'bottom-end',
  maxVisibleToasts = 3,
  duration = 5000,
  showCloseButton = true,
  isExpanded = false,
  labels,
  'aria-label': ariaLabel,
  className,
}: ToasterProps) {
  const t = useLabels('toast', defaultToastLabels, labels);
  const isOwner = useToasterOwnership(toasterId);
  const side: ToastSide = placement.startsWith('top') ? 'top' : 'bottom';

  if (!isOwner) return null;

  return (
    <AriaToastRegion
      queue={toasterStore(toasterId).queue}
      aria-label={ariaLabel ?? t.notifications}
      data-slot="toaster"
      data-placement={placement}
      className={toastStyles({ placement, side }).region({ className })}
    >
      <ToastStack
        toasterId={toasterId}
        side={side}
        maxVisibleToasts={maxVisibleToasts}
        duration={duration}
        showCloseButton={showCloseButton}
        isExpanded={isExpanded}
        labels={labels}
      />
    </AriaToastRegion>
  );
}

interface ToastStackProps {
  toasterId: string;
  side: ToastSide;
  maxVisibleToasts: number;
  duration: number;
  showCloseButton: boolean;
  isExpanded: boolean;
  labels?: Partial<ToastLabels>;
}

function ToastStack({
  toasterId,
  side,
  maxVisibleToasts,
  duration,
  showCloseButton,
  isExpanded: isAlwaysExpanded,
  labels,
}: ToastStackProps) {
  const entries = useToastEntries(toasterId);
  const listRef = useRef<HTMLOListElement>(null);
  const { listProps, isExpanded: isInteracting, isPaused } = useStackInteraction(listRef);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const isExpanded = isAlwaysExpanded || isInteracting;

  const handleHeightChange = useCallback((id: string, height?: number) => {
    setHeights((current) => {
      if (current[id] === height) return current;
      const next = { ...current };
      if (height === undefined) delete next[id];
      else next[id] = height;
      return next;
    });
  }, []);

  const rendered = selectRendered(entries, Math.max(1, maxVisibleToasts));
  const open = rendered.filter(({ record }) => !record.exitReason);
  const all = stackLayouts(rendered, heights, isExpanded, side);
  const active = stackLayouts(open, heights, isExpanded, side);
  const extent = open.length ? active.extent : all.extent;

  return (
    <ol
      ref={listRef}
      {...listProps}
      data-slot="toast-list"
      data-expanded={isExpanded || undefined}
      data-paused={isPaused || undefined}
      className={toastStyles().list()}
      style={{ height: extent || undefined }}
    >
      {rendered.map((entry, index) => {
        const { id, exitReason } = entry.record;
        const layout = (exitReason ? all : active).layouts.get(id) ?? defaultLayout;
        return (
          <li
            key={entry.queued.key}
            className="contents"
            onKeyDown={(event: KeyboardEvent<HTMLLIElement>) => {
              if (event.key !== 'Escape' || event.defaultPrevented) return;
              event.preventDefault();
              dismissToast(id, 'escape');
            }}
          >
            <ToastItem
              entry={entry}
              layout={exitReason ? { ...layout, scale: layout.scale * 0.96 } : layout}
              zIndex={rendered.length - index}
              side={side}
              isPaused={isPaused}
              defaultDuration={duration}
              showCloseButton={showCloseButton}
              labels={labels}
              onHeightChange={handleHeightChange}
            />
          </li>
        );
      })}
    </ol>
  );
}

interface ToastItemProps {
  entry: ToastEntry;
  layout: ToastLayout;
  zIndex: number;
  side: ToastSide;
  isPaused: boolean;
  defaultDuration: number;
  showCloseButton: boolean;
  labels?: Partial<ToastLabels>;
  onHeightChange: (id: string, height?: number) => void;
}

function effectiveDuration(record: ToastRecord, defaultDuration: number) {
  if (record.duration !== undefined) return record.duration;
  if (record.isLoading || (record.tone === 'error' && record.action)) return Infinity;
  return defaultDuration;
}

function ToastItem({
  entry: { queued, record },
  layout,
  zIndex,
  side,
  isPaused,
  defaultDuration,
  showCloseButton,
  labels,
  onHeightChange,
}: ToastItemProps) {
  const t = useLabels('toast', defaultToastLabels, labels);
  const icons = useIcons();
  const motion = useToastMotion();
  const bodyRef = useRef<HTMLDivElement>(null);
  const contentId = useId();
  const [isActing, setActing] = useState(false);
  const { id, revision, tone, action, title, description } = record;
  const isExiting = record.exitReason !== undefined;
  const duration = effectiveDuration(record, defaultDuration);
  const isCountdownPaused = isPaused || isActing || isExiting;
  const isPersistent = !Number.isFinite(duration);
  const hasCloseButton = showCloseButton || isPersistent;
  const hasTitle = title != null;
  const hasDescription = description != null;
  const hasSupportingText = hasTitle || hasDescription;
  const messageId = `${contentId}-message`;
  const descriptionId = `${contentId}-description`;
  const describedBy = [hasTitle && messageId, hasDescription && descriptionId]
    .filter(Boolean)
    .join(' ');
  const styles = toastStyles({
    tone,
    side,
    motion,
    actionPlacement: hasSupportingText ? 'below' : 'inline',
    hasTitle,
    isCloseRevealed: isPersistent,
  });

  useEffect(() => markShown(id), [id]);

  useEffect(() => {
    if (isCountdownPaused || !Number.isFinite(duration)) return;
    const startedAt = Date.now();
    const timer = setTimeout(
      () => dismissToast(id, 'timeout'),
      remainingTime(id, revision, duration),
    );
    return () => {
      clearTimeout(timer);
      consumeTime(id, revision, duration, Date.now() - startedAt);
    };
  }, [id, revision, duration, isCountdownPaused]);

  useEffect(() => {
    if (!isExiting) return;
    const timer = setTimeout(() => removeToast(id), motion === 'none' ? 0 : exitDuration);
    return () => clearTimeout(timer);
  }, [id, isExiting, motion]);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const report = () => onHeightChange(id, body.offsetHeight);
    report();
    const observer = new ResizeObserver(report);
    observer.observe(body);
    return () => {
      observer.disconnect();
      onHeightChange(id, undefined);
    };
  }, [id, onHeightChange]);

  function handleAction() {
    if (!action) return;
    const result = action.onAction();
    if (!result || typeof result.then !== 'function') {
      dismissToast(id, 'action');
      return;
    }
    setActing(true);
    return Promise.resolve(result).then(
      () => {
        setActing(false);
        dismissToast(id, 'action');
      },
      (error: unknown) => {
        setActing(false);
        throw error;
      },
    );
  }

  const toneIcons = {
    neutral: null,
    info: icons.info,
    success: icons.checkCircle,
    warning: icons.warning,
    error: icons.error,
  } as const;
  const ToneIcon = toneIcons[tone];
  const icon = record.isLoading ? (
    <Spinner />
  ) : record.icon !== undefined ? (
    record.icon
  ) : ToneIcon ? (
    <ToneIcon />
  ) : null;
  return (
    <AriaToast
      toast={queued}
      data-slot="toast"
      data-tone={tone}
      data-loading={record.isLoading || undefined}
      data-front={layout.isFront || undefined}
      data-stacked={layout.isStacked || undefined}
      data-exiting={isExiting || undefined}
      aria-describedby={describedBy || undefined}
      className={styles.toast()}
      style={
        {
          '--ds-toast-y': `${layout.y}px`,
          '--ds-toast-scale': layout.scale,
          '--ds-toast-height': layout.height === undefined ? 'auto' : `${layout.height}px`,
          zIndex,
        } as CSSProperties
      }
    >
      <div ref={bodyRef} data-slot="body" className={styles.body()}>
        {icon != null ? (
          <span data-slot="icon" className={styles.icon()}>
            {icon}
          </span>
        ) : null}
        <div data-slot="main" className={styles.main()}>
          <AriaToastContent data-slot="content" className={styles.content()}>
            <Text
              slot="title"
              elementType="div"
              data-slot={hasTitle ? 'title' : 'message'}
              className={hasTitle ? styles.title() : styles.message()}
            >
              {hasTitle ? title : record.message}
            </Text>
            {hasTitle ? (
              <div id={messageId} data-slot="message" className={styles.message()}>
                {record.message}
              </div>
            ) : null}
            {hasDescription ? (
              <div id={descriptionId} data-slot="description" className={styles.description()}>
                {description}
              </div>
            ) : null}
          </AriaToastContent>
          {action ? (
            <Button
              variant="soft"
              tone="neutral"
              size="sm"
              className={styles.action()}
              onPress={handleAction}
            >
              {action.label}
            </Button>
          ) : null}
        </div>
        {hasCloseButton ? (
          <AriaButton
            aria-label={t.close}
            data-slot="close"
            className={styles.close()}
            onPress={() => dismissToast(id, 'close')}
          >
            <icons.close />
          </AriaButton>
        ) : null}
      </div>
    </AriaToast>
  );
}
