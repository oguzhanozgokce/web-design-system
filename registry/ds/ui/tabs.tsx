'use client';

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import {
  Button as AriaButton,
  SelectionIndicator,
  Tab as AriaTab,
  TabList as AriaTabList,
  TabListStateContext,
  TabPanel as AriaTabPanel,
  Tabs as AriaTabs,
  composeRenderProps,
  type TabListProps as AriaTabListProps,
  type TabPanelProps as AriaTabPanelProps,
  type TabProps as AriaTabProps,
  type TabsProps as AriaTabsProps,
} from 'react-aria-components';
import { tv } from '@/registry/ds/lib/utils';
import { Badge, BadgeAnchor } from '@/registry/ds/ui/badge';
import { useIcons, useMotionPreference } from '@/registry/ds/ui/ds-provider';

export const tabsStyles = tv({
  slots: {
    root: 'group/tabs flex min-w-0',
    listContainer: 'relative flex min-w-0',
    scroller: 'relative flex min-w-0 flex-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    list: 'flex gap-0.5',
    tab: [
      'focus-ring-inset no-tap-highlight group/tab relative flex shrink-0 cursor-pointer items-center font-medium whitespace-nowrap text-on-surface-variant no-underline select-none',
      'transition-[color,background-color] duration-150 ease-out motion-reduce:transition-none',
      'data-[selected]:text-on-surface data-[hovered]:text-on-surface',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
    ],
    content: 'relative flex items-center justify-center gap-1.5',
    icon: 'relative inline-flex shrink-0 items-center justify-center text-(length:--icon-size) [&_svg]:size-[1em]',
    label: '',
    indicatorTrack: 'pointer-events-none absolute inset-0 [direction:ltr]',
    indicator: [
      'pointer-events-none absolute forced-color-adjust-none forced-colors:bg-[Highlight]',
      'transition-[width,height,translate] duration-250 ease-fluid motion-reduce:transition-none',
    ],
    scrollEdge: 'pointer-events-none absolute z-[1] flex items-center justify-center',
    scrollButton: [
      'no-tap-highlight transition-control pointer-events-auto inline-flex shrink-0 cursor-pointer items-center justify-center rounded-control bg-surface-overlay text-on-surface-variant shadow-xs',
      'animate-ds-fade-in motion-reduce:animate-none',
      'data-[hovered]:bg-surface-overlay-hover data-[hovered]:text-on-surface data-[pressed]:scale-[0.94] motion-reduce:data-[pressed]:scale-100',
      '[&_svg]:size-(--scroll-icon-size)',
    ],
    panel: 'focus-ring min-w-0 rounded-item',
  },
  variants: {
    variant: {
      underline: {
        listContainer:
          'before:pointer-events-none before:absolute before:bg-outline-subtle before:forced-color-adjust-none forced-colors:before:bg-[CanvasText]',
        tab: 'rounded-item data-[hovered]:bg-neutral-soft',
        indicator: 'rounded-full bg-primary',
      },
      pill: {
        listContainer: 'max-w-full bg-neutral-soft p-1',
        tab: 'rounded-control forced-colors:data-[selected]:text-[HighlightText] forced-colors:data-[selected]:forced-color-adjust-none',
        indicator: 'inset-0 rounded-control bg-surface-segment shadow-xs',
      },
    },
    size: {
      sm: {
        scrollButton: 'size-6 [--scroll-icon-size:0.875rem]',
      },
      md: {
        scrollButton: 'size-8 [--scroll-icon-size:1rem]',
      },
      lg: {
        scrollButton: 'size-10 [--scroll-icon-size:1.25rem]',
      },
    },
    orientation: {
      horizontal: {
        root: 'flex-col gap-4',
        scroller:
          'overflow-x-auto overflow-y-hidden [--fade-angle:90deg] rtl:[--fade-angle:270deg]',
        list: 'w-max min-w-full',
        scrollEdge: 'inset-y-0',
      },
      vertical: {
        root: 'flex-row items-start gap-6',
        listContainer: 'shrink-0 flex-col',
        scroller: 'min-h-0 flex-col overflow-x-hidden overflow-y-auto [--fade-angle:180deg]',
        list: 'h-max min-h-full flex-col',
        tab: 'w-full justify-start',
        scrollEdge: 'inset-x-0',
        panel: 'flex-1',
      },
    },
    edge: {
      start: '',
      end: '',
    },
    stacked: {
      true: { content: 'flex-col-reverse gap-1' },
      false: '',
    },
    fullWidth: {
      true: '',
      false: '',
    },
    overflow: {
      true: {
        scroller:
          'data-[overflow-end]:[--fade-end:2.5rem] data-[overflow-start]:[--fade-start:2.5rem] [mask-image:linear-gradient(var(--fade-angle),transparent,var(--color-on-surface)_var(--fade-start,0px),var(--color-on-surface)_calc(100%_-_var(--fade-end,0px)),transparent)]',
      },
      false: '',
    },
    instant: {
      true: { tab: 'transition-none', indicator: 'transition-none' },
      false: '',
    },
    animated: {
      true: { panel: 'data-[entering]:animate-ds-fade-in' },
      false: '',
    },
  },
  compoundVariants: [
    { variant: 'underline', size: 'sm', class: { tab: 'h-8 px-2.5 text-sm [--icon-size:1rem]' } },
    { variant: 'underline', size: 'md', class: { tab: 'h-10 px-3 text-sm [--icon-size:1rem]' } },
    {
      variant: 'underline',
      size: 'lg',
      class: { tab: 'h-12 px-4 text-base [--icon-size:1.25rem]' },
    },
    { variant: 'pill', size: 'sm', class: { tab: 'h-6 px-2.5 text-xs [--icon-size:0.875rem]' } },
    { variant: 'pill', size: 'md', class: { tab: 'h-8 px-4 text-sm [--icon-size:1rem]' } },
    {
      variant: 'pill',
      size: 'lg',
      class: { tab: 'h-10 px-5 text-base [--icon-size:1.25rem]' },
    },
    {
      variant: 'underline',
      orientation: 'horizontal',
      class: {
        listContainer: 'before:inset-x-0 before:bottom-0 before:h-px',
        indicator: 'bottom-0 h-0.5 w-full inset-s-0',
      },
    },
    {
      variant: 'underline',
      orientation: 'vertical',
      class: {
        listContainer: 'self-stretch before:inset-y-0 before:inset-e-0 before:w-px',
        indicator: 'inset-e-0 top-0 h-full w-0.5',
      },
    },
    {
      variant: 'pill',
      orientation: 'horizontal',
      class: {
        listContainer: 'w-fit rounded-control',
        indicator: 'top-0 h-full w-full inset-s-0',
      },
    },
    {
      variant: 'pill',
      orientation: 'vertical',
      class: { listContainer: 'self-start rounded-container' },
    },
    {
      variant: 'underline',
      orientation: 'horizontal',
      edge: 'start',
      class: { scrollEdge: 'inset-s-0' },
    },
    {
      variant: 'underline',
      orientation: 'horizontal',
      edge: 'end',
      class: { scrollEdge: 'inset-e-0' },
    },
    {
      variant: 'pill',
      orientation: 'horizontal',
      edge: 'start',
      class: { scrollEdge: 'inset-s-1' },
    },
    { variant: 'pill', orientation: 'horizontal', edge: 'end', class: { scrollEdge: 'inset-e-1' } },
    {
      variant: 'underline',
      orientation: 'vertical',
      edge: 'start',
      class: { scrollEdge: 'top-0' },
    },
    {
      variant: 'underline',
      orientation: 'vertical',
      edge: 'end',
      class: { scrollEdge: 'bottom-0' },
    },
    { variant: 'pill', orientation: 'vertical', edge: 'start', class: { scrollEdge: 'top-1' } },
    { variant: 'pill', orientation: 'vertical', edge: 'end', class: { scrollEdge: 'bottom-1' } },
    {
      variant: 'pill',
      orientation: 'horizontal',
      fullWidth: true,
      class: { listContainer: 'w-full' },
    },
    {
      orientation: 'horizontal',
      fullWidth: true,
      class: { tab: 'flex-1 justify-center' },
    },
    { stacked: true, class: { tab: 'h-auto py-2' } },
  ],
  defaultVariants: {
    variant: 'underline',
    size: 'md',
    orientation: 'horizontal',
    stacked: false,
    fullWidth: false,
    overflow: false,
    instant: false,
    animated: true,
  },
});

