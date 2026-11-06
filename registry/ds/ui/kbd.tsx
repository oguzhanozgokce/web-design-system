'use client';

import { Fragment, type HTMLAttributes, type ReactNode } from 'react';
import { useKbdPlatform, type KbdPlatform } from '@/registry/ds/hooks/use-kbd-platform';
import { tv } from '@/registry/ds/lib/utils';
import { useLabels } from '@/registry/ds/ui/ds-provider';

export type { KbdPlatform };

export type KbdNamedKey =
  | 'mod'
  | 'command'
  | 'control'
  | 'option'
  | 'alt'
  | 'shift'
  | 'enter'
  | 'escape'
  | 'backspace'
  | 'delete'
  | 'tab'
  | 'space'
  | 'up'
  | 'down'
  | 'left'
  | 'right';

export type KbdKey = KbdNamedKey | (string & {});

export type KbdVariant = 'outlined' | 'tonal' | 'text';

export type KbdSize = 'sm' | 'md';

const namedKeys = new Map<string, KbdNamedKey>([
  ['mod', 'mod'],
  ['command', 'command'],
  ['cmd', 'command'],
  ['meta', 'command'],
  ['control', 'control'],
  ['ctrl', 'control'],
  ['option', 'option'],
  ['opt', 'option'],
  ['alt', 'alt'],
  ['shift', 'shift'],
  ['enter', 'enter'],
  ['return', 'enter'],
  ['escape', 'escape'],
  ['esc', 'escape'],
  ['backspace', 'backspace'],
  ['delete', 'delete'],
  ['del', 'delete'],
  ['tab', 'tab'],
  ['space', 'space'],
  [' ', 'space'],
  ['up', 'up'],
  ['arrowup', 'up'],
  ['down', 'down'],
  ['arrowdown', 'down'],
  ['left', 'left'],
  ['arrowleft', 'left'],
  ['right', 'right'],
  ['arrowright', 'right'],
]);

export function resolveKbdKey(key: string): KbdNamedKey | undefined {
  return namedKeys.get(key.toLowerCase());
}

const ariaKeyNames: Record<Exclude<KbdNamedKey, 'mod'>, string> = {
  command: 'Meta',
  control: 'Control',
  option: 'Alt',
  alt: 'Alt',
  shift: 'Shift',
  enter: 'Enter',
  escape: 'Escape',
  backspace: 'Backspace',
  delete: 'Delete',
  tab: 'Tab',
  space: 'Space',
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
};

function ariaShortcut(keys: KbdKey[], mod: string) {
  return keys
    .map((key) => {
      const named = resolveKbdKey(key);
      if (named === 'mod') return mod;
      return named ? ariaKeyNames[named] : key;
    })
    .join('+');
}

export function toAriaKeyShortcuts(keys: KbdKey[]) {
  const usesMod = keys.some((key) => resolveKbdKey(key) === 'mod');
  return usesMod
    ? `${ariaShortcut(keys, 'Meta')} ${ariaShortcut(keys, 'Control')}`
    : ariaShortcut(keys, 'Control');
}

export interface KbdLabels {
  command: string;
  control: string;
  option: string;
  alt: string;
  shift: string;
  enter: string;
  escape: string;
  backspace: string;
  delete: string;
  tab: string;
  space: string;
  up: string;
  down: string;
  left: string;
  right: string;
  controlShort: string;
  altShort: string;
  shiftShort: string;
  enterShort: string;
  escapeShort: string;
  deleteShort: string;
  tabShort: string;
  spaceShort: string;
}

export const defaultKbdLabels: KbdLabels = {
  command: 'Command',
  control: 'Control',
  option: 'Option',
  alt: 'Alt',
  shift: 'Shift',
  enter: 'Enter',
  escape: 'Escape',
  backspace: 'Backspace',
  delete: 'Delete',
  tab: 'Tab',
  space: 'Space',
  up: 'Up arrow',
  down: 'Down arrow',
  left: 'Left arrow',
  right: 'Right arrow',
  controlShort: 'Ctrl',
  altShort: 'Alt',
  shiftShort: 'Shift',
  enterShort: 'Enter',
  escapeShort: 'Esc',
  deleteShort: 'Del',
  tabShort: 'Tab',
  spaceShort: 'Space',
};

interface KeyLabel {
  glyph: string;
  spoken: string;
}

