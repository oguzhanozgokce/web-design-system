'use client';

import { createContext, use, useMemo, type ReactNode } from 'react';
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
import { useKbdPlatform } from '@/registry/ds/hooks/use-kbd-platform';
import { useMediaQuery } from '@/registry/ds/hooks/use-media-query';
import { mergeLabels } from '@/registry/ds/lib/labels';
import { tv, type VariantProps } from '@/registry/ds/lib/utils';
import { ButtonGroupContext } from '@/registry/ds/ui/button';
import { useIcons, useLabels } from '@/registry/ds/ui/ds-provider';
import { KbdCombo, type KbdKey, type KbdLabels } from '@/registry/ds/ui/kbd';
import { popoverMotion, usePopoverMotion } from '@/registry/ds/ui/popover';
import { useThemeScopeProps } from '@/registry/ds/lib/theme-scope';

export type MenuSize = 'sm' | 'md';

export type MenuItemTone = 'neutral' | 'error';

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
  base: [
    'flex max-w-[min(20rem,calc(100vw-2rem))] min-w-[min(14rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-overlay bg-surface-overlay p-1 text-sm text-on-surface shadow-md outline-none',
    'origin-(--trigger-anchor-point) forced-colors:border',
  ],
  variants: {
    motion: popoverMotion,
  },
  defaultVariants: {
    motion: 'spatial',
  },
});

export const menuStyles = tv({
  slots: {
    list: 'flex min-h-0 flex-col gap-0.5 overflow-y-auto outline-none',
    item: [
      'focus-ring-inset no-tap-highlight group/menu-item relative flex w-full cursor-pointer items-center rounded-item text-start text-sm no-underline select-none',
      'transition-[background-color,scale] duration-100 ease-out motion-reduce:transition-none',
      'data-[pressed]:scale-[0.98] motion-reduce:data-[pressed]:scale-100',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
      'forced-colors:data-[disabled]:text-[GrayText] forced-colors:data-[focused]:bg-[Highlight] forced-colors:data-[focused]:text-[HighlightText]',
    ],
    icon: 'inline-flex shrink-0 items-center justify-center text-(length:--icon-size) text-on-surface-variant [&_svg]:size-[1em]',
    content: 'flex min-w-0 flex-1 flex-col',
    label: 'line-clamp-2 font-normal break-words',
    description: 'text-xs text-on-surface-variant',
    shortcut: 'ms-auto inline-flex shrink-0 ps-3 text-xs text-on-surface-variant',
    check:
      'pointer-events-none absolute inline-flex size-4 items-center justify-center text-primary [&_svg]:size-4',
    submenu:
      'ms-auto inline-flex shrink-0 items-center justify-center text-on-surface-variant [&_svg]:size-3.5',
    section: 'flex flex-col gap-0.5',
    header: 'pt-2 pb-1 text-xs font-medium text-on-surface-variant',
    separator:
      'mx-2 my-1 h-px shrink-0 border-none bg-outline-subtle forced-color-adjust-none forced-colors:bg-[CanvasText]',
    empty: 'py-2 text-sm text-on-surface-variant',
  },
  variants: {
    size: {
      sm: {
        item: 'min-h-8 gap-2 px-2 py-1 [--icon-size:1rem]',
        check: 'inset-s-2',
        header: 'px-2',
        empty: 'px-2',
      },
      md: {
        item: 'min-h-9 gap-2.5 px-2.5 py-1.5 [--icon-size:1rem]',
        check: 'inset-s-2.5',
        header: 'px-2.5',
        empty: 'px-2.5',
      },
    },
    tone: {
      neutral: {
        item: 'text-on-surface data-[focused]:bg-neutral-soft data-[open]:bg-neutral-soft',
      },
      error: {
        item: 'text-error data-[focused]:bg-error-soft data-[open]:bg-error-soft',
        icon: 'text-error',
        check: 'text-error',
      },
    },
    selectable: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    { size: 'sm', selectable: true, class: { item: 'ps-7' } },
    { size: 'md', selectable: true, class: { item: 'ps-8' } },
  ],
  defaultVariants: {
    size: 'md',
    tone: 'neutral',
    selectable: false,
  },
});

export type MenuStyleProps = VariantProps<typeof menuStyles>;

const submenuOffset = -2;

const submenuCrossOffset: Record<MenuSize, number> = { sm: -4, md: -4 };

