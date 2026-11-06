'use client';

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentProps,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type PointerEvent as ReactPointerEvent,
  type Ref,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import {
  animate,
  motion,
  useMotionValue,
  type AnimationPlaybackControls,
  type PanInfo,
} from 'motion/react';
import {
  Button as AriaButton,
  Dialog,
  DialogTrigger,
  Heading,
  Modal,
  ModalOverlay,
  OverlayTriggerStateContext,
  composeRenderProps,
  useLocale,
  type ButtonProps as AriaButtonProps,
  type DialogRenderProps,
  type DialogTriggerProps,
  type OverlayTriggerState,
  type PressEvent,
} from 'react-aria-components';
import { useControllableState } from '@/registry/ds/hooks/use-controllable-state';
import { spatialSpring } from '@/registry/ds/lib/motion';
import { tv, type VariantProps } from '@/registry/ds/lib/utils';
import { ButtonGroupContext } from '@/registry/ds/ui/button';
import { SurfaceContext } from '@/registry/ds/ui/card';
import { useIcons, useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';
import { useThemeScopeProps } from '@/registry/ds/lib/theme-scope';

export type SheetSide = 'start' | 'end' | 'top' | 'bottom';
export type SheetSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type SheetVariant = 'modal' | 'standard';
export type SheetSnapPoint = number | `${number}%` | `${number}px`;
type SheetMotion = 'spatial' | 'fade' | 'none';

export interface SheetLabels {
  close: string;
  dragHandle: string;
}

export const defaultSheetLabels: SheetLabels = {
  close: 'Close',
  dragHandle: 'Resize sheet',
};

const dismissDistance = 96;
const flingVelocity = 500;
const fade = 'data-[entering]:animate-ds-fade-in data-[exiting]:animate-ds-fade-out';
const reducedFade =
  'motion-reduce:data-[entering]:animate-ds-fade-in motion-reduce:data-[exiting]:animate-ds-fade-out';
const interactiveSelector = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  'label',
  '[contenteditable="true"]',
  ...[
    'button',
    'link',
    'checkbox',
    'radio',
    'switch',
    'slider',
    'tab',
    'option',
    'menuitem',
    'row',
    'gridcell',
    'combobox',
    'textbox',
    'searchbox',
  ].map((role) => `[role="${role}"]`),
].join(', ');

