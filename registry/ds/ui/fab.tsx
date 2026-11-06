'use client';

import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
  type Ref,
} from 'react';
import {
  Button as AriaButton,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  ProgressBar,
  composeRenderProps,
  type ButtonProps as AriaButtonProps,
  type Key,
  type MenuItemProps,
  type PopoverProps,
  type PressEvent,
  useLocale,
} from 'react-aria-components';
import { useControllableState } from '@/registry/ds/hooks/use-controllable-state';
import { tv, type VariantProps } from '@/registry/ds/lib/utils';
import {
  useDirection,
  useIcons,
  useLabels,
  useMotionPreference,
} from '@/registry/ds/ui/ds-provider';
import { Spinner } from '@/registry/ds/ui/spinner';
import { useThemeScopeProps } from '@/registry/ds/lib/theme-scope';

const fabBase = [
  'state-layer focus-ring group/fab relative inline-flex shrink-0 cursor-default items-center justify-center select-none',
  'shadow-elevation-3 data-[hovered]:shadow-elevation-4 data-[pressed]:shadow-elevation-3',
  '[transition:background-color_150ms_var(--ease-standard),color_150ms_var(--ease-standard),box-shadow_150ms_var(--ease-standard),border-radius_var(--fab-morph,150ms)_var(--ds-ease-spatial)]',
  'data-[reduced-motion]:transition-none',
  'data-[disabled]:bg-on-surface/12 data-[disabled]:text-on-surface/38 data-[disabled]:shadow-none',
];

const fabColors = {
  primary: 'bg-primary-container text-on-primary-container',
  secondary: 'bg-secondary-container text-on-secondary-container',
  tertiary: 'bg-tertiary-container text-on-tertiary-container',
  surface: 'bg-surface-container-high text-primary',
};

export const fabStyles = tv({
  base: fabBase,
  variants: {
    color: fabColors,
    size: {
      sm: 'size-10 rounded-md [--icon-size:1.5rem] pointer-coarse:after:absolute pointer-coarse:after:-inset-1',
      md: 'size-14 rounded-lg [--icon-size:1.5rem]',
      lg: 'size-24 rounded-xl [--icon-size:2.25rem]',
    },
  },
  defaultVariants: {
    color: 'primary',
    size: 'md',
  },
});

export const extendedFabStyles = tv({
  slots: {
    base: fabBase,
    label:
      'grid grid-cols-[1fr] [transition:grid-template-columns_var(--ds-duration-spatial)_var(--ds-ease-spatial),opacity_150ms_var(--ease-standard)] group-data-[reduced-motion]/fab:transition-none motion-reduce:transition-none',
    labelText: 'overflow-hidden',
    labelInner: 'block whitespace-nowrap',
  },
  variants: {
    color: { primary: {}, secondary: {}, tertiary: {}, surface: {} },
    size: {
      md: {
        base: 'h-14 rounded-lg px-4 text-title-md [--icon-size:1.5rem]',
        labelInner: 'ps-3 pe-1',
      },
      lg: {
        base: 'h-24 rounded-xl px-[1.875rem] text-headline-sm [--icon-size:2.25rem]',
        labelInner: 'ps-4',
      },
    },
    isExtended: {
      true: {},
      false: { label: 'grid-cols-[0fr] opacity-0' },
    },
  },
  compoundVariants: (Object.keys(fabColors) as (keyof typeof fabColors)[]).map((color) => ({
    color,
    class: { base: fabColors[color] },
  })),
  defaultVariants: {
    color: 'primary',
    size: 'md',
    isExtended: true,
  },
});