export type TabsVariant = 'underline' | 'pill';

export type TabsSize = 'sm' | 'md' | 'lg';

export type TabsIconPlacement = 'top' | 'start';

type Orientation = 'horizontal' | 'vertical';

interface TabsStyleContextValue {
  variant: TabsVariant;
  size: TabsSize;
  orientation: Orientation;
  iconPlacement: TabsIconPlacement;
  fullWidth: boolean;
  instant: boolean;
  animated: boolean;
}

const TabsStyleContext = createContext<TabsStyleContextValue>({
  variant: 'underline',
  size: 'md',
  orientation: 'horizontal',
  iconPlacement: 'start',
  fullWidth: false,
  instant: false,
  animated: true,
});

export interface TabsProps extends Omit<AriaTabsProps, 'className'> {
  variant?: TabsVariant;
  size?: TabsSize;
  iconPlacement?: TabsIconPlacement;
  fullWidth?: boolean;
  className?: AriaTabsProps['className'];
}

export function Tabs({
  variant = 'underline',
  size = 'md',
  orientation = 'horizontal',
  iconPlacement,
  fullWidth = false,
  className,
  ...props
}: TabsProps) {
  const { spatialEnabled, effectsEnabled } = useMotionPreference();
  const placement = orientation === 'vertical' ? 'start' : (iconPlacement ?? 'start');

  const context = useMemo<TabsStyleContextValue>(
    () => ({
      variant,
      size,
      orientation,
      iconPlacement: placement,
      fullWidth,
      instant: !spatialEnabled,
      animated: effectsEnabled,
    }),
    [variant, size, orientation, placement, fullWidth, spatialEnabled, effectsEnabled],
  );

  return (
    <TabsStyleContext value={context}>
      <AriaTabs
        {...props}
        orientation={orientation}
        data-slot="tabs"
        data-variant={variant}
        data-size={size}
        data-icon-placement={placement}
        data-full-width={fullWidth || undefined}
        className={composeRenderProps(className, (className) =>
          tabsStyles({ variant, orientation }).root({ className }),
        )}
      />
    </TabsStyleContext>
  );
}