export const sheetStyles = tv({
  slots: {
    overlay: 'fixed inset-x-0 top-0 z-50 h-(--visual-viewport-height) bg-scrim/32',
    root: 'pointer-events-none z-50 flex flex-col outline-none',
    surface: [
      'pointer-events-auto relative flex min-h-0 flex-1 flex-col overflow-hidden bg-surface-container-low text-on-surface shadow-elevation-1',
      'forced-colors:border',
    ],
    dialog: 'flex min-h-0 flex-1 flex-col outline-none',
    handleZone:
      'flex h-12 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing',
    handle: [
      'state-layer focus-ring flex h-6 w-12 cursor-grab items-center justify-center rounded-full text-on-surface-variant active:cursor-grabbing',
      'after:absolute after:inset-x-0 after:-inset-y-3',
    ],
    handleBar: 'h-1 w-8 rounded-full bg-on-surface-variant/40 forced-colors:bg-[CanvasText]',
    header: 'flex shrink-0 items-start gap-3 px-6 pt-6 pb-4',
    heading: 'min-w-0 flex-1',
    title: 'text-title-lg text-on-surface',
    description: 'mt-1 text-body-md text-on-surface-variant',
    close: [
      'state-layer focus-ring inline-flex size-10 shrink-0 cursor-default items-center justify-center rounded-full text-on-surface-variant',
      'transition-colors duration-150 ease-standard data-[disabled]:text-on-surface/38 [&_svg]:size-6',
      'pointer-coarse:after:absolute pointer-coarse:after:-inset-1',
    ],
    body: 'focus-ring-inset min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6 text-body-md text-on-surface first:pt-6',
    footer:
      'flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-outline-variant px-6 py-4',
  },
  variants: {
    side: {
      start: {
        root: 'inset-y-0 inset-s-0 max-w-[calc(100%-3.5rem)]',
        surface: 'rounded-e-xl',
        dialog: 'pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]',
      },
      end: {
        root: 'inset-y-0 inset-e-0 max-w-[calc(100%-3.5rem)]',
        surface: 'rounded-s-xl',
        dialog: 'pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]',
      },
      top: {
        root: 'inset-x-0 top-0 mx-auto max-h-[calc(100%-3rem)] w-full',
        surface: 'rounded-b-xl',
        dialog: 'pt-[env(safe-area-inset-top)]',
      },
      bottom: {
        root: 'inset-x-0 bottom-0 mx-auto max-h-[calc(100%-3rem)] w-full',
        surface: 'rounded-t-xl',
        dialog: 'pb-[env(safe-area-inset-bottom)]',
      },
    },
    size: {
      sm: {},
      md: {},
      lg: {},
      xl: {},
      full: { root: 'max-w-none', surface: 'rounded-none' },
    },
    variant: {
      modal: { root: 'absolute' },
      standard: { root: 'fixed z-40' },
    },
    motion: {
      spatial: { overlay: fade, root: reducedFade },
      fade: { overlay: fade, root: fade },
      none: {},
    },
    hasHandle: {
      true: { header: 'pt-2' },
      false: {},
    },
    isDraggable: {
      true: { header: 'touch-none' },
      false: {},
    },
  },
  compoundVariants: [
    { side: ['start', 'end'], size: 'sm', class: { root: 'w-80' } },
    { side: ['start', 'end'], size: 'md', class: { root: 'w-100' } },
    { side: ['start', 'end'], size: 'lg', class: { root: 'w-140' } },
    { side: ['start', 'end'], size: 'xl', class: { root: 'w-180' } },
    { side: ['start', 'end'], size: 'full', class: { root: 'w-full' } },
    { side: ['top', 'bottom'], size: 'sm', class: { root: 'max-w-120' } },
    { side: ['top', 'bottom'], size: 'md', class: { root: 'max-w-160' } },
    { side: ['top', 'bottom'], size: 'lg', class: { root: 'max-w-224' } },
    { side: ['top', 'bottom'], size: 'xl', class: { root: 'max-w-300' } },
    { side: ['top', 'bottom'], size: 'full', class: { root: 'h-full max-h-none' } },
    {
      motion: 'spatial',
      side: 'start',
      class: {
        root: 'data-[entering]:animate-ds-sheet-in-start data-[exiting]:animate-ds-sheet-out-start',
      },
    },
    {
      motion: 'spatial',
      side: 'end',
      class: {
        root: 'data-[entering]:animate-ds-sheet-in-end data-[exiting]:animate-ds-sheet-out-end',
      },
    },
    {
      motion: 'spatial',
      side: 'top',
      class: {
        root: 'data-[entering]:animate-ds-sheet-in-top data-[exiting]:animate-ds-sheet-out-top',
      },
    },
    {
      motion: 'spatial',
      side: 'bottom',
      class: {
        root: 'data-[entering]:animate-ds-sheet-in-bottom data-[exiting]:animate-ds-sheet-out-bottom',
      },
    },
  ],
  defaultVariants: {
    side: 'end',
    size: 'md',
    variant: 'modal',
    motion: 'spatial',
  },
});

export type SheetStyleProps = VariantProps<typeof sheetStyles>;

type SheetSlots = ReturnType<typeof sheetStyles>;

function useSheetMotion(): SheetMotion {
  const { spatialEnabled, effectsEnabled } = useMotionPreference();
  if (spatialEnabled) return 'spatial';
  return effectsEnabled ? 'fade' : 'none';
}

function snapLength(point: SheetSnapPoint) {
  if (typeof point === 'number') return `${point}px`;
  return point.endsWith('%') ? `${parseFloat(point)}dvh` : point;
}