const fabMenuStagger = [
  'group-data-[placement=top]/fab-menu:[&>:nth-last-child(2)]:[--fab-menu-delay:30ms]',
  'group-data-[placement=top]/fab-menu:[&>:nth-last-child(3)]:[--fab-menu-delay:60ms]',
  'group-data-[placement=top]/fab-menu:[&>:nth-last-child(4)]:[--fab-menu-delay:90ms]',
  'group-data-[placement=top]/fab-menu:[&>:nth-last-child(5)]:[--fab-menu-delay:120ms]',
  'group-data-[placement=top]/fab-menu:[&>:nth-last-child(n+6)]:[--fab-menu-delay:150ms]',
  'group-data-[placement=bottom]/fab-menu:[&>:nth-child(2)]:[--fab-menu-delay:30ms]',
  'group-data-[placement=bottom]/fab-menu:[&>:nth-child(3)]:[--fab-menu-delay:60ms]',
  'group-data-[placement=bottom]/fab-menu:[&>:nth-child(4)]:[--fab-menu-delay:90ms]',
  'group-data-[placement=bottom]/fab-menu:[&>:nth-child(5)]:[--fab-menu-delay:120ms]',
  'group-data-[placement=bottom]/fab-menu:[&>:nth-child(n+6)]:[--fab-menu-delay:150ms]',
];

export const fabMenuStyles = tv({
  slots: {
    trigger: [
      '[--fab-morph:var(--ds-duration-spatial)] motion-reduce:[--fab-morph:0ms]',
      'data-[open]:rounded-[50%] data-[open]:data-[pressed]:before:opacity-0',
    ],
    glyph:
      'inline-flex items-center justify-center transition-[opacity,rotate] duration-[150ms,var(--ds-duration-spatial)] ease-spatial group-data-[reduced-motion]/fab:transition-none',
    popover: 'group/fab-menu outline-none data-[exiting]:animate-ds-fade-out',
    menu: ['flex flex-col gap-2 outline-none', fabMenuStagger],
    item: [
      'state-layer focus-ring relative inline-flex h-14 cursor-default items-center gap-2 rounded-full ps-4 pe-6 text-title-md select-none',
      'shadow-elevation-1 data-[hovered]:shadow-elevation-2',
      'transition-[opacity,translate,box-shadow] delay-[var(--fab-menu-delay,0ms),var(--fab-menu-delay,0ms),0ms] duration-[250ms,var(--ds-duration-spatial),150ms] ease-spatial',
      'starting:opacity-0 motion-safe:starting:translate-y-4 group-data-[placement=bottom]/fab-menu:motion-safe:starting:-translate-y-4',
      'group-data-[reduced-motion]/fab-menu:transition-none',
      'data-[disabled]:bg-on-surface/12 data-[disabled]:text-on-surface/38 data-[disabled]:shadow-none',
    ],
    icon: 'inline-flex shrink-0 items-center justify-center text-[1.5rem] [&_svg]:size-[1em]',
  },
  variants: {
    color: {
      primary: {
        trigger: 'data-[open]:bg-primary data-[open]:text-on-primary',
        item: fabColors.primary,
      },
      secondary: {
        trigger: 'data-[open]:bg-secondary data-[open]:text-on-secondary',
        item: fabColors.secondary,
      },
      tertiary: {
        trigger: 'data-[open]:bg-tertiary data-[open]:text-on-tertiary',
        item: fabColors.tertiary,
      },
      surface: {
        trigger: 'data-[open]:bg-primary data-[open]:text-on-primary',
        item: fabColors.surface,
      },
    },
    align: {
      start: { menu: 'items-start' },
      center: { menu: 'items-center' },
      end: { menu: 'items-end' },
    },
  },
  defaultVariants: {
    color: 'primary',
    align: 'end',
  },
});

export type FabStyleProps = VariantProps<typeof fabStyles>;

export type FabColor = keyof typeof fabColors;

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return value != null && typeof (value as PromiseLike<unknown>).then === 'function';
}

function usePending(isPendingProp: boolean | undefined) {
  const [running, setRunning] = useState(0);

  const track = useCallback((result: unknown) => {
    if (!isPromiseLike(result)) return;
    setRunning((count) => count + 1);
    const settle = () => setRunning((count) => count - 1);
    result.then(settle, settle);
  }, []);

  return [isPendingProp ?? running > 0, track] as const;
}

function useReducedMotionAttribute() {
  const { preference } = useMotionPreference();
  return preference === 'system' ? undefined : true;
}

export interface FabLabels {
  pending: string;
}

export const defaultFabLabels: FabLabels = {
  pending: 'Loading',
};

const iconSlot =
  'relative inline-flex shrink-0 items-center justify-center text-(length:--icon-size) [&_svg]:size-[1em]';

