'use client';

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from 'react';
import {
  ToggleButton as AriaToggleButton,
  ToggleButtonGroup as AriaToggleButtonGroup,
  ToggleGroupStateContext,
  composeRenderProps,
  type ToggleButtonGroupProps as AriaToggleButtonGroupProps,
  type ToggleButtonProps as AriaToggleButtonProps,
} from 'react-aria-components';
import { tv, type VariantProps } from '@/registry/ds/lib/utils';
import { useIcons, useMotionPreference } from '@/registry/ds/ui/ds-provider';

export const segmentedControlStyles = tv({
  slots: {
    root: [
      'group/segmented relative isolate max-w-full items-stretch gap-0.5 rounded-control bg-neutral-soft p-1',
      'data-[disabled]:cursor-not-allowed',
    ],
    thumb: [
      'pointer-events-none absolute inset-y-1 inset-s-0 rounded-control bg-surface-segment opacity-0 shadow-xs data-[visible]:opacity-100',
      'inset-ring-1 inset-ring-[color:light-dark(transparent,color-mix(in_srgb,var(--on-surface)_12%,transparent))]',
      'group-data-[disabled]/segmented:data-[visible]:opacity-50',
      'group-data-[thumb-ready]/segmented:transition-[translate,width] group-data-[thumb-ready]/segmented:duration-250 group-data-[thumb-ready]/segmented:ease-fluid motion-reduce:transition-none!',
    ],
    segment: [
      'focus-ring-inset no-tap-highlight group/segment relative inline-flex min-w-0 cursor-pointer items-center justify-center rounded-control font-medium whitespace-nowrap text-on-surface-variant select-none',
      'transition-[color,background-color,box-shadow] duration-150 ease-out motion-reduce:transition-none',
      'data-[hovered]:text-on-surface data-[selected]:text-on-surface',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
    ],
    icon: 'inline-flex shrink-0 items-center justify-center text-(length:--icon-size) not-last:me-1.5 [&_svg]:size-[1em]',
    check: [
      'grid shrink-0 grid-cols-[0fr] opacity-0 group-data-[selected]/segment:grid-cols-[1fr] group-data-[selected]/segment:opacity-100',
      'transition-[grid-template-columns,opacity] duration-200 ease-fluid motion-reduce:transition-none',
    ],
    checkClip: 'flex min-w-0 overflow-hidden',
    checkGlyph:
      'inline-flex shrink-0 items-center justify-center pe-1.5 text-(length:--icon-size) [&_svg]:size-[1em]',
    label: 'min-w-0 truncate',
  },
  variants: {
    size: {
      sm: { root: 'h-8', segment: 'px-2.5 text-xs [--icon-size:0.875rem]' },
      md: { root: 'h-10', segment: 'px-3 text-sm [--icon-size:1rem]' },
      lg: { root: 'h-12', segment: 'px-4 text-base [--icon-size:1.125rem]' },
    },
    fullWidth: {
      true: { root: 'flex w-full', segment: 'flex-1 basis-0' },
      false: { root: 'inline-flex' },
    },
    measured: {
      true: '',
      false: {
        segment: [
          'data-[selected]:bg-surface-segment data-[selected]:shadow-xs',
          'data-[selected]:inset-ring-1 data-[selected]:inset-ring-[color:light-dark(transparent,color-mix(in_srgb,var(--on-surface)_12%,transparent))]',
        ],
      },
    },
    instant: {
      true: { thumb: 'transition-none!', segment: 'transition-none', check: 'transition-none' },
      false: '',
    },
  },
  compoundVariants: [
    { fullWidth: true, size: 'sm', class: { segment: 'px-2' } },
    { fullWidth: true, size: 'md', class: { segment: 'px-2.5' } },
  ],
  defaultVariants: {
    size: 'md',
    fullWidth: false,
    measured: false,
    instant: false,
  },
});