function describeKey(key: KbdNamedKey, platform: KbdPlatform | undefined, t: KbdLabels) {
  const apple = platform === 'apple';
  const labels: Record<KbdNamedKey, KeyLabel> = {
    mod: apple ? { glyph: '⌘', spoken: t.command } : { glyph: t.controlShort, spoken: t.control },
    command: { glyph: '⌘', spoken: t.command },
    control: { glyph: apple ? '⌃' : t.controlShort, spoken: t.control },
    option: apple ? { glyph: '⌥', spoken: t.option } : { glyph: t.altShort, spoken: t.alt },
    alt: apple ? { glyph: '⌥', spoken: t.option } : { glyph: t.altShort, spoken: t.alt },
    shift: { glyph: apple ? '⇧' : t.shiftShort, spoken: t.shift },
    enter: { glyph: apple ? '↩' : t.enterShort, spoken: t.enter },
    escape: { glyph: t.escapeShort, spoken: t.escape },
    backspace: { glyph: '⌫', spoken: t.backspace },
    delete: { glyph: apple ? '⌦' : t.deleteShort, spoken: t.delete },
    tab: { glyph: apple ? '⇥' : t.tabShort, spoken: t.tab },
    space: { glyph: t.spaceShort, spoken: t.space },
    up: { glyph: '↑', spoken: t.up },
    down: { glyph: '↓', spoken: t.down },
    left: { glyph: '←', spoken: t.left },
    right: { glyph: '→', spoken: t.right },
  };
  return labels[key];
}

export const kbdStyles = tv({
  slots: {
    key: [
      'inline-flex shrink-0 items-center justify-center rounded-xs align-middle font-[inherit] whitespace-nowrap select-none',
      '[&_svg]:size-[1.15em] [&_svg]:shrink-0',
    ],
    combo: 'inline-flex shrink-0 items-center align-middle font-[inherit]',
    separator: 'text-on-surface-variant',
  },
  variants: {
    variant: {
      outlined: {
        key: 'border border-b-2 border-outline-variant bg-surface-container-low text-on-surface-variant',
      },
      tonal: { key: 'bg-surface-container-highest text-on-surface-variant' },
      text: { key: 'bg-transparent text-current', separator: 'text-current' },
    },
    size: {
      sm: { key: 'h-5 min-w-5 px-1 text-label-sm', combo: 'gap-0.5' },
      md: { key: 'h-6 min-w-6 px-1.5 text-label-md', combo: 'gap-1' },
    },
  },
  compoundVariants: [{ variant: 'text', class: { key: 'min-w-0 px-0', combo: 'gap-0.5' } }],
  defaultVariants: {
    variant: 'outlined',
    size: 'md',
  },
});

export interface KbdStyleProps {
  variant?: KbdVariant;
  size?: KbdSize;
}

export interface KbdProps extends Omit<HTMLAttributes<HTMLElement>, 'children'>, KbdStyleProps {
  children?: ReactNode;
  platform?: KbdPlatform;
  labels?: Partial<KbdLabels>;
}

export function Kbd({
  variant = 'outlined',
  size = 'md',
  platform,
  labels,
  children,
  className,
  ...props
}: KbdProps) {
  const t = useLabels('kbd', defaultKbdLabels, labels);
  const detected = useKbdPlatform(platform);
  const named = typeof children === 'string' ? resolveKbdKey(children) : undefined;
  const label = named ? describeKey(named, detected, t) : undefined;

  return (
    <kbd
      {...props}
      data-slot="kbd"
      data-variant={variant}
      data-size={size}
      data-key={named}
      className={kbdStyles({ variant, size }).key({ className })}
    >
      {label && label.glyph !== label.spoken ? (
        <>
          <span aria-hidden="true" data-slot="kbd-glyph">
            {label.glyph}
          </span>
          <span className="sr-only">{label.spoken}</span>
        </>
      ) : (
        (label?.spoken ?? children)
      )}
    </kbd>
  );
}

const appleModifierRank: Partial<Record<KbdNamedKey, number>> = {
  control: 0,
  option: 1,
  alt: 1,
  shift: 2,
  command: 3,
  mod: 3,
};

function appleRank(key: KbdKey) {
  const named = resolveKbdKey(key);
  return (named && appleModifierRank[named]) ?? 4;
}

function orderKbdKeys(keys: KbdKey[], platform: KbdPlatform | undefined) {
  if (platform !== 'apple') return [...keys];
  return [...keys].sort((a, b) => appleRank(a) - appleRank(b));
}

export interface KbdComboProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children'>, KbdStyleProps {
  keys: KbdKey[];
  separator?: ReactNode;
  platform?: KbdPlatform;
  labels?: Partial<KbdLabels>;
}

export function KbdCombo({
  keys,
  separator,
  variant = 'outlined',
  size = 'md',
  platform,
  labels,
  className,
  ...props
}: KbdComboProps) {
  const detected = useKbdPlatform(platform);
  const styles = kbdStyles({ variant, size });

  return (
    <kbd
      dir="ltr"
      {...props}
      data-slot="kbd-combo"
      data-variant={variant}
      data-size={size}
      data-platform={detected}
      className={styles.combo({ className })}
    >
      {orderKbdKeys(keys, detected).map((key, index) => (
        <Fragment key={`${index}:${key}`}>
          {index > 0 ? (
            <>
              {separator != null ? (
                <span aria-hidden="true" data-slot="kbd-separator" className={styles.separator()}>
                  {separator}
                </span>
              ) : null}
              <span className="sr-only">+</span>
            </>
          ) : null}
          <Kbd variant={variant} size={size} platform={detected} labels={labels}>
            {key}
          </Kbd>
        </Fragment>
      ))}
    </kbd>
  );
}