interface FabIconProps {
  icon: ReactNode;
  isPending?: boolean;
  labels?: Partial<FabLabels>;
}

function FabIcon({ icon, isPending, labels }: FabIconProps) {
  const t = useLabels('fab', defaultFabLabels, labels);

  return (
    <span data-slot="icon" className={iconSlot}>
      <span className="inline-flex transition-opacity duration-150 group-data-[pending]/fab:opacity-0 group-data-[pending]/fab:delay-300">
        {icon}
      </span>
      {isPending ? (
        <ProgressBar
          isIndeterminate
          aria-label={t.pending}
          data-slot="pending"
          className="absolute inset-0 flex animate-ds-fade-in-delayed items-center justify-center"
        >
          <Spinner />
        </ProgressBar>
      ) : null}
    </span>
  );
}

export interface FabProps
  extends
    Omit<AriaButtonProps, 'onPress' | 'children' | 'className' | 'aria-label'>,
    FabStyleProps {
  'aria-label': string;
  icon: ReactNode;
  onPress?: (event: PressEvent) => void | Promise<unknown>;
  labels?: Partial<FabLabels>;
  className?: AriaButtonProps['className'];
  ref?: Ref<HTMLButtonElement>;
}

export function Fab({
  color,
  size,
  icon,
  labels,
  className,
  onPress,
  isPending: isPendingProp,
  ...props
}: FabProps) {
  const [isPending, track] = usePending(isPendingProp);
  const reducedMotion = useReducedMotionAttribute();

  return (
    <AriaButton
      {...props}
      onPress={(event) => track(onPress?.(event))}
      isPending={isPending}
      data-slot="fab"
      data-color={color ?? 'primary'}
      data-size={size ?? 'md'}
      data-reduced-motion={reducedMotion}
      className={composeRenderProps(className, (className) =>
        fabStyles({ color, size, className }),
      )}
    >
      <FabIcon icon={icon} isPending={isPending} labels={labels} />
    </AriaButton>
  );
}

export interface ExtendedFabProps extends Omit<
  AriaButtonProps,
  'onPress' | 'children' | 'className'
> {
  icon: ReactNode;
  children: ReactNode;
  color?: FabColor;
  size?: 'md' | 'lg';
  isExtended?: boolean;
  onPress?: (event: PressEvent) => void | Promise<unknown>;
  labels?: Partial<FabLabels>;
  className?: AriaButtonProps['className'];
  ref?: Ref<HTMLButtonElement>;
}

export function ExtendedFab({
  color,
  size,
  icon,
  children,
  isExtended = true,
  labels,
  className,
  onPress,
  isPending: isPendingProp,
  ...props
}: ExtendedFabProps) {
  const [isPending, track] = usePending(isPendingProp);
  const reducedMotion = useReducedMotionAttribute();
  const styles = extendedFabStyles({ color, size, isExtended });

  return (
    <AriaButton
      {...props}
      onPress={(event) => track(onPress?.(event))}
      isPending={isPending}
      data-slot="extended-fab"
      data-color={color ?? 'primary'}
      data-size={size ?? 'md'}
      data-extended={isExtended}
      data-reduced-motion={reducedMotion}
      className={composeRenderProps(className, (className) => styles.base({ className }))}
    >
      <FabIcon icon={icon} isPending={isPending} labels={labels} />
      <span data-slot="label" className={styles.label()}>
        <span className={styles.labelText()}>
          <span className={styles.labelInner()}>{children}</span>
        </span>
      </span>
    </AriaButton>
  );
}

interface FabMenuContextValue {
  color: FabColor;
  track: (result: unknown) => void;
}

const FabMenuContext = createContext<FabMenuContextValue>({
  color: 'primary',
  track: () => {},
});

type FabMenuPlacement = Extract<
  PopoverProps['placement'],
  'top end' | 'top start' | 'top' | 'bottom end' | 'bottom start' | 'bottom'
>;

function menuAlignment(placement: FabMenuPlacement) {
  if (placement.endsWith('start')) return 'start';
  if (placement.endsWith('end')) return 'end';
  return 'center';
}