type SegmentedControlStyleVariants = VariantProps<typeof segmentedControlStyles>;

export type SegmentedControlSize = NonNullable<SegmentedControlStyleVariants['size']>;

interface SegmentedControlContextValue {
  size: SegmentedControlSize;
  fullWidth: boolean;
  checkmark: boolean;
  measured: boolean;
  instant: boolean;
}

const SegmentedControlContext = createContext<SegmentedControlContextValue>({
  size: 'md',
  fullWidth: false,
  checkmark: false,
  measured: false,
  instant: false,
});

const segmentSelector = ':scope > [data-slot="segment"]';

type Placement = 'animate' | 'instant';

function placeThumb(group: HTMLElement, thumb: HTMLElement, placement: Placement) {
  const selected = group.querySelector<HTMLElement>(`${segmentSelector}[data-selected]`);
  if (!selected) {
    thumb.removeAttribute('data-visible');
    return;
  }
  const box = group.getBoundingClientRect();
  const rect = selected.getBoundingClientRect();
  const scale = group.offsetWidth > 0 ? box.width / group.offsetWidth : 1;
  const style = getComputedStyle(group);
  const rtl = style.direction === 'rtl';
  const border = parseFloat(rtl ? style.borderRightWidth : style.borderLeftWidth) || 0;
  const offset = (rtl ? box.right - rect.right : rect.left - box.left) / scale - border;
  if (placement === 'instant') thumb.style.transition = 'none';
  thumb.style.width = `${rect.width / scale}px`;
  thumb.style.translate = `${rtl ? -offset : offset}px 0`;
  thumb.setAttribute('data-visible', '');
  if (placement === 'instant') {
    void thumb.offsetWidth;
    thumb.style.transition = '';
  }
}

const directionListeners = new Set<() => void>();
let directionObserver: MutationObserver | null = null;

function subscribeToDirection(listener: () => void) {
  directionListeners.add(listener);
  if (!directionObserver) {
    directionObserver = new MutationObserver(() =>
      directionListeners.forEach((notify) => notify()),
    );
    directionObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir'],
      subtree: true,
    });
  }
  return () => {
    directionListeners.delete(listener);
    if (directionListeners.size === 0) {
      directionObserver?.disconnect();
      directionObserver = null;
    }
  };
}

interface SegmentedThumbProps {
  className: string;
  onPlaced: () => void;
}

function SegmentedThumb({ className, onPlaced }: SegmentedThumbProps) {
  const state = use(ToggleGroupStateContext);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const hasPlaced = useRef(false);
  const selection = state ? [...state.selectedKeys].map(String).join('\n') : '';

  useLayoutEffect(() => {
    const thumb = thumbRef.current;
    const group = thumb?.parentElement;
    if (!thumb || !group) return;
    placeThumb(group, thumb, hasPlaced.current ? 'animate' : 'instant');
    hasPlaced.current = true;
    void thumb.offsetWidth;
    onPlaced();
  }, [selection, onPlaced]);

  useEffect(() => {
    const thumb = thumbRef.current;
    const group = thumb?.parentElement;
    if (!thumb || !group) return;

    const follow = () =>
      placeThumb(group, thumb, thumb.getAnimations().length > 0 ? 'animate' : 'instant');
    const observed = new Set<Element>();
    const resizeObserver = new ResizeObserver(follow);
    const observeSegments = () => {
      group.querySelectorAll(segmentSelector).forEach((segment) => {
        if (observed.has(segment)) return;
        observed.add(segment);
        resizeObserver.observe(segment);
      });
    };
    resizeObserver.observe(group);
    observeSegments();
    const childObserver = new MutationObserver(() => {
      observeSegments();
      follow();
    });
    childObserver.observe(group, { childList: true });
    const unsubscribe = subscribeToDirection(() => placeThumb(group, thumb, 'instant'));

    return () => {
      resizeObserver.disconnect();
      childObserver.disconnect();
      unsubscribe();
    };
  }, []);

  return <span ref={thumbRef} aria-hidden data-slot="thumb" className={className} />;
}

