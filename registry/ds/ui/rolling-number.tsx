'use client';

import {
  AnimatePresence,
  animate,
  motion,
  useIsPresent,
  useMotionValue,
  usePresenceData,
  useTransform,
  useVelocity,
  type Transition,
} from 'motion/react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import { useLocale } from 'react-aria-components';
import { fluidTween, motionDurations, spatialSpring } from '@/registry/ds/lib/motion';
import {
  firstChangedPlace,
  odometerCounts,
  odometerGlyphs,
  odometerLayout,
  odometerOffset,
  odometerSpring,
  odometerStart,
  type OdometerAffix,
  type OdometerDigit,
} from '@/registry/ds/lib/odometer';
import { tv } from '@/registry/ds/lib/utils';
import { useMotionPreference } from '@/registry/ds/ui/ds-provider';

export const rollingNumberStyles = tv({
  slots: {
    root: 'relative inline-block whitespace-nowrap tabular-digits',
    value: 'select-none',
    digits: '[direction:ltr] [unicode-bidi:embed]',
    column: [
      'relative inline-block -my-(--rolling-pad) py-(--rolling-pad) align-baseline',
      '[mask-image:linear-gradient(to_bottom,transparent,black_var(--rolling-fade),black_calc(100%-var(--rolling-fade)),transparent)]',
      '[--rolling-fade:0.3em] [--rolling-pad:0.2em]',
    ],
    sizer: 'invisible',
    strip: 'absolute inset-x-0 top-0 flex flex-col items-center',
    cell: 'block py-(--rolling-pad)',
    symbol: 'inline-block',
  },
});

export interface RollingNumberProps extends Omit<ComponentProps<'span'>, 'children'> {
  value: number;
  formatOptions?: Intl.NumberFormatOptions;
  isAnimated?: boolean;
}

const stagger = 45;
const maxTravel = 24;
const stripLength = 11;

interface PresenceData {
  base: number | undefined;
}

interface Tracked {
  formatted: string;
  counts: Map<number, number>;
  previous: Map<number, number> | null;
  base: number | undefined;
}

function delayFor(place: number, base: number | undefined) {
  if (base === undefined || place < base) return 0;
  return (place - base) * stagger;
}

function blurFor(velocity: number) {
  const radius = Math.min(0.08, Math.abs(velocity) * 0.0012);
  return radius > 0.004 ? `blur(${radius.toFixed(3)}em)` : 'none';
}

interface Motion {
  isRolling: boolean;
  roll: ReturnType<typeof spatialSpring>;
  presence: Transition;
}

interface RollingColumnProps {
  item: OdometerDigit;
  glyphs: string[];
  delay: number;
  isEntering: boolean;
  motionSettings: Motion;
}

function RollingColumn({ item, glyphs, delay, isEntering, motionSettings }: RollingColumnProps) {
  const styles = rollingNumberStyles();
  const isPresent = useIsPresent();
  const presence = usePresenceData() as PresenceData | undefined;
  const target = isPresent || item.place < 0 ? item.count : 0;
  const wait = isPresent ? delay : delayFor(item.place, presence?.base);
  const start = isEntering ? odometerStart(item.count) : item.count;
  const position = useMotionValue(start);
  const velocity = useVelocity(position);
  const y = useTransform(
    position,
    (current) => `${(-odometerOffset(current) * 100) / stripLength}%`,
  );
  const filter = useTransform(velocity, blurFor);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const scheduled = useRef(start);
  const order = useRef({ scheduled: 0, applied: 0 });
  const { isRolling, roll } = motionSettings;

  useLayoutEffect(() => {
    if (!isRolling) {
      scheduled.current = target;
      position.jump(target);
      return;
    }
    if (scheduled.current === target) return;
    scheduled.current = target;
    const pending = timers.current;
    const sequence = ++order.current.scheduled;
    const timer = setTimeout(() => {
      pending.delete(timer);
      if (sequence < order.current.applied) return;
      order.current.applied = sequence;
      const current = position.get();
      const speed = position.getVelocity();
      const gap = target - current;
      if (Math.abs(gap) > maxTravel) {
        position.jump(current + Math.round((gap - Math.sign(gap) * maxTravel) / 10) * 10);
      }
      animate(position, target, {
        ...odometerSpring(roll, target - position.get()),
        velocity: speed,
        restDelta: 0.002,
        restSpeed: 0.02,
      });
    }, wait);
    pending.add(timer);
  }, [target, isRolling, position, roll, wait]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
      position.stop();
      scheduled.current = position.get();
    };
  }, [position]);

  return (
    <motion.span
      data-slot="rolling-number-digit"
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 'auto', opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={motionSettings.presence}
      className={styles.column()}
    >
      <span className={styles.sizer()}>{glyphs[item.digit]}</span>
      <motion.span style={{ y, filter }} className={styles.strip()}>
        {Array.from({ length: stripLength }, (_, index) => (
          <span key={index} className={styles.cell()}>
            {glyphs[index % 10]}
          </span>
        ))}
      </motion.span>
    </motion.span>
  );
}