const stackedSubmenuOffset = 2;

const stackedSubmenuIndent = 16;

export const stackedSubmenuQuery = '(max-width: 30rem)';

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

function submenuPlacement(size: MenuSize, stacked: boolean, rtl: boolean) {
  if (!stacked) return { offset: submenuOffset, crossOffset: submenuCrossOffset[size] };
  return {
    placement: 'bottom start' as const,
    offset: stackedSubmenuOffset,
    crossOffset: rtl ? -stackedSubmenuIndent : stackedSubmenuIndent,
  };
}

export function MenuPopover({
  placement,
  offset,
  crossOffset,
  className,
  children,
  ...props
}: MenuPopoverProps) {
  const motion = usePopoverMotion();
  const { locale, direction } = useLocale();
  const size = use(MenuSizeContext);
  const isSubmenu = useSlottedContext(PopoverContext)?.trigger === 'SubmenuTrigger';
  const stacked = useMediaQuery(stackedSubmenuQuery);
  const themeScope = useThemeScopeProps();
  const submenu = isSubmenu ? submenuPlacement(size, stacked, direction === 'rtl') : undefined;

  return (
    <AriaPopover
      lang={locale}
      {...themeScope}
      {...props}
      placement={placement ?? submenu?.placement}
      offset={offset ?? submenu?.offset}
      crossOffset={crossOffset ?? submenu?.crossOffset}
      data-slot="menu-popover"
      data-stacked={(isSubmenu && stacked) || undefined}
      className={composeRenderProps(className, (className) =>
        menuPopoverStyles({ motion, className }),
      )}
    >
      {composeRenderProps(children, (children) => (
        <ButtonGroupContext value={null}>{children}</ButtonGroupContext>
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

const menuKeyLabels: [keyof MenuLabels, keyof KbdLabels][] = [
  ['ctrl', 'controlShort'],
  ['alt', 'altShort'],
  ['shift', 'shiftShort'],
  ['enter', 'enterShort'],
  ['backspace', 'backspace'],
  ['delete', 'deleteShort'],
  ['escape', 'escapeShort'],
  ['tab', 'tabShort'],
  ['space', 'spaceShort'],
];

const noMenuLabels: Partial<MenuLabels> = {};

function useShortcutKeyLabels() {
  const menu = useLabels('menu', noMenuLabels, use(MenuLabelsContext));
  return useMemo(() => {
    const labels: Partial<KbdLabels> = {};
    for (const [from, to] of menuKeyLabels) {
      const value = menu[from];
      if (typeof value === 'string') labels[to] = value;
    }
    return labels;
  }, [menu]);
}

interface MenuShortcutProps {
  keys: readonly KbdKey[];
  className: string;
}

function MenuShortcut({ keys, className }: MenuShortcutProps) {
  const labels = useShortcutKeyLabels();
  const platform = useKbdPlatform();
  const shown = keys.map((key) => (key.length === 1 ? key.toUpperCase() : key));

  return (
    <span data-slot="shortcut" data-platform={platform} className={className}>
      <KbdCombo
        keys={shown}
        variant="ghost"
        size="sm"
        platform={platform}
        labels={labels}
        separator={platform === 'apple' ? undefined : '+'}
      />
    </span>
  );
}

export interface MenuItemProps<T extends object = object> extends Omit<
  AriaMenuItemProps<T>,
  'children' | 'className'
> {
  tone?: MenuItemTone;
  startIcon?: ReactNode;
  description?: ReactNode;
  shortcut?: readonly KbdKey[];
  children?: ReactNode;
  className?: AriaMenuItemProps<T>['className'];
}

export function MenuItem<T extends object = object>({
  tone = 'neutral',
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
      className={composeRenderProps(className, (className, { selectionMode }) =>
        menuStyles({ size, tone, selectable: selectionMode !== 'none' }).item({ className }),
      )}
    >
      {({ isSelected, selectionMode, hasSubmenu }) => {
        const styles = menuStyles({ size, tone, selectable: selectionMode !== 'none' });
        return (
          <>
            {selectionMode !== 'none' ? (
              <span data-slot="check" aria-hidden="true" className={styles.check()}>
                {isSelected ? <icons.check /> : null}
              </span>
            ) : null}
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
              <span data-slot="submenu-indicator" aria-hidden="true" className={styles.submenu()}>
                <icons.chevronRight className="rtl:-scale-x-100" />
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
