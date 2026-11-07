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
  type ComponentProps,
  type FocusEvent,
  type Key,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { AnimatePresence, animate, motion, useIsPresent, useMotionValue } from 'motion/react';
import { Button as AriaButton } from 'react-aria-components';
import { useControllableState } from '@/registry/ds/hooks/use-controllable-state';
import type { LabelTemplate } from '@/registry/ds/lib/labels';
import {
  motionDurations,
  motionEasings,
  spatialSpring,
  type MotionProfile,
} from '@/registry/ds/lib/motion';
import { tv, type VariantProps } from '@/registry/ds/lib/utils';
import { useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';

export type DynamicIslandTone = 'dark' | 'light';

type IslandFace = 'compact' | 'expanded';

type IslandMotion = 'spatial' | 'fade' | 'none';

export interface DynamicIslandLabels {
  toggle: LabelTemplate<{ title: string }>;
}

export const defaultDynamicIslandLabels: DynamicIslandLabels = {
  toggle: '{title}',
};

export const dynamicIslandStyles = tv({
  slots: {
    root: 'relative flex w-full justify-center @container [--ds-island-focus:var(--primary)]',
    nudge: 'flex max-w-full justify-center',
    pill: [
      'group/island relative grid grid-cols-1 grid-rows-1 overflow-hidden rounded-[min(2.5rem,var(--radius-control))] text-on-surface select-none',
      'inset-ring inset-ring-outline-subtle forced-colors:border',
      'transition-[scale,background-color] duration-[250ms,150ms] ease-[ease,var(--ease-out)]',
      'outline-offset-2 has-[>[data-slot=dynamic-island-toggle][data-focus-visible]]:outline-2 has-[>[data-slot=dynamic-island-toggle][data-focus-visible]]:outline-(color:--ds-island-focus)',
    ],
    toggle:
      'no-tap-highlight absolute inset-0 cursor-pointer rounded-[inherit] outline-none data-[disabled]:cursor-default',
    faces: [
      'pointer-events-none relative grid grid-cols-1 grid-rows-1 place-items-center',
      '[&_:is(a,button,input,select,textarea,[tabindex],[role=slider])]:pointer-events-auto',
    ],
    compact:
      'col-start-1 row-start-1 flex h-9 w-max max-w-[100cqi] min-w-38 items-center justify-between gap-3 px-3 text-sm font-medium tabular-nums',
    leading: 'flex shrink-0 items-center gap-1.5 text-base',
    center: 'min-w-0 flex-1 truncate text-center',
    trailing: 'flex shrink-0 items-center gap-1.5',
    expanded:
      'col-start-1 row-start-1 flex w-80 max-w-[100cqi] flex-col justify-center gap-3 px-4 py-3.5 text-sm',
    announcer: 'sr-only',
  },
  variants: {
    tone: {
      dark: { pill: 'bg-surface-container-lowest' },
      light: { pill: 'bg-surface-raised shadow-sm' },
    },
    interactive: {
      true: {},
      false: {},
    },
    motion: {
      spatial: {
        pill: 'motion-safe:has-[>[data-slot=dynamic-island-toggle][data-pressed]]:scale-[0.97]',
      },
      fade: {},
      none: { pill: 'transition-none' },
    },
  },
  compoundVariants: [
    {
      tone: 'dark',
      interactive: true,
      class: {
        pill: 'has-[>[data-slot=dynamic-island-toggle][data-hovered]]:bg-surface-container-low',
      },
    },
    {
      tone: 'light',
      interactive: true,
      class: {
        pill: 'has-[>[data-slot=dynamic-island-toggle][data-hovered]]:bg-surface-overlay-hover',
      },
    },
  ],
  defaultVariants: {
    tone: 'dark',
    interactive: true,
    motion: 'spatial',
  },
});

export type DynamicIslandStyleProps = VariantProps<typeof dynamicIslandStyles>;

type IslandSlots = ReturnType<typeof dynamicIslandStyles>;

interface DynamicIslandContextValue {
  face: IslandFace;
  isSized: boolean;
  activityKey: string;
  motion: IslandMotion;
  styles: IslandSlots;
  onFaceResize: (width: number, height: number) => void;
  registerExpanded: () => () => void;
}

const DynamicIslandContext = createContext<DynamicIslandContextValue | null>(null);

const enterDelay = 0.06;
const blurredFace = { opacity: 0, scale: 0.92, filter: 'blur(6px)' };
const settledFace = { opacity: 1, scale: 1, filter: 'blur(0px)' };

const faceMotion = {
  spatial: {
    initial: blurredFace,
    animate: {
      ...settledFace,
      transition: { duration: 0.22, delay: enterDelay, ease: motionEasings.outQuad },
      transitionEnd: { filter: 'none' },
    },
    exit: {
      ...blurredFace,
      transition: { duration: 0.18, ease: motionEasings.outQuad },
    },
  },
  fade: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: motionDurations.fast / 1000, ease: motionEasings.out },
    },
    exit: {
      opacity: 0,
      transition: { duration: motionDurations.fast / 1000, ease: motionEasings.out },
    },
  },
  none: {
    initial: { opacity: 1 },
    animate: { opacity: 1, transition: { duration: 0 } },
    exit: { opacity: 0, transition: { duration: 0 } },
  },
} as const;