function snapPixels(point: SheetSnapPoint, viewport: number) {
  if (typeof point === 'number') return point;
  const value = parseFloat(point);
  return point.endsWith('%') ? (viewport * value) / 100 : value;
}

function parseSnapPoints(key: string): SheetSnapPoint[] {
  if (!key) return [];
  return key
    .split('|')
    .map((point) => (/^-?\d+(\.\d+)?$/.test(point) ? Number(point) : (point as SheetSnapPoint)));
}

function rubberBand(distance: number, dimension: number) {
  if (dimension <= 0) return 0;
  return dimension * (1 - 1 / ((distance * 0.55) / dimension + 1));
}

function viewportHeight() {
  return typeof window === 'undefined' ? 0 : window.innerHeight;
}

interface SnapStop {
  point: SheetSnapPoint | undefined;
  offset: number;
}

interface SheetBounds {
  height: number;
  stops: SnapStop[];
}

function offsetOf(bounds: SheetBounds, point: SheetSnapPoint | undefined) {
  return (bounds.stops.find((stop) => stop.point === point) ?? bounds.stops[0]).offset;
}

function nearestStop(stops: SnapStop[], offset: number) {
  return stops.reduce(
    (best, stop, index) =>
      Math.abs(stop.offset - offset) < Math.abs(stops[best].offset - offset) ? index : best,
    0,
  );
}

interface SheetDragProps {
  onPointerDownCapture: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPanStart: () => void;
  onPan: (event: PointerEvent, info: PanInfo) => void;
  onPanEnd: (event: PointerEvent, info: PanInfo) => void;
}

interface SheetDragOptions {
  surfaceRef: RefObject<HTMLDivElement | null>;
  isEnabled: boolean;
  isDismissable: boolean;
  snapPoints?: SheetSnapPoint[];
  snapPoint?: SheetSnapPoint;
  defaultSnapPoint?: SheetSnapPoint;
  onSnapPointChange?: (snapPoint: SheetSnapPoint) => void;
  onDismiss: () => void;
}

