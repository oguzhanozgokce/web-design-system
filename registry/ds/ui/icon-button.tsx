'use client';

import { use, useState, type ReactNode, type Ref } from 'react';
import {
  Button as AriaButton,
  Link as AriaLink,
  ProgressBar,
  ToggleButton as AriaToggleButton,
  composeRenderProps,
  type ButtonProps as AriaButtonProps,
  type LinkProps as AriaLinkProps,
  type PressEvent,
  type ToggleButtonProps as AriaToggleButtonProps,
} from 'react-aria-components';
import { tv, type VariantProps } from '@/registry/ds/lib/utils';
import { ButtonGroupContext } from '@/registry/ds/ui/button';
import { useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';
import { Spinner } from '@/registry/ds/ui/spinner';

export const iconButtonStyles = tv({
  base: [
    'state-layer focus-ring group/icon-button relative inline-flex shrink-0 cursor-default items-center justify-center no-underline select-none',
    'rounded-(--icon-button-radius) data-[pressed]:rounded-[25%]',
    '[--icon-button-morph:var(--ds-duration-spatial-fast)] motion-reduce:[--icon-button-morph:0ms] data-[reduced-motion]:[--icon-button-morph:0ms]',
    '[transition:background-color_150ms_var(--ease-standard),color_150ms_var(--ease-standard),border-color_150ms_var(--ease-standard),border-radius_var(--icon-button-morph)_var(--ds-ease-spatial-fast)]',
    'pointer-coarse:after:absolute',
    'data-[disabled]:text-on-surface/38',
  ],
  variants: {
    variant: {
      standard: 'bg-transparent',
      filled: 'data-[disabled]:bg-on-surface/12',
      tonal: 'data-[disabled]:bg-on-surface/12',
      outlined: 'border bg-transparent data-[disabled]:border-on-surface/12',
    },
    tone: {
      default: '',
      destructive: '',
    },
    size: {
      xs: 'size-7 [--icon-button-square:var(--radius-sm)] [--icon-size:1.125rem] pointer-coarse:after:-inset-2.5',
      sm: 'size-8 [--icon-button-square:var(--radius-sm)] [--icon-size:1.25rem] pointer-coarse:after:-inset-2',
      md: 'size-10 [--icon-button-square:var(--radius-md)] [--icon-size:1.5rem] pointer-coarse:after:-inset-1',
      lg: 'size-12 [--icon-button-square:var(--radius-md)] [--icon-size:1.5rem]',
      xl: 'size-14 [--icon-button-square:var(--radius-lg)] [--icon-size:1.75rem]',
    },
    shape: {
      round: '[--icon-button-radius:50%] [--icon-button-selected-radius:var(--icon-button-square)]',
      square:
        '[--icon-button-radius:var(--icon-button-square)] [--icon-button-selected-radius:50%]',
    },
    toggle: {
      true: 'data-[selected]:not-data-[pressed]:rounded-(--icon-button-selected-radius) data-[selected]:data-[disabled]:text-on-surface/38',
      false: '',
    },
  },
  compoundVariants: [
    { toggle: false, variant: 'standard', tone: 'default', class: 'text-on-surface-variant' },
    { toggle: false, variant: 'standard', tone: 'destructive', class: 'text-error' },
    { toggle: false, variant: 'filled', tone: 'default', class: 'bg-primary text-on-primary' },
    { toggle: false, variant: 'filled', tone: 'destructive', class: 'bg-error text-on-error' },
    {
      toggle: false,
      variant: 'tonal',
      tone: 'default',
      class: 'bg-secondary-container text-on-secondary-container',
    },
    {
      toggle: false,
      variant: 'tonal',
      tone: 'destructive',
      class: 'bg-error-container text-on-error-container',
    },
    {
      toggle: false,
      variant: 'outlined',
      tone: 'default',
      class: 'border-outline-variant text-on-surface-variant',
    },
    {
      toggle: false,
      variant: 'outlined',
      tone: 'destructive',
      class: 'border-error/40 text-error',
    },
    {
      toggle: true,
      variant: 'standard',
      class: 'text-on-surface-variant data-[selected]:text-primary',
    },
    {
      toggle: true,
      variant: 'filled',
      class:
        'bg-surface-container-highest text-primary data-[selected]:bg-primary data-[selected]:text-on-primary data-[selected]:data-[disabled]:bg-on-surface/12',
    },
    {
      toggle: true,
      variant: 'tonal',
      class:
        'bg-surface-container-highest text-on-surface-variant data-[selected]:bg-secondary-container data-[selected]:text-on-secondary-container data-[selected]:data-[disabled]:bg-on-surface/12',
    },
    {
      toggle: true,
      variant: 'outlined',
      class:
        'border-outline-variant text-on-surface-variant data-[selected]:border-transparent data-[selected]:bg-inverse-surface data-[selected]:text-inverse-on-surface data-[selected]:data-[disabled]:border-transparent data-[selected]:data-[disabled]:bg-on-surface/12',
    },
  ],
  defaultVariants: {
    variant: 'standard',
    tone: 'default',
    size: 'md',
    shape: 'round',
    toggle: false,
  },
});

export type IconButtonStyleProps = Omit<VariantProps<typeof iconButtonStyles>, 'toggle'>;

type IconButtonVariant = NonNullable<IconButtonStyleProps['variant']>;

const groupVariants: Partial<Record<string, IconButtonVariant>> = {
  filled: 'filled',
  tonal: 'tonal',
  outlined: 'outlined',
  text: 'standard',
};

function useGroupedStyle({ variant, tone, size, shape }: IconButtonStyleProps) {
  const group = use(ButtonGroupContext);
  return {
    variant: variant ?? (group?.variant ? groupVariants[group.variant] : undefined) ?? 'standard',
    tone: tone ?? group?.tone ?? 'default',
    size: size ?? group?.size ?? 'md',
    shape: shape ?? 'round',
    isGroupDisabled: group?.isDisabled,
  };
}

export interface IconButtonLabels {
  pending: string;
}

export const defaultIconButtonLabels: IconButtonLabels = {
  pending: 'Loading',
};

const iconSlot =
  'inline-flex shrink-0 items-center justify-center text-(length:--icon-size) [&_svg]:size-[1em]';

interface IconButtonContentProps {
  icon: ReactNode;
  isPending?: boolean;
  labels?: Partial<IconButtonLabels>;
}

function IconButtonContent({ icon, isPending, labels }: IconButtonContentProps) {
  const t = useLabels('iconButton', defaultIconButtonLabels, labels);

  return (
    <>
      <span
        data-slot="icon"
        className={`${iconSlot} transition-opacity duration-150 group-data-[pending]/icon-button:opacity-0 group-data-[pending]/icon-button:delay-300`}
      >
        {icon}
      </span>
      {isPending ? (
        <ProgressBar
          isIndeterminate
          aria-label={t.pending}
          data-slot="pending"
          className="absolute inset-0 flex animate-ds-fade-in-delayed items-center justify-center"
        >
          <Spinner className="text-(length:--icon-size)" />
        </ProgressBar>
      ) : null}
    </>
  );
}

function useReducedMotionAttribute() {
  const { preference } = useMotionPreference();
  return preference === 'system' ? undefined : true;
}

export interface IconButtonProps
  extends
    Omit<AriaButtonProps, 'onPress' | 'children' | 'className' | 'aria-label'>,
    IconButtonStyleProps {
  'aria-label': string;
  icon: ReactNode;
  onPress?: (event: PressEvent) => void | Promise<unknown>;
  labels?: Partial<IconButtonLabels>;
  className?: AriaButtonProps['className'];
  ref?: Ref<HTMLButtonElement>;
}

export function IconButton({
  variant,
  tone,
  size,
  shape,
  icon,
  labels,
  className,
  onPress,
  isPending: isPendingProp,
  isDisabled,
  ...props
}: IconButtonProps) {
  const { isGroupDisabled, ...style } = useGroupedStyle({ variant, tone, size, shape });
  const [isRunning, setRunning] = useState(false);
  const isPending = isPendingProp ?? isRunning;
  const reducedMotion = useReducedMotionAttribute();

  function handlePress(event: PressEvent) {
    const result = onPress?.(event);
    if (result && typeof result.then === 'function') {
      setRunning(true);
      result.then(
        () => setRunning(false),
        () => setRunning(false),
      );
    }
  }

  return (
    <AriaButton
      {...props}
      onPress={handlePress}
      isPending={isPending}
      isDisabled={isDisabled ?? isGroupDisabled}
      data-slot="icon-button"
      data-variant={style.variant}
      data-tone={style.tone}
      data-size={style.size}
      data-shape={style.shape}
      data-reduced-motion={reducedMotion}
      className={composeRenderProps(className, (className) =>
        iconButtonStyles({ ...style, toggle: false, className }),
      )}
    >
      <IconButtonContent icon={icon} isPending={isPending} labels={labels} />
    </AriaButton>
  );
}

export interface IconButtonLinkProps
  extends Omit<AriaLinkProps, 'children' | 'className' | 'aria-label'>, IconButtonStyleProps {
  'aria-label': string;
  icon: ReactNode;
  className?: AriaLinkProps['className'];
  ref?: Ref<HTMLAnchorElement>;
}

export function IconButtonLink({
  variant,
  tone,
  size,
  shape,
  icon,
  className,
  isDisabled,
  ...props
}: IconButtonLinkProps) {
  const { isGroupDisabled, ...style } = useGroupedStyle({ variant, tone, size, shape });
  const reducedMotion = useReducedMotionAttribute();

  return (
    <AriaLink
      {...props}
      isDisabled={isDisabled ?? isGroupDisabled}
      data-slot="icon-button"
      data-variant={style.variant}
      data-tone={style.tone}
      data-size={style.size}
      data-shape={style.shape}
      data-reduced-motion={reducedMotion}
      className={composeRenderProps(className, (className) =>
        iconButtonStyles({ ...style, toggle: false, className }),
      )}
    >
      <IconButtonContent icon={icon} />
    </AriaLink>
  );
}

export interface IconToggleButtonProps
  extends
    Omit<AriaToggleButtonProps, 'children' | 'className' | 'aria-label'>,
    Omit<IconButtonStyleProps, 'tone'> {
  'aria-label': string;
  icon: ReactNode;
  selectedIcon?: ReactNode;
  className?: AriaToggleButtonProps['className'];
  ref?: Ref<HTMLButtonElement>;
}

export function IconToggleButton({
  variant,
  size,
  shape,
  icon,
  selectedIcon,
  className,
  isDisabled,
  ...props
}: IconToggleButtonProps) {
  const { isGroupDisabled, ...style } = useGroupedStyle({
    variant,
    size,
    shape,
    tone: 'default',
  });
  const reducedMotion = useReducedMotionAttribute();

  return (
    <AriaToggleButton
      {...props}
      isDisabled={isDisabled ?? isGroupDisabled}
      data-slot="icon-toggle-button"
      data-variant={style.variant}
      data-size={style.size}
      data-shape={style.shape}
      data-reduced-motion={reducedMotion}
      className={composeRenderProps(className, (className) =>
        iconButtonStyles({ ...style, toggle: true, className }),
      )}
    >
      {({ isSelected }) => (
        <span data-slot="icon" className={iconSlot}>
          {isSelected && selectedIcon ? selectedIcon : icon}
        </span>
      )}
    </AriaToggleButton>
  );
}
