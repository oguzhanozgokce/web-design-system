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
import { tv, type VariantProps } from '@/registry/ds/lib/utils';
import { Badge, BadgeAnchor } from '@/registry/ds/ui/badge';
import { useMotionPreference } from '@/registry/ds/ui/ds-provider';

export const tabsStyles = tv({
  slots: {
    root: 'group/tabs flex min-w-0',
    listContainer:
      'relative flex min-w-0 before:pointer-events-none before:absolute before:bg-outline-variant',
    scroller:
      'relative isolate flex min-w-0 flex-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    list: 'flex',
    tab: [
      'state-layer focus-ring-inset group/tab relative flex shrink-0 cursor-default items-center whitespace-nowrap no-underline select-none isolation-auto!',
      'transition-colors duration-150 ease-standard motion-reduce:transition-none',
      'text-on-surface-variant data-[hovered]:not-data-[selected]:not-data-[disabled]:text-on-surface',
      'data-[disabled]:text-on-surface/38',
    ],
    content: 'relative flex items-center justify-center gap-2',
    icon: 'relative inline-flex shrink-0 items-center justify-center text-(length:--icon-size) [&_svg]:size-[1em]',
    label: '',
    indicatorTrack: 'pointer-events-none absolute inset-0 [direction:ltr]',
    indicator: [
      'pointer-events-none absolute',
      'transition-[width,height,translate] duration-(--ds-duration-spatial) ease-spatial motion-reduce:transition-none',
    ],
    panel: 'focus-ring min-w-0 rounded-sm',
  },
  variants: {
    variant: {
      primary: {
        tab: 'h-12 px-4 text-title-sm [--icon-size:1.5rem] data-[selected]:not-data-[disabled]:text-primary',
        indicator: 'bg-primary group-data-[disabled]/tab:bg-on-surface/38',
      },
      secondary: {
        tab: 'h-12 px-4 text-title-sm [--icon-size:1.25rem] data-[selected]:not-data-[disabled]:text-on-surface',
        indicator: 'bg-primary group-data-[disabled]/tab:bg-on-surface/38',
      },
      pill: {
        listContainer: 'before:hidden',
        list: 'gap-1',
        tab: 'h-8 rounded-full px-3 text-label-lg [--icon-size:1.125rem] data-[selected]:not-data-[disabled]:text-on-secondary-container',
        indicator:
          'top-0 -z-2 inset-s-0 h-full w-full rounded-full bg-secondary-container group-data-[disabled]/tab:bg-on-surface/12',
      },
    },
    orientation: {
      horizontal: {
        root: 'flex-col gap-4',
        listContainer: 'before:inset-x-0 before:bottom-0 before:h-px',
        scroller:
          'overflow-x-auto overflow-y-hidden [--fade-angle:90deg] rtl:[--fade-angle:270deg]',
        list: 'w-max min-w-full',
      },
      vertical: {
        root: 'flex-row items-start gap-6',
        listContainer:
          'shrink-0 flex-col self-stretch before:inset-y-0 before:inset-e-0 before:w-px',
        scroller: 'flex-col overflow-x-hidden overflow-y-auto [--fade-angle:180deg]',
        list: 'h-max min-h-full flex-col',
        tab: 'w-full justify-start',
        panel: 'flex-1',
      },
    },
    stacked: {
      true: { tab: 'h-16', content: 'flex-col-reverse gap-0.5' },
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
    {
      variant: 'primary',
      orientation: 'horizontal',
      class: {
        content: 'min-w-6 self-stretch',
        indicator: 'bottom-0 h-[3px] inset-s-0 w-full rounded-t-[3px]',
      },
    },
    {
      variant: 'primary',
      orientation: 'vertical',
      class: { indicator: 'inset-y-3 inset-e-0 w-[3px] rounded-s-[3px]' },
    },
    {
      variant: 'secondary',
      orientation: 'horizontal',
      class: { indicator: 'bottom-0 h-0.5 w-full inset-s-0' },
    },
    {
      variant: 'secondary',
      orientation: 'vertical',
      class: { indicator: 'inset-e-0 top-0 h-full w-0.5' },
    },
    {
      variant: 'pill',
      orientation: 'vertical',
      class: { tab: 'h-9 px-4' },
    },
    {
      orientation: 'horizontal',
      fullWidth: true,
      class: { tab: 'flex-1 justify-center' },
    },
  ],
  defaultVariants: {
    variant: 'primary',
    orientation: 'horizontal',
    stacked: false,
    fullWidth: false,
    overflow: false,
    instant: false,
    animated: true,
  },
});

type TabsStyleVariants = VariantProps<typeof tabsStyles>;

export type TabsVariant = NonNullable<TabsStyleVariants['variant']>;

export type TabsIconPlacement = 'top' | 'start';

type Orientation = 'horizontal' | 'vertical';

interface TabsStyleContextValue {
  variant: TabsVariant;
  orientation: Orientation;
  iconPlacement: TabsIconPlacement;
  fullWidth: boolean;
  instant: boolean;
  animated: boolean;
}

const TabsStyleContext = createContext<TabsStyleContextValue>({
  variant: 'primary',
  orientation: 'horizontal',
  iconPlacement: 'top',
  fullWidth: false,
  instant: false,
  animated: true,
});

export interface TabsProps extends Omit<AriaTabsProps, 'className'> {
  variant?: TabsVariant;
  iconPlacement?: TabsIconPlacement;
  fullWidth?: boolean;
  className?: AriaTabsProps['className'];
}

export function Tabs({
  variant = 'primary',
  orientation = 'horizontal',
  iconPlacement,
  fullWidth = false,
  className,
  ...props
}: TabsProps) {
  const { spatialEnabled, effectsEnabled } = useMotionPreference();
  const placement =
    orientation === 'vertical'
      ? 'start'
      : (iconPlacement ?? (variant === 'primary' ? 'top' : 'start'));

  const context = useMemo<TabsStyleContextValue>(
    () => ({
      variant,
      orientation,
      iconPlacement: placement,
      fullWidth,
      instant: !spatialEnabled,
      animated: effectsEnabled,
    }),
    [variant, orientation, placement, fullWidth, spatialEnabled, effectsEnabled],
  );

  return (
    <TabsStyleContext value={context}>
      <AriaTabs
        {...props}
        orientation={orientation}
        data-slot="tabs"
        data-variant={variant}
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

const revealMargin = 40;

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
    if (itemStart < viewStart + revealMargin) delta = itemStart - viewStart - revealMargin;
    else if (itemEnd > viewEnd - revealMargin) delta = itemEnd - viewEnd + revealMargin;

    const behavior: ScrollBehavior = smooth && hasRevealed.current ? 'smooth' : 'instant';
    hasRevealed.current = true;
    if (Math.abs(delta) < 1) return;
    scroller.scrollBy(vertical ? { top: delta, behavior } : { left: delta, behavior });
  }, [scrollerRef, orientation, smooth, selectedKey]);
}

export interface TabListProps<T> extends Omit<AriaTabListProps<T>, 'className'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export function TabList<T extends object>({ className, ref, ...props }: TabListProps<T>) {
  const { variant, orientation, fullWidth, instant } = use(TabsStyleContext);
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

  const styles = tabsStyles({
    variant,
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
    </div>
  );
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
  const { variant, orientation, iconPlacement, fullWidth, instant } = use(TabsStyleContext);
  const stacked = iconPlacement === 'top' && icon != null && children != null;
  const badgeNode = renderBadge(badge);
  const badgeOnIcon = badgeNode != null && icon != null && (stacked || children == null);
  const styles = tabsStyles({ variant, orientation, fullWidth, stacked, instant });
  const indicatorInContent = variant === 'primary' && orientation === 'horizontal';
  const selectionIndicator = (
    <SelectionIndicator data-slot="indicator" className={styles.indicator()} />
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
      {indicatorInContent ? null : indicator}
      <span data-slot="tab-content" className={styles.content()}>
        {stacked ? labelSlot : iconSlot}
        {stacked ? iconSlot : labelSlot}
        {badgeOnIcon ? null : badgeNode}
        {indicatorInContent ? indicator : null}
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