function useSheetDrag({
  surfaceRef,
  isEnabled,
  isDismissable,
  snapPoints,
  snapPoint,
  defaultSnapPoint,
  onSnapPointChange,
  onDismiss,
}: SheetDragOptions) {
  const { spatialEnabled, profile } = useMotionPreference();
  const y = useMotionValue(0);
  const pointsKey = isEnabled && snapPoints?.length ? snapPoints.join('|') : '';
  const points = useMemo(() => parseSnapPoints(pointsKey), [pointsKey]);
  const [activeSnapPoint, setActiveSnapPoint] = useControllableState<SheetSnapPoint | undefined>(
    snapPoint,
    defaultSnapPoint ?? points[0],
    (next) => {
      if (next !== undefined) onSnapPointChange?.(next);
    },
  );
  const [isDragging, setDragging] = useState(false);
  const animation = useRef<AnimationPlaybackControls | null>(null);
  const appliedKey = useRef<string | null>(null);
  const gesture = useRef({
    ignore: false,
    moved: false,
    origin: 0,
    bounds: { height: 0, stops: [] } as SheetBounds,
  });

  const largestPoint = useMemo(() => {
    const viewport = viewportHeight();
    return [...points].sort((a, b) => snapPixels(b, viewport) - snapPixels(a, viewport))[0];
  }, [points]);

  const measure = useCallback((): SheetBounds => {
    const height = surfaceRef.current?.offsetHeight ?? 0;
    const viewport = viewportHeight();
    const stops = points
      .map((point) => ({
        point,
        offset: Math.min(Math.max(height - snapPixels(point, viewport), 0), height),
      }))
      .sort((a, b) => a.offset - b.offset);
    return { height, stops: stops.length ? stops : [{ point: undefined, offset: 0 }] };
  }, [points, surfaceRef]);

  const settle = useCallback(
    (offset: number, velocity = 0) => {
      animation.current?.stop();
      if (!spatialEnabled) {
        y.set(offset);
        return;
      }
      animation.current = animate(y, offset, { ...spatialSpring('medium', profile), velocity });
    },
    [profile, spatialEnabled, y],
  );

  useLayoutEffect(() => {
    if (!points.length || isDragging) return;
    const key = `${pointsKey}:${activeSnapPoint}`;
    if (appliedKey.current === key) return;
    const offset = offsetOf(measure(), activeSnapPoint);
    if (appliedKey.current === null) y.set(offset);
    else settle(offset);
    appliedKey.current = key;
  }, [activeSnapPoint, isDragging, measure, points.length, pointsKey, settle, y]);

  useEffect(() => {
    if (!points.length) return;
    const reposition = () => y.set(offsetOf(measure(), activeSnapPoint));
    window.addEventListener('resize', reposition);
    return () => window.removeEventListener('resize', reposition);
  }, [activeSnapPoint, measure, points.length, y]);

  useEffect(() => () => animation.current?.stop(), []);

  const onPointerDownCapture = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target as Element;
    gesture.current.ignore =
      !target.closest('[data-slot="sheet-handle"]') && Boolean(target.closest(interactiveSelector));
    gesture.current.moved = false;
  }, []);

  const onPanStart = useCallback(() => {
    if (gesture.current.ignore) return;
    animation.current?.stop();
    gesture.current.moved = true;
    gesture.current.origin = y.get();
    gesture.current.bounds = measure();
    setDragging(true);
  }, [measure, y]);

  const onPan = useCallback(
    (_event: PointerEvent, info: PanInfo) => {
      const { moved, origin, bounds } = gesture.current;
      if (!moved) return;
      const min = bounds.stops[0].offset;
      const max = isDismissable ? bounds.height : bounds.stops[bounds.stops.length - 1].offset;
      const next = origin + info.offset.y;
      if (next < min) y.set(min - rubberBand(min - next, bounds.height));
      else if (next > max) y.set(max + rubberBand(next - max, bounds.height));
      else y.set(next);
    },
    [isDismissable, y],
  );

  const onPanEnd = useCallback(
    (_event: PointerEvent, info: PanInfo) => {
      const { moved, origin, bounds } = gesture.current;
      if (!moved) return;
      setDragging(false);
      const { stops } = bounds;
      const current = y.get();
      const velocity = info.velocity.y;
      const start = nearestStop(stops, origin);
      let index = nearestStop(stops, current);
      if (velocity > flingVelocity) index = Math.max(start + 1, index);
      else if (velocity < -flingVelocity) index = Math.max(Math.min(start - 1, index), 0);
      const lowest = stops[stops.length - 1].offset;
      const pastLowest = velocity >= -flingVelocity && current - lowest > dismissDistance;
      if (isDismissable && (index >= stops.length || pastLowest)) {
        onDismiss();
        return;
      }
      const stop = stops[Math.min(index, stops.length - 1)];
      settle(stop.offset, velocity);
      if (stop.point !== undefined && stop.point !== activeSnapPoint) {
        appliedKey.current = `${pointsKey}:${stop.point}`;
        setActiveSnapPoint(stop.point);
      }
    },
    [activeSnapPoint, isDismissable, onDismiss, pointsKey, setActiveSnapPoint, settle, y],
  );

  const cycle = useCallback(
    (event: PressEvent) => {
      if (event.pointerType !== 'keyboard' && event.pointerType !== 'virtual') {
        if (gesture.current.moved) return;
      }
      const { stops } = measure();
      if (stops.length < 2) return;
      const index = stops.findIndex((stop) => stop.point === activeSnapPoint);
      const next = index <= 0 ? stops[stops.length - 1] : stops[index - 1];
      if (next.point !== undefined) setActiveSnapPoint(next.point);
    },
    [activeSnapPoint, measure, setActiveSnapPoint],
  );

  const revealFocused = useCallback(
    (event: ReactFocusEvent<HTMLDivElement>) => {
      const surface = surfaceRef.current;
      const target = event.target as Element;
      if (!surface || points.length < 2 || largestPoint === undefined) return;
      if (activeSnapPoint === largestPoint || !target.matches(':focus-visible')) return;
      if (target.matches('[data-slot="sheet-dialog"]')) return;
      const bottom = target.getBoundingClientRect().bottom - surface.getBoundingClientRect().top;
      if (bottom > surface.offsetHeight - y.get() + 1) setActiveSnapPoint(largestPoint);
    },
    [activeSnapPoint, largestPoint, points.length, setActiveSnapPoint, surfaceRef, y],
  );

  const dragProps = useMemo<SheetDragProps>(
    () => ({ onPointerDownCapture, onPanStart, onPan, onPanEnd }),
    [onPan, onPanEnd, onPanStart, onPointerDownCapture],
  );

  return {
    y,
    isDragging,
    activeSnapPoint,
    isExpanded: activeSnapPoint !== undefined && activeSnapPoint === largestPoint,
    canResize: points.length > 1,
    dragProps,
    cycle,
    revealFocused,
  };
}