interface OverflowEdges {
  start: boolean;
  end: boolean;
}

function useOverflowEdges(
  scrollerRef: RefObject<HTMLDivElement | null>,
  listRef: RefObject<HTMLDivElement | null>,
  orientation: Orientation,
) {
  const [edges, setEdges] = useState<OverflowEdges>({ start: false, end: false });

  useEffect(() => {
    const scroller = scrollerRef.current;
    const list = listRef.current;
    if (!scroller || !list) return;

    const update = () => {
      const vertical = orientation === 'vertical';
      const viewport = vertical ? scroller.clientHeight : scroller.clientWidth;
      const content = vertical ? scroller.scrollHeight : scroller.scrollWidth;
      const position = Math.abs(vertical ? scroller.scrollTop : scroller.scrollLeft);
      const next = { start: position > 1, end: position < content - viewport - 1 };
      setEdges((previous) =>
        previous.start === next.start && previous.end === next.end ? previous : next,
      );
    };

    update();
    scroller.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(scroller);
    observer.observe(list);
    return () => {
      scroller.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [scrollerRef, listRef, orientation]);

  return edges;
}

const edgeZone = 40;

function useRevealSelectedTab(
  scrollerRef: RefObject<HTMLDivElement | null>,
  orientation: Orientation,
  smooth: boolean,
) {
  const state = use(TabListStateContext);
  const selectedKey = state?.selectedKey;
  const hasRevealed = useRef(false);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const selected = scroller?.querySelector<HTMLElement>('[role="tab"][data-selected]');
    if (!scroller || !selected) return;

    const vertical = orientation === 'vertical';
    const view = scroller.getBoundingClientRect();
    const item = selected.getBoundingClientRect();
    const viewStart = vertical ? view.top : view.left;
    const viewEnd = vertical ? view.bottom : view.right;
    const itemStart = vertical ? item.top : item.left;
    const itemEnd = vertical ? item.bottom : item.right;

    let delta = 0;
    if (itemStart < viewStart + edgeZone) delta = itemStart - viewStart - edgeZone;
    else if (itemEnd > viewEnd - edgeZone) delta = itemEnd - viewEnd + edgeZone;

    const behavior: ScrollBehavior = smooth && hasRevealed.current ? 'smooth' : 'instant';
    hasRevealed.current = true;
    if (Math.abs(delta) < 1) return;
    scroller.scrollBy(vertical ? { top: delta, behavior } : { left: delta, behavior });
  }, [scrollerRef, orientation, smooth, selectedKey]);
}