interface SymbolProps {
  value: string;
  slot: string;
  motionSettings: Motion;
}

function RollingSymbol({ value, slot, motionSettings }: SymbolProps) {
  return (
    <motion.span
      data-slot={slot}
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 'auto', opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={motionSettings.presence}
      className={rollingNumberStyles().symbol()}
    >
      {value}
    </motion.span>
  );
}

function Affixes({ items, motionSettings }: { items: OdometerAffix[]; motionSettings: Motion }) {
  return (
    <AnimatePresence initial={false}>
      {items.map((item) =>
        item.kind === 'sign' ? (
          <RollingSymbol
            key={item.key}
            slot="rolling-number-sign"
            value={item.value}
            motionSettings={motionSettings}
          />
        ) : (
          <span key={item.key}>{item.value}</span>
        ),
      )}
    </AnimatePresence>
  );
}

function useFormatter(formatOptions: Intl.NumberFormatOptions | undefined) {
  const { locale } = useLocale();
  const optionsKey = JSON.stringify(formatOptions ?? {});
  return useMemo(() => {
    const formatter = new Intl.NumberFormat(locale, JSON.parse(optionsKey));
    const glyphs = odometerGlyphs(locale, formatter.resolvedOptions().numberingSystem);
    return { formatter, glyphs };
  }, [locale, optionsKey]);
}

function useTracked(formatted: string, counts: Map<number, number>) {
  const [tracked, setTracked] = useState<Tracked>(() => ({
    formatted,
    counts,
    previous: null,
    base: undefined,
  }));
  if (tracked.formatted !== formatted) {
    const next = {
      formatted,
      counts,
      previous: tracked.counts,
      base: firstChangedPlace(tracked.counts, counts),
    };
    setTracked(next);
    return next;
  }
  return tracked;
}

export function RollingNumber({
  value,
  formatOptions,
  isAnimated = true,
  className,
  ...props
}: RollingNumberProps) {
  const { formatter, glyphs } = useFormatter(formatOptions);
  const { spatialEnabled, profile } = useMotionPreference();
  const layout = useMemo(
    () => odometerLayout(value, formatter, glyphs),
    [value, formatter, glyphs],
  );
  const counts = useMemo(() => odometerCounts(layout), [layout]);
  const tracked = useTracked(layout.formatted, counts);
  const isRolling = isAnimated && spatialEnabled;
  const motionSettings = useMemo<Motion>(
    () => ({
      isRolling,
      roll: spatialSpring('fast', profile),
      presence: isRolling
        ? { width: spatialSpring('medium', profile), opacity: fluidTween(motionDurations.medium) }
        : { duration: 0 },
    }),
    [isRolling, profile],
  );
  const styles = rollingNumberStyles();
  const presenceData: PresenceData = { base: tracked.base };

  return (
    <span
      {...props}
      data-slot="rolling-number"
      data-animated={isRolling || undefined}
      className={styles.root({ className })}
    >
      <span className="sr-only">{layout.formatted}</span>
      <span aria-hidden="true" data-slot="rolling-number-value" className={styles.value()}>
        <Affixes items={layout.before} motionSettings={motionSettings} />
        {layout.core.length ? (
          <span data-slot="rolling-number-digits" className={styles.digits()}>
            <AnimatePresence initial={false} custom={presenceData}>
              {layout.core.map((item) =>
                item.kind === 'digit' ? (
                  <RollingColumn
                    key={item.key}
                    item={item}
                    glyphs={glyphs}
                    delay={delayFor(item.place, tracked.base)}
                    isEntering={tracked.previous !== null && !tracked.previous.has(item.place)}
                    motionSettings={motionSettings}
                  />
                ) : (
                  <RollingSymbol
                    key={item.key}
                    slot="rolling-number-separator"
                    value={item.value}
                    motionSettings={motionSettings}
                  />
                ),
              )}
            </AnimatePresence>
          </span>
        ) : null}
        <Affixes items={layout.after} motionSettings={motionSettings} />
      </span>
    </span>
  );
}