type SheetDrag = ReturnType<typeof useSheetDrag>;

type PresencePhase = 'entering' | 'open' | 'exiting' | 'closed';

function useSheetPresence(isOpen: boolean, ref: RefObject<HTMLElement | null>) {
  const [phase, setPhase] = useState<PresencePhase>(isOpen ? 'entering' : 'closed');
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    setPhase(isOpen ? 'entering' : 'exiting');
  }

  useLayoutEffect(() => {
    if (phase !== 'entering' && phase !== 'exiting') return;
    const animations = ref.current?.getAnimations?.() ?? [];
    let isCurrent = true;
    const settle = () => {
      if (isCurrent) setPhase(phase === 'entering' ? 'open' : 'closed');
    };
    Promise.all(animations.map((animation) => animation.finished)).then(settle, settle);
    return () => {
      isCurrent = false;
    };
  }, [phase, ref]);

  return {
    isMounted: phase !== 'closed',
    isEntering: phase === 'entering',
    isExiting: phase === 'exiting',
  };
}

function useRestoreFocus(isMounted: boolean, ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    if (!isMounted) return;
    const previous = document.activeElement;
    const element = ref.current;
    return () => {
      const active = document.activeElement;
      const lostFocus = !active || active === document.body || Boolean(element?.contains(active));
      if (lostFocus && previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, [isMounted, ref]);
}

function useLocalOverlayState(
  isOpen: boolean | undefined,
  defaultOpen: boolean | undefined,
  onOpenChange: ((isOpen: boolean) => void) | undefined,
): OverlayTriggerState {
  const [open, setOpen] = useControllableState(isOpen, defaultOpen ?? false, onOpenChange);
  return useMemo(
    () => ({
      isOpen: open,
      setOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      toggle: () => setOpen(!open),
      point: null,
      setPoint: () => {},
    }),
    [open, setOpen],
  );
}

const subscribeNothing = () => () => {};

function useIsClient() {
  return useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
}

interface SheetContextValue {
  hasHandle: boolean;
  isDraggable: boolean;
  descriptionId: string;
  setHasDescription: (hasDescription: boolean) => void;
  dragProps?: SheetDragProps;
  labels?: Partial<SheetLabels>;
}

const SheetContext = createContext<SheetContextValue | null>(null);

export type SheetTriggerProps = DialogTriggerProps;

export function SheetTrigger(props: SheetTriggerProps) {
  return <DialogTrigger {...props} />;
}

export interface SheetProps {
  side?: SheetSide;
  size?: SheetSize;
  variant?: SheetVariant;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  isDismissable?: boolean;
  isKeyboardDismissDisabled?: boolean;
  shouldCloseOnInteractOutside?: (element: Element) => boolean;
  snapPoints?: SheetSnapPoint[];
  snapPoint?: SheetSnapPoint;
  defaultSnapPoint?: SheetSnapPoint;
  onSnapPointChange?: (snapPoint: SheetSnapPoint) => void;
  showDragHandle?: boolean;
  labels?: Partial<SheetLabels>;
  role?: 'dialog' | 'alertdialog';
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  className?: string;
  children?: ReactNode | ((renderProps: DialogRenderProps) => ReactNode);
}

interface SheetRootProps {
  dir: 'ltr' | 'rtl';
  lang: string;
  'data-slot': string;
  'data-side': SheetSide;
  'data-size': SheetSize;
  'data-variant': SheetVariant;
  style?: CSSProperties;
}

function snapStyle(snapPoints: SheetSnapPoint[] | undefined): CSSProperties | undefined {
  if (!snapPoints?.length) return undefined;
  return { height: `max(${snapPoints.map(snapLength).join(', ')})`, maxHeight: '100%' };
}

export function Sheet({
  side = 'end',
  size = 'md',
  variant = 'modal',
  isOpen,
  defaultOpen,
  onOpenChange,
  isDismissable = true,
  isKeyboardDismissDisabled = false,
  shouldCloseOnInteractOutside,
  snapPoints,
  snapPoint,
  defaultSnapPoint,
  onSnapPointChange,
  showDragHandle = true,
  labels,
  role,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  className,
  children,
}: SheetProps) {
  const { locale, direction } = useLocale();
  const themeScope = useThemeScopeProps();
  const motionMode = useSheetMotion();
  const styles = sheetStyles({ side, size, variant, motion: motionMode });
  const bottomSnapPoints = side === 'bottom' && snapPoints?.length ? snapPoints : undefined;
  const rootProps: SheetRootProps = {
    dir: direction,
    lang: locale,
    'data-slot': 'sheet',
    'data-side': side,
    'data-size': size,
    'data-variant': variant,
    style: snapStyle(bottomSnapPoints),
  };

  const surface = (
    <SheetSurface
      styles={styles}
      side={side}
      isDismissable={isDismissable}
      showDragHandle={showDragHandle}
      snapPoints={bottomSnapPoints}
      snapPoint={snapPoint}
      defaultSnapPoint={defaultSnapPoint}
      onSnapPointChange={onSnapPointChange}
      labels={labels}
      dialogProps={{
        role,
        id,
        'aria-label': ariaLabel,
        'aria-labelledby': ariaLabelledby,
        'aria-describedby': ariaDescribedby,
      }}
      className={className}
    >
      {children}
    </SheetSurface>
  );

  if (variant === 'standard') {
    return (
      <StandardSheet
        isOpen={isOpen}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        isKeyboardDismissDisabled={isKeyboardDismissDisabled}
        rootProps={rootProps}
        className={styles.root()}
      >
        {surface}
      </StandardSheet>
    );
  }

  return (
    <ModalOverlay
      isOpen={isOpen}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled}
      shouldCloseOnInteractOutside={shouldCloseOnInteractOutside}
      dir={direction}
      lang={locale}
      {...themeScope}
      data-slot="sheet-overlay"
      className={styles.overlay()}
    >
      <Modal {...rootProps} className={styles.root()}>
        {surface}
      </Modal>
    </ModalOverlay>
  );
}