function pageScroller(
  scroller: HTMLElement,
  orientation: Orientation,
  direction: 1 | -1,
  smooth: boolean,
) {
  const vertical = orientation === 'vertical';
  const viewport = vertical ? scroller.clientHeight : scroller.clientWidth;
  const distance = Math.max(viewport - edgeZone * 2, viewport / 2) * direction;
  const behavior: ScrollBehavior = smooth ? 'smooth' : 'instant';
  if (vertical) {
    scroller.scrollBy({ top: distance, behavior });
    return;
  }
  const rtl = getComputedStyle(scroller).direction === 'rtl';
  scroller.scrollBy({ left: rtl ? -distance : distance, behavior });
}

interface TabScrollButtonProps {
  edge: 'start' | 'end';
  onPress: () => void;
}

function TabScrollButton({ edge, onPress }: TabScrollButtonProps) {
  const { variant, size, orientation } = use(TabsStyleContext);
  const icons = useIcons();
  const styles = tabsStyles({ variant, size, orientation, edge });
  const vertical = orientation === 'vertical';
  const Icon = vertical
    ? edge === 'start'
      ? icons.chevronUp
      : icons.chevronDown
    : edge === 'start'
      ? icons.chevronLeft
      : icons.chevronRight;

  return (
    <span aria-hidden="true" data-slot="tab-scroll-edge" className={styles.scrollEdge()}>
      <AriaButton
        excludeFromTabOrder
        preventFocusOnPress
        onPress={onPress}
        data-slot="tab-scroll-button"
        data-edge={edge}
        className={styles.scrollButton()}
      >
        <Icon className={vertical ? undefined : 'rtl:-scale-x-100'} />
      </AriaButton>
    </span>
  );
}

export interface TabListProps<T> extends Omit<AriaTabListProps<T>, 'className'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export function TabList<T extends object>({ className, ref, ...props }: TabListProps<T>) {
  const { variant, size, orientation, fullWidth, instant } = use(TabsStyleContext);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const edges = useOverflowEdges(scrollerRef, listRef, orientation);
  useRevealSelectedTab(scrollerRef, orientation, !instant);