function useIslandMotion(): IslandMotion {
  const { spatialEnabled, effectsEnabled } = useMotionPreference();
  if (spatialEnabled) return 'spatial';
  return effectsEnabled ? 'fade' : 'none';
}

function nudgePeak(width: number) {
  return 1 + Math.min(0.08, 12 / Math.max(width, 1));
}

export interface DynamicIslandProps extends Omit<ComponentProps<'div'>, 'title' | 'children'> {
  title: string;
  isExpanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;
  isDisabled?: boolean;
  tone?: DynamicIslandTone;
  activityKey?: Key;
  announcement?: string;
  labels?: Partial<DynamicIslandLabels>;
  children: ReactNode;
}

export function DynamicIsland({
  title,
  isExpanded: isExpandedProp,
  defaultExpanded = false,
  onExpandedChange,
  isDisabled = false,
  tone = 'dark',
  activityKey,
  announcement,
  labels,
  className,
  children,
  ...props
}: DynamicIslandProps) {
  const t = useLabels('dynamicIsland', defaultDynamicIslandLabels, labels);
  const { profile } = useMotionPreference();
  const motionMode = useIslandMotion();
  const [isExpanded, setExpanded] = useControllableState(
    isExpandedProp,
    defaultExpanded,
    onExpandedChange,
  );
  const [expandableCount, setExpandableCount] = useState(0);
  const isExpandable = expandableCount > 0;
  const face: IslandFace = isExpanded ? 'expanded' : 'compact';
  const activity = activityKey == null ? '' : String(activityKey);
  const facesId = useId();

  const width = useMotionValue(0);
  const height = useMotionValue(0);
  const [isSized, setSized] = useState(false);
  const sizedRef = useRef(false);
  const settings = useRef<{ motion: IslandMotion; profile: MotionProfile }>({
    motion: motionMode,
    profile,
  });
  const nudgeRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const facesRef = useRef<HTMLDivElement>(null);
  const focusWithin = useRef(false);
  const shownFace = useRef(`${face}:${activity}`);
  const shownActivity = useRef(activity);

  useLayoutEffect(() => {
    settings.current = { motion: motionMode, profile };
  }, [motionMode, profile]);

  const onFaceResize = useCallback(
    (nextWidth: number, nextHeight: number) => {
      if (nextWidth <= 0 || nextHeight <= 0) return;
      if (!sizedRef.current) {
        sizedRef.current = true;
        width.jump(nextWidth);
        height.jump(nextHeight);
        setSized(true);
        return;
      }
      const { motion: mode, profile: springProfile } = settings.current;
      if (mode !== 'spatial') {
        width.jump(nextWidth);
        height.jump(nextHeight);
        return;
      }
      const spring = spatialSpring('medium', springProfile);
      animate(width, nextWidth, spring);
      animate(height, nextHeight, spring);
    },
    [width, height],
  );

  const registerExpanded = useCallback(() => {
    setExpandableCount((count) => count + 1);
    return () => setExpandableCount((count) => count - 1);
  }, []);

  useLayoutEffect(() => {
    const key = `${face}:${activity}`;
    if (shownFace.current === key) return;
    shownFace.current = key;
    const active = document.activeElement;
    const faces = facesRef.current;
    const leftWithFace =
      active instanceof HTMLElement &&
      faces?.contains(active) &&
      active.closest('[data-exiting]') !== null;
    const dropped = focusWithin.current && (!active || active === document.body);
    if (leftWithFace || dropped) toggleRef.current?.focus();
  }, [face, activity]);

  useEffect(() => {
    if (shownActivity.current === activity) return;
    shownActivity.current = activity;
    const nudge = nudgeRef.current;
    if (!nudge || settings.current.motion !== 'spatial') return;
    animate(
      nudge,
      { scale: [nudgePeak(width.get()), 1] },
      spatialSpring('fast', settings.current.profile),
    );
  }, [activity, width]);

  const context = useMemo<DynamicIslandContextValue>(
    () => ({
      face,
      isSized,
      activityKey: activity,
      motion: motionMode,
      styles: dynamicIslandStyles({ tone, motion: motionMode }),
      onFaceResize,
      registerExpanded,
    }),
    [face, isSized, activity, motionMode, tone, onFaceResize, registerExpanded],
  );

  const interactive = isExpandable && !isDisabled;
  const styles = dynamicIslandStyles({ tone, interactive, motion: motionMode });

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Escape' || face !== 'expanded' || isDisabled) return;
    event.stopPropagation();
    toggleRef.current?.focus();
    setExpanded(false);
  }

  function handleFocus() {
    focusWithin.current = true;
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    const next = event.relatedTarget;
    if (next instanceof Node && !event.currentTarget.contains(next)) focusWithin.current = false;
  }

  return (
    <div
      {...props}
      data-slot="dynamic-island"
      data-tone={tone}
      data-expanded={face === 'expanded' || undefined}
      className={styles.root({ className })}
    >
      <div ref={nudgeRef} data-slot="dynamic-island-nudge" className={styles.nudge()}>
        <motion.div
          data-slot="dynamic-island-pill"
          data-theme={tone}
          style={isSized ? { width, height } : undefined}
          className={styles.pill()}
          onKeyDown={handleKeyDown}
        >
          {isExpandable ? (
            <AriaButton
              ref={toggleRef}
              slot={null}
              isDisabled={isDisabled}
              aria-label={t.format('toggle', { title })}
              aria-expanded={face === 'expanded'}
              aria-controls={facesId}
              aria-describedby={face === 'compact' ? facesId : undefined}
              data-slot="dynamic-island-toggle"
              className={styles.toggle()}
              onPress={() => setExpanded(face !== 'expanded')}
            />
          ) : null}
          <div
            ref={facesRef}
            id={facesId}
            data-slot="dynamic-island-faces"
            className={styles.faces()}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            <DynamicIslandContext value={context}>{children}</DynamicIslandContext>
          </div>
        </motion.div>
      </div>
      <span role="status" data-slot="dynamic-island-announcer" className={styles.announcer()}>
        {announcement}
      </span>
    </div>
  );
}