interface StandardSheetProps {
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  isKeyboardDismissDisabled: boolean;
  rootProps: SheetRootProps;
  className: string;
  children: ReactNode;
}

function StandardSheet({
  isOpen,
  defaultOpen,
  onOpenChange,
  isKeyboardDismissDisabled,
  rootProps,
  className,
  children,
}: StandardSheetProps) {
  const contextState = use(OverlayTriggerStateContext);
  const localState = useLocalOverlayState(isOpen, defaultOpen, onOpenChange);
  const usesTrigger = isOpen == null && defaultOpen == null && contextState != null;
  const state = usesTrigger ? contextState : localState;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (usesTrigger) {
      console.warn(
        'Sheet: a standard sheet inside SheetTrigger passes the trigger press handlers to every button inside it. Control it with isOpen and onOpenChange instead.',
      );
    }
  }, [usesTrigger]);
  const presence = useSheetPresence(state.isOpen, ref);
  const isClient = useIsClient();
  const themeScope = useThemeScopeProps();
  useRestoreFocus(presence.isMounted, ref);

  if (!isClient || !presence.isMounted) return null;

  return createPortal(
    <OverlayTriggerStateContext value={state}>
      <div
        {...themeScope}
        ref={ref}
        {...rootProps}
        data-entering={presence.isEntering || undefined}
        data-exiting={presence.isExiting || undefined}
        className={className}
        onKeyDown={(event) => {
          const isDismissKey = event.key === 'Escape' && !event.nativeEvent.isComposing;
          if (!isDismissKey || isKeyboardDismissDisabled) return;
          event.stopPropagation();
          state.close();
        }}
      >
        {children}
      </div>
    </OverlayTriggerStateContext>,
    document.body,
  );
}