  const setListRef = useCallback(
    (node: HTMLDivElement | null) => {
      listRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const page = (direction: 1 | -1) => {
    if (scrollerRef.current) pageScroller(scrollerRef.current, orientation, direction, !instant);
  };

  const styles = tabsStyles({
    variant,
    size,
    orientation,
    fullWidth,
    overflow: edges.start || edges.end,
  });

  return (
    <div data-slot="tab-list-container" className={styles.listContainer({ className })}>
      <div
        ref={scrollerRef}
        data-slot="tab-scroller"
        data-overflow-start={edges.start || undefined}
        data-overflow-end={edges.end || undefined}
        className={styles.scroller()}
      >
        <AriaTabList {...props} ref={setListRef} data-slot="tab-list" className={styles.list()} />
      </div>
      {edges.start ? <TabScrollButton edge="start" onPress={() => page(-1)} /> : null}
      {edges.end ? <TabScrollButton edge="end" onPress={() => page(1)} /> : null}
    </div>
  );
}

function settleIndicator(node: HTMLDivElement | null) {
  if (!node) return;
  let frame = requestAnimationFrame(() => {
    frame = requestAnimationFrame(() => node.style.removeProperty('translate'));
  });
  return () => cancelAnimationFrame(frame);
}

function renderBadge(badge: TabBaseProps['badge']) {
  if (badge == null || badge === false) return null;
  if (badge === true) return <Badge />;
  if (typeof badge === 'number') return <Badge count={badge} />;
  return badge;
}

interface TabBaseProps extends Omit<AriaTabProps, 'children' | 'className'> {
  icon?: ReactNode;
  badge?: ReactNode | number | boolean;
  className?: AriaTabProps['className'];
}

type TabLabelProps =
  | { children: ReactNode }
  | { children?: undefined; 'aria-label': string }
  | { children?: undefined; 'aria-labelledby': string };

export type TabProps = TabBaseProps & TabLabelProps;

export function Tab({ icon, badge, children, className, ...props }: TabProps) {
  const { variant, size, orientation, iconPlacement, fullWidth, instant } = use(TabsStyleContext);
  const stacked = iconPlacement === 'top' && icon != null && children != null;
  const badgeNode = renderBadge(badge);
  const badgeOnIcon = badgeNode != null && icon != null && (stacked || children == null);
  const styles = tabsStyles({ variant, size, orientation, fullWidth, stacked, instant });
  const selectionIndicator = (
    <SelectionIndicator
      ref={settleIndicator}
      data-slot="indicator"
      className={styles.indicator()}
    />
  );
  const indicator =
    orientation === 'horizontal' ? (
      <span data-slot="indicator-track" className={styles.indicatorTrack()}>
        {selectionIndicator}
      </span>
    ) : (
      selectionIndicator
    );
  const iconSlot =
    icon != null ? (
      <span data-slot="icon" className={styles.icon()}>
        {badgeOnIcon ? <BadgeAnchor badge={badgeNode}>{icon}</BadgeAnchor> : icon}
      </span>
    ) : null;
  const labelSlot =
    children != null ? (
      <span data-slot="label" className={styles.label()}>
        {children}
      </span>
    ) : null;

  return (
    <AriaTab
      {...props}
      data-slot="tab"
      data-stacked={stacked || undefined}
      className={composeRenderProps(className, (className) => styles.tab({ className }))}
    >
      {indicator}
      <span data-slot="tab-content" className={styles.content()}>
        {stacked ? labelSlot : iconSlot}
        {stacked ? iconSlot : labelSlot}
        {badgeOnIcon ? null : badgeNode}
      </span>
    </AriaTab>
  );
}

export interface TabPanelProps extends Omit<AriaTabPanelProps, 'className'> {
  className?: AriaTabPanelProps['className'];
}

export function TabPanel({ className, ...props }: TabPanelProps) {
  const { orientation, animated } = use(TabsStyleContext);

  return (
    <AriaTabPanel
      {...props}
      data-slot="tab-panel"
      className={composeRenderProps(className, (className) =>
        tabsStyles({ orientation, animated }).panel({ className }),
      )}
    />
  );
}
