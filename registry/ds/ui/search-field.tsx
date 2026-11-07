'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import {
  ButtonContext,
  ProgressBar,
  SearchField as AriaSearchField,
  composeRenderProps,
  type SearchFieldProps as AriaSearchFieldProps,
} from 'react-aria-components';
import { tv } from '@/registry/ds/lib/utils';
import { useIcons, useLabels } from '@/registry/ds/ui/ds-provider';
import {
  Field,
  FieldAdornment,
  FieldButton,
  FieldGroup,
  FieldInput,
  fieldStyles,
  type FieldBaseProps,
  type FieldLabels,
} from '@/registry/ds/ui/field';
import { Spinner } from '@/registry/ds/ui/spinner';

export interface SearchFieldLabels {
  search: string;
  clear: string;
  searching: string;
  keyControl: string;
  keyAlt: string;
  keyShift: string;
  keyMeta: string;
}

export const defaultSearchFieldLabels: SearchFieldLabels = {
  search: 'Search',
  clear: 'Clear search',
  searching: 'Searching',
  keyControl: 'Ctrl',
  keyAlt: 'Alt',
  keyShift: 'Shift',
  keyMeta: 'Win',
};

export const searchFieldStyles = tv({
  slots: {
    root: 'group/search',
    icon: 'grid *:[grid-area:1/1]',
    glyph: [
      'inline-flex items-center justify-center transition-opacity duration-150 ease-out motion-reduce:duration-0',
      'group-data-[pending]/search:opacity-0 group-data-[pending]/search:delay-300',
    ],
    pending: 'inline-flex animate-ds-fade-in-delayed items-center justify-center',
    clear: 'animate-ds-fade-in motion-reduce:animate-none',
    shortcut: [
      'pointer-events-none ms-(--field-gap) inline-flex shrink-0 items-center justify-center bg-neutral-soft [font-family:inherit] font-medium text-on-surface-variant whitespace-nowrap select-none',
      'transition-opacity duration-150 ease-out group-focus-within/control:opacity-0 motion-reduce:transition-none pointer-coarse:hidden',
    ],
  },
  variants: {
    size: {
      sm: { shortcut: 'h-5 min-w-5 rounded-md px-1 text-[0.6875rem]' },
      md: { shortcut: 'h-5 min-w-5 rounded-md px-1 text-[0.6875rem]' },
      lg: { shortcut: 'h-6 min-w-6 rounded-lg px-1.5 text-xs' },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export type SearchFieldVariant = 'outline' | 'soft';

interface ShortcutCombo {
  key: string;
  mod: boolean;
  meta: boolean;
  control: boolean;
  alt: boolean;
  shift: boolean;
}

type ShortcutModifier = Exclude<keyof ShortcutCombo, 'key'>;

const shortcutModifiers: Record<string, ShortcutModifier> = {
  mod: 'mod',
  meta: 'meta',
  cmd: 'meta',
  command: 'meta',
  control: 'control',
  ctrl: 'control',
  alt: 'alt',
  option: 'alt',
  shift: 'shift',
};

function parseShortcut(shortcut: string): ShortcutCombo {
  const parts = shortcut.split(/\+(?!$)/).map((part) => part.trim());
  const combo: ShortcutCombo = {
    key: parts.pop() ?? '',
    mod: false,
    meta: false,
    control: false,
    alt: false,
    shift: false,
  };
  for (const part of parts) {
    const modifier = shortcutModifiers[part.toLowerCase()];
    if (modifier) combo[modifier] = true;
  }
  return combo;
}

function hasModifier(combo: ShortcutCombo) {
  return combo.mod || combo.meta || combo.control || combo.alt || combo.shift;
}

function keyLegend(key: string) {
  return key.length === 1 ? key.toUpperCase() : key;
}

function isAlphanumeric(key: string) {
  return /^[a-z0-9]$/i.test(key);
}

function matchesShortcut(event: KeyboardEvent, combo: ShortcutCombo, apple: boolean) {
  const meta = combo.meta || (combo.mod && apple);
  const control = combo.control || (combo.mod && !apple);
  if (event.metaKey !== meta || event.ctrlKey !== control || event.altKey !== combo.alt) {
    return false;
  }
  const alphanumeric = isAlphanumeric(combo.key);
  if ((alphanumeric || combo.shift) && event.shiftKey !== combo.shift) return false;
  if (event.key.toLowerCase() === combo.key.toLowerCase()) return true;
  if (!alphanumeric) return false;
  const code = /\d/.test(combo.key) ? `Digit${combo.key}` : `Key${combo.key.toUpperCase()}`;
  return event.code === code;
}

const keyTakingInputTypes = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
]);

const keyTakingWidgets = [
  'textarea',
  'select',
  '[role="textbox"]',
  '[role="searchbox"]',
  '[role="combobox"]',
  '[role="spinbutton"]',
  '[role="listbox"]',
  '[role="menu"]',
  '[role="menubar"]',
  '[role="tree"]',
  '[role="treegrid"]',
  '[role="grid"]',
].join(', ');

function takesPlainKeys(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  if (!element || typeof element.closest !== 'function') return false;
  if (element.isContentEditable) return true;
  if (element.tagName === 'INPUT' && !keyTakingInputTypes.has((element as HTMLInputElement).type)) {
    return true;
  }
  return element.closest(keyTakingWidgets) != null;
}

function canReceiveShortcut(input: HTMLInputElement) {
  return (
    !input.disabled &&
    input.getClientRects().length > 0 &&
    input.closest('[inert], [aria-hidden="true"]') == null
  );
}

interface NavigatorWithUAData extends Navigator {
  userAgentData?: { platform?: string };
}

function subscribeToPlatform() {
  return () => {};
}

function detectApplePlatform() {
  const nav = navigator as NavigatorWithUAData;
  return /mac|iphone|ipad|ipod/i.test(nav.userAgentData?.platform || nav.platform || nav.userAgent);
}

function serverPlatform(): boolean | undefined {
  return undefined;
}

function shortcutLabel(combo: ShortcutCombo, apple: boolean | undefined, t: SearchFieldLabels) {
  const key = keyLegend(combo.key);
  if (!hasModifier(combo)) return key;
  if (apple === undefined) return null;
  if (apple) {
    return [
      combo.control && '⌃',
      combo.alt && '⌥',
      combo.shift && '⇧',
      (combo.meta || combo.mod) && '⌘',
      key,
    ]
      .filter(Boolean)
      .join('');
  }
  return [
    (combo.control || combo.mod) && t.keyControl,
    combo.alt && t.keyAlt,
    combo.shift && t.keyShift,
    combo.meta && t.keyMeta,
    key,
  ]
    .filter(Boolean)
    .join('+');
}

function ariaShortcut(combo: ShortcutCombo, apple: boolean | undefined) {
  const build = (useMeta: boolean) =>
    [
      (combo.control || (combo.mod && !useMeta)) && 'Control',
      combo.alt && 'Alt',
      combo.shift && 'Shift',
      (combo.meta || (combo.mod && useMeta)) && 'Meta',
      keyLegend(combo.key),
    ]
      .filter(Boolean)
      .join('+');
  if (!combo.mod) return build(false);
  return apple === undefined ? `${build(true)} ${build(false)}` : build(apple);
}

function useFocusShortcut(
  shortcut: string | undefined,
  groupRef: RefObject<HTMLDivElement | null>,
  isEnabled: boolean,
  t: SearchFieldLabels,
) {
  const apple = useSyncExternalStore(subscribeToPlatform, detectApplePlatform, serverPlatform);
  const combo = useMemo(() => (shortcut ? parseShortcut(shortcut) : null), [shortcut]);

  useEffect(() => {
    if (!combo || !combo.key || !isEnabled) return;
    const target = combo;
    const ownerDocument = groupRef.current?.ownerDocument ?? document;
    const isPlainKey = !target.mod && !target.meta && !target.control && !target.alt;

    function focusOnShortcut(event: KeyboardEvent) {
      if (event.defaultPrevented || event.isComposing || event.repeat) return;
      if (isPlainKey && takesPlainKeys(event.target)) return;
      if (!matchesShortcut(event, target, apple ?? false)) return;
      const input = groupRef.current?.querySelector('input');
      if (!input || !canReceiveShortcut(input)) return;
      event.preventDefault();
      input.focus();
      input.select();
    }

    ownerDocument.addEventListener('keydown', focusOnShortcut);
    return () => ownerDocument.removeEventListener('keydown', focusOnShortcut);
  }, [combo, isEnabled, apple, groupRef]);

  if (!combo || !combo.key) return null;
  return { label: shortcutLabel(combo, apple, t), aria: ariaShortcut(combo, apple) };
}

function hasContent(node: ReactNode) {
  return node != null && node !== false && node !== '';
}

export interface SearchFieldProps
  extends Omit<AriaSearchFieldProps, 'children' | 'onSubmit'>, FieldBaseProps {
  placeholder?: string;
  onSubmit?: (value: string) => void | Promise<unknown>;
  isPending?: boolean;
  shortcut?: string;
  icon?: ReactNode;
  endAdornment?: ReactNode;
  inputRef?: Ref<HTMLInputElement>;
  labels?: Partial<SearchFieldLabels & FieldLabels>;
}

export function SearchField({
  label,
  isLabelHidden,
  description,
  errorMessage,
  necessityIndicator,
  size = 'md',
  variant = 'outline',
  placeholder,
  onSubmit,
  isPending: isPendingProp = false,
  shortcut,
  icon,
  endAdornment,
  inputRef,
  labels,
  enterKeyHint = 'search',
  className,
  ...props
}: SearchFieldProps) {
  const t = useLabels('searchField', defaultSearchFieldLabels, labels);
  const icons = useIcons();
  const groupRef = useRef<HTMLDivElement>(null);
  const [isRunning, setRunning] = useState(false);
  const isPending = isPendingProp || isRunning;
  const hasLabel = hasContent(label);
  const styles = searchFieldStyles({ size });
  const hint = useFocusShortcut(shortcut, groupRef, !props.isDisabled, t);
  const ariaLabel =
    props['aria-label'] ?? (!hasLabel && !props['aria-labelledby'] ? t.search : undefined);

  function handleSubmit(value: string) {
    if (isPending) return;
    const result = onSubmit?.(value);
    if (result && typeof result.then === 'function') {
      setRunning(true);
      result.then(
        () => setRunning(false),
        () => setRunning(false),
      );
    }
  }

  return (
    <AriaSearchField
      {...props}
      aria-label={ariaLabel}
      enterKeyHint={enterKeyHint}
      onSubmit={onSubmit ? handleSubmit : undefined}
      data-slot="search-field"
      data-size={size}
      data-variant={variant}
      data-pending={isPending || undefined}
      className={composeRenderProps(className, (className) =>
        fieldStyles({ size, variant }).root({
          className: styles.root({ className }),
        }),
      )}
    >
      {({ isEmpty, isDisabled, isReadOnly }) => (
        <Field
          label={label}
          isLabelHidden={isLabelHidden}
          description={description}
          errorMessage={errorMessage}
          necessityIndicator={necessityIndicator}
          isRequired={props.isRequired}
          size={size}
          variant={variant}
          labels={labels}
        >
          <FieldGroup ref={groupRef} isReadOnly={isReadOnly}>
            <FieldAdornment placement="start" className={styles.icon()}>
              <ButtonContext value={null}>
                <span data-slot="search-icon" className={styles.glyph()}>
                  {icon ?? <icons.search />}
                </span>
              </ButtonContext>
              {isPending ? (
                <ProgressBar
                  isIndeterminate
                  aria-label={t.searching}
                  data-slot="pending"
                  className={styles.pending()}
                >
                  <Spinner />
                </ProgressBar>
              ) : null}
            </FieldAdornment>
            <FieldInput
              ref={inputRef}
              placeholder={placeholder ?? (!hasLabel || isLabelHidden ? t.search : undefined)}
              aria-keyshortcuts={hint?.aria}
            />
            {hint?.label && isEmpty && !isDisabled ? (
              <kbd aria-hidden="true" dir="ltr" data-slot="shortcut" className={styles.shortcut()}>
                {hint.label}
              </kbd>
            ) : null}
            {!isEmpty && !isDisabled && !isReadOnly ? (
              <FieldButton aria-label={t.clear} data-slot="clear-button" className={styles.clear()}>
                <icons.close />
              </FieldButton>
            ) : null}
            {endAdornment != null ? (
              <ButtonContext value={null}>
                <FieldAdornment placement="end">{endAdornment}</FieldAdornment>
              </ButtonContext>
            ) : null}
          </FieldGroup>
        </Field>
      )}
    </AriaSearchField>
  );
}
