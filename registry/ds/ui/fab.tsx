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
import { tv } from '@/registry/ds/lib/utils';
import {
  useDirection,
  useIcons,
  useLabels,
  useMotionPreference,
} from '@/registry/ds/ui/ds-provider';
import { Spinner } from '@/registry/ds/ui/spinner';
import { useThemeScopeProps } from '@/registry/ds/lib/theme-scope';

const fabBase = [
  'focus-ring transition-control no-tap-highlight group/fab relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-control font-medium whitespace-nowrap select-none',
  'shadow-sm data-[hovered]:shadow-lg data-[pressed]:scale-[0.96] data-[pressed]:shadow-sm',
  'starting:scale-90 starting:opacity-0',
  'motion-reduce:starting:scale-100 motion-reduce:data-[pressed]:scale-100',
  'data-[reduced-motion]:transition-none data-[reduced-motion]:data-[pressed]:scale-100',
  'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
];

const fabTones = {
  primary:
    'bg-primary-solid text-on-primary-solid data-[hovered]:bg-primary-solid-hover data-[pressed]:bg-primary-solid-hover',
  neutral:
    'bg-surface-overlay text-on-surface data-[hovered]:bg-surface-overlay-hover data-[pressed]:bg-surface-overlay-hover',
};

export const fabStyles = tv({
  base: fabBase,
  variants: {
    tone: fabTones,
    size: {
      md: 'size-12 [--icon-size:1.25rem]',
      lg: 'size-14 [--icon-size:1.5rem]',
    },
  },
  defaultVariants: {
    tone: 'primary',
    size: 'md',
  },
});

export const extendedFabStyles = tv({
  slots: {
    base: fabBase,
    label:
      'grid grid-cols-[1fr] transition-[grid-template-columns,opacity] duration-250 ease-fluid group-data-[reduced-motion]/fab:transition-none motion-reduce:transition-none',
    labelText: 'overflow-hidden',
    labelInner: 'block whitespace-nowrap',
  },
  variants: {
    tone: {
      primary: { base: fabTones.primary },
      neutral: { base: fabTones.neutral },
    },
    size: {
      md: {
        base: 'h-12 px-3.5 text-sm [--icon-size:1.25rem]',
        labelInner: 'ps-2 pe-1.5',
      },
      lg: {
        base: 'h-14 px-4 text-base [--icon-size:1.5rem]',
        labelInner: 'ps-2 pe-2',
      },
    },
    isExtended: {
      true: {},
      false: { label: 'grid-cols-[0fr] opacity-0' },
    },
  },
  defaultVariants: {
    tone: 'primary',
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
    glyph:
      'inline-flex items-center justify-center transition-[opacity,rotate] duration-200 ease-fluid group-data-[reduced-motion]/fab:transition-none',
    popover: 'group/fab-menu outline-none data-[exiting]:animate-ds-fade-out',
    menu: ['flex flex-col gap-2 outline-none', fabMenuStagger],
    item: [
      'focus-ring no-tap-highlight relative inline-flex h-12 cursor-pointer items-center gap-2 rounded-control bg-surface-overlay ps-4 pe-5 text-sm font-medium text-on-surface shadow-md select-none',
      'data-[hovered]:bg-surface-overlay-hover data-[pressed]:scale-[0.97] data-[pressed]:bg-surface-overlay-hover motion-reduce:data-[pressed]:scale-100',
      'transition-[opacity,translate,scale,background-color] delay-[var(--fab-menu-delay,0ms),var(--fab-menu-delay,0ms),0ms,0ms] duration-[150ms,250ms,250ms,100ms] ease-fluid',
      'starting:opacity-0 motion-safe:starting:translate-y-2 group-data-[placement=bottom]/fab-menu:motion-safe:starting:-translate-y-2',
      'group-data-[reduced-motion]/fab-menu:transition-none group-data-[reduced-motion]/fab-menu:data-[pressed]:scale-100',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
    ],
    icon: 'inline-flex shrink-0 items-center justify-center text-[1.25rem] text-on-surface-variant [&_svg]:size-[1em]',
  },
  variants: {
    align: {
      start: { menu: 'items-start' },
      center: { menu: 'items-center' },
      end: { menu: 'items-end' },
    },
  },
  defaultVariants: {
    align: 'end',
  },
});

export type FabTone = 'primary' | 'neutral';
export type FabSize = 'md' | 'lg';

export interface FabStyleProps {
  tone?: FabTone;
  size?: FabSize;
}

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
  tone = 'primary',
  size = 'md',
  icon,
  labels,
  className,
  onPress,
  isPending: isPendingProp,
  ...props
}: FabProps) {
  const [isPending, track] = usePending(isPendingProp);
  const reducedMotion = useReducedMotionAttribute();
  const style = { tone, size };

  return (
    <AriaButton
      {...props}
      onPress={(event) => track(onPress?.(event))}
      isPending={isPending}
      data-slot="fab"
      data-tone={style.tone}
      data-size={style.size}
      data-reduced-motion={reducedMotion}
      className={composeRenderProps(className, (className) => fabStyles({ ...style, className }))}
    >
      <FabIcon icon={icon} isPending={isPending} labels={labels} />
    </AriaButton>
  );
}

export interface ExtendedFabProps
  extends Omit<AriaButtonProps, 'onPress' | 'children' | 'className'>, FabStyleProps {
  icon: ReactNode;
  children: ReactNode;
  isExtended?: boolean;
  onPress?: (event: PressEvent) => void | Promise<unknown>;
  labels?: Partial<FabLabels>;
  className?: AriaButtonProps['className'];
  ref?: Ref<HTMLButtonElement>;
}

export function ExtendedFab({
  tone = 'primary',
  size = 'md',
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
  const style = { tone, size };
  const styles = extendedFabStyles({ ...style, isExtended });

  return (
    <AriaButton
      {...props}
      onPress={(event) => track(onPress?.(event))}
      isPending={isPending}
      data-slot="extended-fab"
      data-tone={style.tone}
      data-size={style.size}
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
  track: (result: unknown) => void;
}

const FabMenuContext = createContext<FabMenuContextValue>({
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
  tone = 'primary',
  size = 'md',
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
  const style = { tone, size };
  const styles = fabMenuStyles({ align: menuAlignment(placement) });
  const context = useMemo(() => ({ track }), [track]);

  return (
    <FabMenuContext value={context}>
      <MenuTrigger isOpen={isOpen} onOpenChange={setOpen}>
        <AriaButton
          aria-label={ariaLabel}
          isDisabled={isDisabled}
          isPending={isPending}
          data-slot="fab-menu-trigger"
          data-tone={style.tone}
          data-size={style.size}
          data-open={isOpen || undefined}
          data-reduced-motion={reducedMotion}
          className={composeRenderProps(className, (className) =>
            fabStyles({ ...style, className }),
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
  const { track } = use(FabMenuContext);
  const styles = fabMenuStyles();

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