interface SheetDialogProps {
  role?: 'dialog' | 'alertdialog';
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

interface SheetSurfaceProps {
  styles: SheetSlots;
  side: SheetSide;
  isDismissable: boolean;
  showDragHandle: boolean;
  snapPoints?: SheetSnapPoint[];
  snapPoint?: SheetSnapPoint;
  defaultSnapPoint?: SheetSnapPoint;
  onSnapPointChange?: (snapPoint: SheetSnapPoint) => void;
  labels?: Partial<SheetLabels>;
  dialogProps: SheetDialogProps;
  className?: string;
  children: SheetProps['children'];
}

function SheetSurface({
  styles,
  side,
  isDismissable,
  showDragHandle,
  snapPoints,
  snapPoint,
  defaultSnapPoint,
  onSnapPointChange,
  labels,
  dialogProps,
  className,
  children,
}: SheetSurfaceProps) {
  const state = use(OverlayTriggerStateContext);
  const t = useLabels('sheet', defaultSheetLabels, labels);
  const descriptionId = useId();
  const [hasDescription, setHasDescription] = useState(false);
  const isDraggable = side === 'bottom';
  const hasHandle = isDraggable && showDragHandle;
  const surfaceRef = useRef<HTMLDivElement>(null);
  const dismiss = useCallback(() => state?.close(), [state]);
  const drag = useSheetDrag({
    surfaceRef,
    isEnabled: isDraggable,
    isDismissable,
    snapPoints,
    snapPoint,
    defaultSnapPoint,
    onSnapPointChange,
    onDismiss: dismiss,
  });

  const context = useMemo<SheetContextValue>(
    () => ({
      hasHandle,
      isDraggable,
      descriptionId,
      setHasDescription,
      dragProps: isDraggable ? drag.dragProps : undefined,
      labels,
    }),
    [descriptionId, drag.dragProps, hasHandle, isDraggable, labels],
  );

  const describedBy =
    [dialogProps['aria-describedby'], hasDescription ? descriptionId : undefined]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <motion.div
      ref={surfaceRef}
      data-slot="sheet-surface"
      data-dragging={drag.isDragging || undefined}
      data-snap-point={drag.activeSnapPoint}
      onFocus={drag.revealFocused}
      style={{ y: drag.y }}
      className={styles.surface({ className })}
    >
      <Dialog
        {...dialogProps}
        aria-describedby={describedBy}
        data-slot="sheet-dialog"
        className={styles.dialog()}
      >
        {(renderProps) => (
          <SheetContext value={context}>
            <SurfaceContext value="surface-container-low">
              <ButtonGroupContext value={null}>
                {hasHandle ? (
                  <SheetHandle styles={styles} drag={drag} label={t.dragHandle} />
                ) : null}
                {typeof children === 'function' ? children(renderProps) : children}
              </ButtonGroupContext>
            </SurfaceContext>
          </SheetContext>
        )}
      </Dialog>
    </motion.div>
  );
}

interface SheetHandleProps {
  styles: SheetSlots;
  drag: SheetDrag;
  label: string;
}