export interface FabMenuProps extends FabStyleProps {
  'aria-label': string;
  children: ReactNode;
  icon?: ReactNode;
  closeIcon?: ReactNode;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  onAction?: (key: Key) => void | Promise<unknown>;
  isPending?: boolean;
  isDisabled?: boolean;
  placement?: FabMenuPlacement;
  labels?: Partial<FabLabels>;
  className?: AriaButtonProps['className'];
}

export function FabMenu({
  'aria-label': ariaLabel,
  children,
  icon,
  closeIcon,
  isOpen: isOpenProp,
  defaultOpen = false,
  onOpenChange,
  onAction,
  isPending: isPendingProp,
  isDisabled,
  placement = 'top end',
  color,
  size,
  labels,
  className,
}: FabMenuProps) {
  const icons = useIcons();
  const { locale } = useLocale();
  const direction = useDirection();
  const reducedMotion = useReducedMotionAttribute();
  const themeScope = useThemeScopeProps();
  const [isOpen, setOpen] = useControllableState(isOpenProp, defaultOpen, onOpenChange);
  const [isPending, track] = usePending(isPendingProp);
  const resolvedColor = color ?? 'primary';
  const styles = fabMenuStyles({ color: resolvedColor, align: menuAlignment(placement) });
  const context = useMemo(() => ({ color: resolvedColor, track }), [resolvedColor, track]);

  return (
    <FabMenuContext value={context}>
      <MenuTrigger isOpen={isOpen} onOpenChange={setOpen}>
        <AriaButton
          aria-label={ariaLabel}
          isDisabled={isDisabled}
          isPending={isPending}
          data-slot="fab-menu-trigger"
          data-color={resolvedColor}
          data-size={size ?? 'md'}
          data-open={isOpen || undefined}
          data-reduced-motion={reducedMotion}
          className={composeRenderProps(className, (className) =>
            fabStyles({ color, size, className: styles.trigger({ className }) }),
          )}
        >
          <FabIcon
            isPending={isPending}
            labels={labels}
            icon={
              <>
                <span
                  className={styles.glyph({
                    className:
                      'group-data-[open]/fab:opacity-0 motion-safe:group-data-[open]/fab:-rotate-90',
                  })}
                >
                  {icon ?? <icons.add />}
                </span>
                <span
                  className={styles.glyph({
                    className:
                      'absolute inset-0 opacity-0 group-data-[open]/fab:opacity-100 motion-safe:rotate-90 motion-safe:group-data-[open]/fab:rotate-0',
                  })}
                >
                  {closeIcon ?? <icons.close />}
                </span>
              </>
            }
          />
        </AriaButton>
        <Popover
          placement={placement}
          offset={8}
          dir={direction}
          lang={locale}
          {...themeScope}
          data-slot="fab-menu-popover"
          data-reduced-motion={reducedMotion}
          className={styles.popover()}
        >
          <Menu
            data-slot="fab-menu"
            onAction={(key) => track(onAction?.(key))}
            className={styles.menu()}
          >
            {children}
          </Menu>
        </Popover>
      </MenuTrigger>
    </FabMenuContext>
  );
}

export interface FabMenuItemProps extends Omit<
  MenuItemProps,
  'children' | 'className' | 'onAction'
> {
  children: ReactNode;
  icon?: ReactNode;
  onAction?: () => void | Promise<unknown>;
  className?: MenuItemProps['className'];
}

export function FabMenuItem({
  children,
  icon,
  textValue,
  onAction,
  className,
  ...props
}: FabMenuItemProps) {
  const { color, track } = use(FabMenuContext);
  const styles = fabMenuStyles({ color });

  return (
    <MenuItem
      {...props}
      onAction={onAction ? () => track(onAction()) : undefined}
      textValue={textValue ?? (typeof children === 'string' ? children : undefined)}
      data-slot="fab-menu-item"
      className={composeRenderProps(className, (className) => styles.item({ className }))}
    >
      {icon ? (
        <span data-slot="icon" className={styles.icon()}>
          {icon}
        </span>
      ) : null}
      <span data-slot="label">{children}</span>
    </MenuItem>
  );
}
