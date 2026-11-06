'use client';

import { createContext, use, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import {
  Header as AriaHeader,
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuSection as AriaMenuSection,
  MenuTrigger as AriaMenuTrigger,
  Popover as AriaPopover,
  PopoverContext,
  Separator as AriaSeparator,
  SubmenuTrigger as AriaSubmenuTrigger,
  composeRenderProps,
  useLocale,
  useSlottedContext,
  type HeaderProps as AriaHeaderProps,
  type MenuItemProps as AriaMenuItemProps,
  type MenuProps as AriaMenuProps,
  type MenuSectionProps as AriaMenuSectionProps,
  type MenuTriggerProps as AriaMenuTriggerProps,
  type PopoverProps as AriaPopoverProps,
  type SeparatorProps as AriaSeparatorProps,
  type SubmenuTriggerProps as AriaSubmenuTriggerProps,
} from 'react-aria-components';
import { mergeLabels } from '@/registry/ds/lib/labels';
import { tv, type VariantProps } from '@/registry/ds/lib/utils';
import { ButtonGroupContext } from '@/registry/ds/ui/button';
import { SurfaceContext } from '@/registry/ds/ui/card';
import { useIcons, useLabels } from '@/registry/ds/ui/ds-provider';
import { popoverStyles, usePopoverMotion } from '@/registry/ds/ui/popover';
import { useThemeScopeProps } from '@/registry/ds/lib/theme-scope';

export type MenuSize = 'sm' | 'md';

export type MenuItemTone = 'default' | 'destructive';

export interface MenuLabels {
  empty: string;
  ctrl: string;
  alt: string;
  shift: string;
  enter: string;
  backspace: string;
  delete: string;
  escape: string;
  tab: string;
  space: string;
}

export const defaultMenuLabels: MenuLabels = {
  empty: 'No items',
  ctrl: 'Ctrl',
  alt: 'Alt',
  shift: 'Shift',
  enter: 'Enter',
  backspace: 'Backspace',
  delete: 'Del',
  escape: 'Esc',
  tab: 'Tab',
  space: 'Space',
};

const MenuSizeContext = createContext<MenuSize>('md');

const MenuLabelsContext = createContext<Partial<MenuLabels> | undefined>(undefined);

export const menuPopoverStyles = tv({
  extend: popoverStyles,
  base: 'flex max-w-[min(17.5rem,calc(100vw-1.5rem))] min-w-28 flex-col overflow-hidden rounded-sm bg-surface-container',
});

export const menuStyles = tv({
  slots: {
    list: 'min-h-0 overflow-y-auto outline-none',
    item: [
      'state-layer focus-ring-inset group/menu-item flex w-full cursor-default items-center gap-3 px-3 text-start no-underline select-none',
      'transition-colors duration-150 ease-standard',
      'data-[open]:before:opacity-8',
      'forced-colors:data-[disabled]:text-[GrayText] forced-colors:data-[focused]:bg-[Highlight] forced-colors:data-[focused]:text-[HighlightText]',
    ],
    icon: 'inline-flex shrink-0 items-center justify-center text-(length:--icon-size) [&_svg]:size-[1em]',
    content: 'flex min-w-0 flex-1 flex-col',
    label: 'line-clamp-2 text-label-lg break-words',
    description: 'text-body-sm text-on-surface-variant',
    shortcut: 'ms-auto shrink-0 ps-3 font-[inherit] whitespace-nowrap text-on-surface-variant',
    indicator:
      'inline-flex size-5 shrink-0 items-center justify-center text-on-surface-variant [&_svg]:size-5',
    section: 'flex flex-col',
    header: 'px-3 pb-1 text-label-md text-on-surface-variant',
    separator: 'h-px shrink-0 border-none bg-outline-variant',
    empty: 'px-3 text-body-md text-on-surface-variant',
  },
  variants: {
    size: {
      sm: {
        list: 'py-1',
        item: 'min-h-10 py-1.5 [--icon-size:1.25rem]',
        shortcut: 'text-body-sm',
        header: 'pt-2',
        separator: 'my-1',
        empty: 'py-2',
      },
      md: {
        list: 'py-2',
        item: 'min-h-12 py-2 [--icon-size:1.5rem]',
        shortcut: 'text-body-md',
        header: 'pt-3',
        separator: 'my-2',
        empty: 'py-3',
      },
    },
    tone: {
      default: { item: 'text-on-surface', icon: 'text-on-surface-variant' },
      destructive: { item: 'text-error', icon: 'text-error' },
    },
    isSelected: {
      true: { item: 'text-primary', icon: 'text-primary', indicator: 'text-primary' },
    },
    isDisabled: {
      true: {
        item: 'text-on-surface/38',
        icon: 'text-on-surface/38',
        description: 'text-on-surface/38',
        shortcut: 'text-on-surface/38',
        indicator: 'text-on-surface/38',
      },
    },
  },
  compoundVariants: [
    {
      tone: 'destructive',
      isSelected: true,
      class: { item: 'text-error', icon: 'text-error', indicator: 'text-error' },
    },
    {
      tone: 'destructive',
      isSelected: true,
      isDisabled: true,
      class: {
        item: 'text-on-surface/38',
        icon: 'text-on-surface/38',
        indicator: 'text-on-surface/38',
      },
    },
  ],
  defaultVariants: {
    size: 'md',
    tone: 'default',
  },
});

export type MenuStyleProps = VariantProps<typeof menuStyles>;

const submenuOffset = -4;

const submenuCrossOffset: Record<MenuSize, number> = { sm: -4, md: -8 };

export type MenuTriggerProps = AriaMenuTriggerProps;

export function MenuTrigger(props: MenuTriggerProps) {
  return <AriaMenuTrigger {...props} />;
}

export type SubmenuTriggerProps = AriaSubmenuTriggerProps;

export function SubmenuTrigger(props: SubmenuTriggerProps) {
  return <AriaSubmenuTrigger {...props} />;
}

export interface MenuPopoverProps extends Omit<AriaPopoverProps, 'className'> {
  className?: AriaPopoverProps['className'];
}

export function MenuPopover({
  offset,
  crossOffset,
  className,
  children,
  ...props
}: MenuPopoverProps) {
  const motion = usePopoverMotion();
  const { locale } = useLocale();
  const size = use(MenuSizeContext);
  const isSubmenu = useSlottedContext(PopoverContext)?.trigger === 'SubmenuTrigger';
  const themeScope = useThemeScopeProps();

  return (
    <AriaPopover
      lang={locale}
      {...themeScope}
      {...props}
      offset={offset ?? (isSubmenu ? submenuOffset : undefined)}
      crossOffset={crossOffset ?? (isSubmenu ? submenuCrossOffset[size] : undefined)}
      data-slot="menu-popover"
      className={composeRenderProps(className, (className) =>
        menuPopoverStyles({ motion, className }),
      )}
    >
      {composeRenderProps(children, (children) => (
        <SurfaceContext value="surface-container">
          <ButtonGroupContext value={null}>{children}</ButtonGroupContext>
        </SurfaceContext>
      ))}
    </AriaPopover>
  );
}

export interface MenuListProps<T extends object = object> extends Omit<
  AriaMenuProps<T>,
  'className'
> {
  size?: MenuSize;
  labels?: Partial<MenuLabels>;
  className?: AriaMenuProps<T>['className'];
}

export function MenuList<T extends object = object>({
  size: sizeProp,
  labels: labelsProp,
  renderEmptyState,
  className,
  ...props
}: MenuListProps<T>) {
  const inheritedSize = use(MenuSizeContext);
  const inheritedLabels = use(MenuLabelsContext);
  const size = sizeProp ?? inheritedSize;
  const labels = useMemo(
    () =>
      labelsProp
        ? mergeLabels<Partial<MenuLabels>>({}, inheritedLabels, labelsProp)
        : inheritedLabels,
    [inheritedLabels, labelsProp],
  );
  const t = useLabels('menu', defaultMenuLabels, labels);
  const styles = menuStyles({ size });

  return (
    <MenuSizeContext value={size}>
      <MenuLabelsContext value={labels}>
        <AriaMenu
          {...props}
          renderEmptyState={
            renderEmptyState ??
            (() => (
              <div data-slot="empty" className={styles.empty()}>
                {t.empty}
              </div>
            ))
          }
          data-slot="menu"
          data-size={size}
          className={composeRenderProps(className, (className) => styles.list({ className }))}
        />
      </MenuLabelsContext>
    </MenuSizeContext>
  );
}

export interface MenuProps<T extends object = object>
  extends
    MenuListProps<T>,
    Pick<
      AriaPopoverProps,
      'placement' | 'offset' | 'crossOffset' | 'shouldFlip' | 'containerPadding' | 'maxHeight'
    > {}

export function Menu<T extends object = object>({
  placement,
  offset,
  crossOffset,
  shouldFlip,
  containerPadding,
  maxHeight,
  ...props
}: MenuProps<T>) {
  return (
    <MenuPopover
      placement={placement}
      offset={offset}
      crossOffset={crossOffset}
      shouldFlip={shouldFlip}
      containerPadding={containerPadding}
      maxHeight={maxHeight}
    >
      <MenuList {...props} />
    </MenuPopover>
  );
}

export type MenuShortcutNamedKey =
  | 'mod'
  | 'command'
  | 'control'
  | 'option'
  | 'alt'
  | 'shift'
  | 'enter'
  | 'backspace'
  | 'delete'
  | 'escape'
  | 'tab'
  | 'space'
  | 'up'
  | 'down'
  | 'left'
  | 'right';

export type MenuShortcutKey = MenuShortcutNamedKey | (string & {});

type MenuShortcutPlatform = 'apple' | 'other';

const namedKeys = new Map<string, MenuShortcutNamedKey>([
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
  ['backspace', 'backspace'],
  ['delete', 'delete'],
  ['del', 'delete'],
  ['escape', 'escape'],
  ['esc', 'escape'],
  ['tab', 'tab'],
  ['space', 'space'],
  ['up', 'up'],
  ['arrowup', 'up'],
  ['down', 'down'],
  ['arrowdown', 'down'],
  ['left', 'left'],
  ['arrowleft', 'left'],
  ['right', 'right'],
  ['arrowright', 'right'],
]);

const appleModifierRank: Partial<Record<MenuShortcutNamedKey, number>> = {
  control: 0,
  option: 1,
  alt: 1,
  shift: 2,
  command: 3,
  mod: 3,
};

function keyLabel(key: MenuShortcutKey, platform: MenuShortcutPlatform, t: MenuLabels) {
  const named = namedKeys.get(key.toLowerCase());
  if (!named) return key.length === 1 ? key.toUpperCase() : key;
  const apple = platform === 'apple';
  const labels: Record<MenuShortcutNamedKey, string> = {
    mod: apple ? '⌘' : t.ctrl,
    command: '⌘',
    control: apple ? '⌃' : t.ctrl,
    option: apple ? '⌥' : t.alt,
    alt: apple ? '⌥' : t.alt,
    shift: apple ? '⇧' : t.shift,
    enter: apple ? '↩' : t.enter,
    backspace: apple ? '⌫' : t.backspace,
    delete: apple ? '⌦' : t.delete,
    escape: apple ? '⎋' : t.escape,
    tab: apple ? '⇥' : t.tab,
    space: t.space,
    up: '↑',
    down: '↓',
    left: '←',
    right: '→',
  };
  return labels[named];
}

function shortcutRank(key: MenuShortcutKey) {
  const named = namedKeys.get(key.toLowerCase());
  return (named && appleModifierRank[named]) ?? 4;
}

function formatMenuShortcut(
  keys: readonly MenuShortcutKey[],
  platform: MenuShortcutPlatform,
  t: MenuLabels,
) {
  if (platform !== 'apple') return keys.map((key) => keyLabel(key, platform, t)).join('+');
  return keys
    .map((key, index) => ({ key, index }))
    .sort((a, b) => shortcutRank(a.key) - shortcutRank(b.key) || a.index - b.index)
    .map(({ key }) => keyLabel(key, platform, t))
    .join('');
}

interface NavigatorWithUAData extends Navigator {
  userAgentData?: { platform?: string };
}

function subscribeToPlatform() {
  return () => {};
}

function detectPlatform(): MenuShortcutPlatform {
  const nav = navigator as NavigatorWithUAData;
  const platform = nav.userAgentData?.platform || nav.userAgent;
  return /mac|iphone|ipad|ipod/i.test(platform) ? 'apple' : 'other';
}

function serverPlatform(): MenuShortcutPlatform {
  return 'other';
}

function useMenuShortcutPlatform() {
  return useSyncExternalStore(subscribeToPlatform, detectPlatform, serverPlatform);
}

interface MenuShortcutProps {
  keys: readonly MenuShortcutKey[];
  className: string;
}

function MenuShortcut({ keys, className }: MenuShortcutProps) {
  const t = useLabels('menu', defaultMenuLabels, use(MenuLabelsContext));
  const platform = useMenuShortcutPlatform();

  return (
    <kbd dir="ltr" data-slot="shortcut" data-platform={platform} className={className}>
      {formatMenuShortcut(keys, platform, t)}
    </kbd>
  );
}

export interface MenuItemProps<T extends object = object> extends Omit<
  AriaMenuItemProps<T>,
  'children' | 'className'
> {
  tone?: MenuItemTone;
  startIcon?: ReactNode;
  description?: ReactNode;
  shortcut?: readonly MenuShortcutKey[];
  children?: ReactNode;
  className?: AriaMenuItemProps<T>['className'];
}

export function MenuItem<T extends object = object>({
  tone = 'default',
  startIcon,
  description,
  shortcut,
  textValue,
  children,
  className,
  ...props
}: MenuItemProps<T>) {
  const size = use(MenuSizeContext);
  const icons = useIcons();

  return (
    <AriaMenuItem
      {...props}
      textValue={textValue ?? (typeof children === 'string' ? children : undefined)}
      data-slot="menu-item"
      data-tone={tone}
      data-size={size}
      className={composeRenderProps(className, (className, { isSelected, isDisabled }) =>
        menuStyles({ size, tone, isSelected, isDisabled }).item({ className }),
      )}
    >
      {({ isSelected, isDisabled, selectionMode, hasSubmenu }) => {
        const styles = menuStyles({ size, tone, isSelected, isDisabled });
        return (
          <>
            {startIcon ? (
              <span data-slot="start-icon" aria-hidden="true" className={styles.icon()}>
                {startIcon}
              </span>
            ) : null}
            <span data-slot="content" className={styles.content()}>
              <span data-slot="label" className={styles.label()}>
                {children}
              </span>
              {description != null ? (
                <span data-slot="description" className={styles.description()}>
                  {description}
                </span>
              ) : null}
            </span>
            {shortcut?.length ? (
              <MenuShortcut keys={shortcut} className={styles.shortcut()} />
            ) : null}
            {hasSubmenu ? (
              <span data-slot="submenu-indicator" aria-hidden="true" className={styles.indicator()}>
                <icons.chevronRight className="rtl:-scale-x-100" />
              </span>
            ) : selectionMode !== 'none' ? (
              <span data-slot="check" aria-hidden="true" className={styles.indicator()}>
                {isSelected ? <icons.check /> : null}
              </span>
            ) : null}
          </>
        );
      }}
    </AriaMenuItem>
  );
}

export interface MenuSectionProps<T extends object = object> extends Omit<
  AriaMenuSectionProps<T>,
  'className'
> {
  className?: string;
}

export function MenuSection<T extends object = object>({
  className,
  ...props
}: MenuSectionProps<T>) {
  const size = use(MenuSizeContext);

  return (
    <AriaMenuSection
      {...props}
      data-slot="menu-section"
      className={menuStyles({ size }).section({ className })}
    />
  );
}

export type MenuHeaderProps = AriaHeaderProps;

export function MenuHeader({ className, ...props }: MenuHeaderProps) {
  const size = use(MenuSizeContext);

  return (
    <AriaHeader
      {...props}
      data-slot="menu-header"
      className={menuStyles({ size }).header({ className })}
    />
  );
}

export type MenuSeparatorProps = AriaSeparatorProps;

export function MenuSeparator({ className, ...props }: MenuSeparatorProps) {
  const size = use(MenuSizeContext);

  return (
    <AriaSeparator
      {...props}
      data-slot="menu-separator"
      className={menuStyles({ size }).separator({ className })}
    />
  );
}