function useIsland(part: string) {
  const island = use(DynamicIslandContext);
  if (!island) throw new Error(`${part} must be rendered inside a DynamicIsland`);
  return island;
}

interface FaceContentProps {
  face: IslandFace;
  className: string;
  children: ReactNode;
}

function FaceContent({ face, className, children }: FaceContentProps) {
  const { motion: mode, onFaceResize } = useIsland('A dynamic island face');
  const isPresent = useIsPresent();
  const ref = useRef<HTMLDivElement>(null);
  const variants = faceMotion[mode];

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || !isPresent) return;
    const observer = new ResizeObserver(([entry]) => {
      const box = entry.borderBoxSize?.[0];
      if (box) onFaceResize(box.inlineSize, box.blockSize);
      else onFaceResize(element.offsetWidth, element.offsetHeight);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [isPresent, onFaceResize]);

  return (
    <motion.div
      ref={ref}
      data-slot={`dynamic-island-${face}`}
      data-exiting={isPresent ? undefined : true}
      inert={!isPresent}
      aria-hidden={isPresent ? undefined : true}
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export interface DynamicIslandCompactProps {
  leading?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function DynamicIslandCompact({
  leading,
  trailing,
  children,
  className,
}: DynamicIslandCompactProps) {
  const island = useIsland('DynamicIslandCompact');
  const { styles } = island;

  return (
    <AnimatePresence initial={island.isSized}>
      {island.face === 'compact' ? (
        <FaceContent
          key={island.activityKey}
          face="compact"
          className={styles.compact({ className })}
        >
          {leading != null ? (
            <span data-slot="leading" className={styles.leading()}>
              {leading}
            </span>
          ) : null}
          {children != null ? (
            <span data-slot="center" className={styles.center()}>
              {children}
            </span>
          ) : null}
          {trailing != null ? (
            <span data-slot="trailing" className={styles.trailing()}>
              {trailing}
            </span>
          ) : null}
        </FaceContent>
      ) : null}
    </AnimatePresence>
  );
}

export interface DynamicIslandExpandedProps {
  children: ReactNode;
  className?: string;
}

export function DynamicIslandExpanded({ children, className }: DynamicIslandExpandedProps) {
  const island = useIsland('DynamicIslandExpanded');
  const { styles, registerExpanded } = island;

  useLayoutEffect(() => registerExpanded(), [registerExpanded]);

  return (
    <AnimatePresence initial={island.isSized}>
      {island.face === 'expanded' ? (
        <FaceContent
          key={island.activityKey}
          face="expanded"
          className={styles.expanded({ className })}
        >
          {children}
        </FaceContent>
      ) : null}
    </AnimatePresence>
  );
}