function SheetHandle({ styles, drag, label }: SheetHandleProps) {
  return (
    <motion.div data-slot="sheet-handle-zone" {...drag.dragProps} className={styles.handleZone()}>
      {drag.canResize ? (
        <AriaButton
          data-slot="sheet-handle"
          aria-label={label}
          aria-expanded={drag.isExpanded}
          onPress={drag.cycle}
          className={styles.handle()}
        >
          <span className={styles.handleBar()} />
        </AriaButton>
      ) : (
        <span data-slot="sheet-handle" aria-hidden="true" className={styles.handleBar()} />
      )}
    </motion.div>
  );
}

export interface SheetHeaderProps {
  title?: ReactNode;
  description?: ReactNode;
  showCloseButton?: boolean;
  id?: string;
  className?: string;
  children?: ReactNode;
}

export function SheetHeader({
  title,
  description,
  showCloseButton = true,
  id,
  className,
  children,
}: SheetHeaderProps) {
  const context = use(SheetContext);
  const hasDescription = description != null;
  const setHasDescription = context?.setHasDescription;
  const styles = sheetStyles({
    hasHandle: context?.hasHandle ?? false,
    isDraggable: context?.isDraggable ?? false,
  });

  useLayoutEffect(() => {
    if (!hasDescription || !setHasDescription) return;
    setHasDescription(true);
    return () => setHasDescription(false);
  }, [hasDescription, setHasDescription]);

  return (
    <motion.div
      id={id}
      data-slot="sheet-header"
      {...context?.dragProps}
      className={styles.header({ className })}
    >
      <div data-slot="sheet-heading" className={styles.heading()}>
        {title != null ? (
          <Heading slot="title" level={2} data-slot="sheet-title" className={styles.title()}>
            {title}
          </Heading>
        ) : null}
        {hasDescription ? (
          <p
            id={context?.descriptionId}
            data-slot="sheet-description"
            className={styles.description()}
          >
            {description}
          </p>
        ) : null}
        {children}
      </div>
      {showCloseButton ? <SheetClose className="-me-2 -mt-2" /> : null}
    </motion.div>
  );
}

function useIsScrollable() {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [isScrollable, setScrollable] = useState(false);

  useLayoutEffect(() => {
    if (!element) return;
    const target = element;
    const update = () => setScrollable(target.scrollHeight - target.clientHeight > 1);
    const resizeObserver = new ResizeObserver(update);
    const observeChildren = () => {
      for (const child of Array.from(target.children)) resizeObserver.observe(child);
    };
    const mutationObserver = new MutationObserver(() => {
      observeChildren();
      update();
    });
    resizeObserver.observe(target);
    observeChildren();
    mutationObserver.observe(target, { childList: true });
    update();
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [element]);

  return [setElement, isScrollable] as const;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

export type SheetBodyProps = ComponentProps<'div'>;

export function SheetBody({ className, ref, ...props }: SheetBodyProps) {
  const [setElement, isScrollable] = useIsScrollable();

  const setRefs = useCallback(
    (element: HTMLDivElement | null) => {
      setElement(element);
      assignRef(ref, element);
    },
    [ref, setElement],
  );

  return (
    <div
      tabIndex={isScrollable ? 0 : undefined}
      {...props}
      ref={setRefs}
      data-slot="sheet-body"
      data-scrollable={isScrollable || undefined}
      className={sheetStyles().body({ className })}
    />
  );
}

export type SheetFooterProps = ComponentProps<'div'>;

export function SheetFooter({ className, ...props }: SheetFooterProps) {
  return (
    <div {...props} data-slot="sheet-footer" className={sheetStyles().footer({ className })} />
  );
}

export type SheetCloseProps = Omit<AriaButtonProps, 'slot' | 'children'>;

export function SheetClose({ className, 'aria-label': ariaLabel, ...props }: SheetCloseProps) {
  const t = useLabels('sheet', defaultSheetLabels, use(SheetContext)?.labels);
  const icons = useIcons();

  return (
    <AriaButton
      {...props}
      slot="close"
      aria-label={ariaLabel ?? t.close}
      data-slot="sheet-close"
      className={composeRenderProps(className, (className) => sheetStyles().close({ className }))}
    >
      <icons.close />
    </AriaButton>
  );
}