export interface SegmentedControlProps extends Omit<
  AriaToggleButtonGroupProps,
  'className' | 'children' | 'orientation'
> {
  size?: SegmentedControlSize;
  fullWidth?: boolean;
  showCheckmark?: boolean;
  children?: ReactNode;
  className?: AriaToggleButtonGroupProps['className'];
  ref?: Ref<HTMLDivElement>;
}

export function SegmentedControl({
  size = 'md',
  fullWidth = false,
  selectionMode = 'single',
  disallowEmptySelection,
  showCheckmark,
  children,
  className,
  ref,
  ...props
}: SegmentedControlProps) {
  const { spatialEnabled } = useMotionPreference();
  const tracksThumb = selectionMode === 'single';
  const [thumbPlaced, setThumbPlaced] = useState(false);
  const measured = tracksThumb && thumbPlaced;
  const markPlaced = useCallback(() => setThumbPlaced(true), []);

  const context = useMemo<SegmentedControlContextValue>(
    () => ({
      size,
      fullWidth,
      checkmark: showCheckmark ?? selectionMode === 'multiple',
      measured,
      instant: !spatialEnabled,
    }),
    [size, fullWidth, showCheckmark, selectionMode, measured, spatialEnabled],
  );

  const styles = segmentedControlStyles({ size, fullWidth, instant: !spatialEnabled });

  return (
    <SegmentedControlContext value={context}>
      <AriaToggleButtonGroup
        {...props}
        ref={ref}
        selectionMode={selectionMode}
        disallowEmptySelection={disallowEmptySelection ?? selectionMode === 'single'}
        data-slot="segmented-control"
        data-size={size}
        data-selection-mode={selectionMode}
        data-full-width={fullWidth || undefined}
        data-thumb-ready={measured || undefined}
        className={composeRenderProps(className, (className) => styles.root({ className }))}
      >
        {tracksThumb ? <SegmentedThumb className={styles.thumb()} onPlaced={markPlaced} /> : null}
        {children}
      </AriaToggleButtonGroup>
    </SegmentedControlContext>
  );
}

interface SegmentedControlItemBaseProps extends Omit<
  AriaToggleButtonProps,
  'children' | 'className'
> {
  icon?: ReactNode;
  className?: AriaToggleButtonProps['className'];
}

type SegmentedControlItemLabelProps =
  | { children: ReactNode }
  | { children?: undefined; 'aria-label': string }
  | { children?: undefined; 'aria-labelledby': string };

export type SegmentedControlItemProps = SegmentedControlItemBaseProps &
  SegmentedControlItemLabelProps;

export function SegmentedControlItem({
  icon,
  children,
  className,
  ...props
}: SegmentedControlItemProps) {
  const { size, fullWidth, checkmark, measured, instant } = use(SegmentedControlContext);
  const icons = useIcons();
  const styles = segmentedControlStyles({ size, fullWidth, measured, instant });

  return (
    <AriaToggleButton
      {...props}
      data-slot="segment"
      className={composeRenderProps(className, (className) => styles.segment({ className }))}
    >
      {({ isSelected }) => (
        <>
          {icon != null ? (
            <span data-slot="icon" className={styles.icon()}>
              {checkmark && isSelected ? <icons.check data-slot="check" /> : icon}
            </span>
          ) : checkmark ? (
            <span data-slot="check" aria-hidden className={styles.check()}>
              <span className={styles.checkClip()}>
                <span className={styles.checkGlyph()}>
                  <icons.check />
                </span>
              </span>
            </span>
          ) : null}
          {children != null ? (
            <span data-slot="label" className={styles.label()}>
              {children}
            </span>
          ) : null}
        </>
      )}
    </AriaToggleButton>
  );
}
