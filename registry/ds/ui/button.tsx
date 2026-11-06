'use client';

import { createContext, use, useState, type ReactNode } from 'react';
import {
  Button as AriaButton,
  Link as AriaLink,
  ProgressBar,
  composeRenderProps,
  type ButtonProps as AriaButtonProps,
  type LinkProps as AriaLinkProps,
  type PressEvent,
} from 'react-aria-components';
import { tv, type VariantProps } from '@/registry/ds/lib/utils';
import { useLabels } from '@/registry/ds/ui/ds-provider';
import { Spinner } from '@/registry/ds/ui/spinner';

export const buttonStyles = tv({
  base: [
    'state-layer focus-ring group/button relative inline-flex shrink-0 cursor-default items-center justify-center rounded-full font-medium whitespace-nowrap no-underline select-none',
    'transition-[background-color,color,border-color,box-shadow,scale] duration-150 ease-standard',
    'data-[pressed]:scale-[0.97] motion-reduce:data-[pressed]:scale-100',
    'data-[disabled]:text-on-surface/38 data-[disabled]:shadow-none',
  ],
  variants: {
    variant: {
      filled: 'data-[disabled]:bg-on-surface/12',
      tonal: 'data-[disabled]:bg-on-surface/12',
      outlined: 'border bg-transparent data-[disabled]:border-on-surface/12',
      text: 'bg-transparent',
      elevated:
        'shadow-elevation-1 data-[disabled]:bg-on-surface/12 data-[hovered]:shadow-elevation-2',
    },
    tone: {
      default: '',
      destructive: '',
    },
    size: {
      xs: 'h-7 gap-1 px-3 text-label-md [--icon-size:1rem]',
      sm: 'h-8 gap-1.5 px-3.5 text-label-lg [--icon-size:1.125rem]',
      md: 'h-10 gap-2 px-5 text-label-lg [--icon-size:1.25rem]',
      lg: 'h-12 gap-2 px-6 text-title-md [--icon-size:1.375rem]',
      xl: 'h-14 gap-2.5 px-8 text-title-lg [--icon-size:1.5rem]',
    },
    fullWidth: {
      true: 'w-full',
    },
  },
  compoundVariants: [
    { variant: 'filled', tone: 'default', class: 'bg-primary text-on-primary' },
    { variant: 'filled', tone: 'destructive', class: 'bg-error text-on-error' },
    {
      variant: 'tonal',
      tone: 'default',
      class: 'bg-secondary-container text-on-secondary-container',
    },
    { variant: 'tonal', tone: 'destructive', class: 'bg-error-container text-on-error-container' },
    { variant: 'outlined', tone: 'default', class: 'border-outline-variant text-primary' },
    { variant: 'outlined', tone: 'destructive', class: 'border-error/40 text-error' },
    { variant: 'text', tone: 'default', class: 'text-primary' },
    { variant: 'text', tone: 'destructive', class: 'text-error' },
    { variant: 'elevated', tone: 'default', class: 'bg-surface-container-low text-primary' },
    { variant: 'elevated', tone: 'destructive', class: 'bg-surface-container-low text-error' },
  ],
  defaultVariants: {
    variant: 'filled',
    tone: 'default',
    size: 'md',
  },
});

export type ButtonStyleProps = VariantProps<typeof buttonStyles>;

export interface ButtonGroupContextValue {
  variant?: ButtonStyleProps['variant'];
  tone?: ButtonStyleProps['tone'];
  size?: ButtonStyleProps['size'];
  isDisabled?: boolean;
}

export const ButtonGroupContext = createContext<ButtonGroupContextValue | null>(null);

function useGroupedStyle({
  variant,
  tone,
  size,
}: Pick<ButtonStyleProps, 'variant' | 'tone' | 'size'>) {
  const group = use(ButtonGroupContext);
  return {
    variant: variant ?? group?.variant ?? 'filled',
    tone: tone ?? group?.tone ?? 'default',
    size: size ?? group?.size ?? 'md',
    isGroupDisabled: group?.isDisabled,
  };
}

export interface ButtonLabels {
  pending: string;
}

export const defaultButtonLabels: ButtonLabels = {
  pending: 'Loading',
};

const iconSlot =
  'inline-flex shrink-0 items-center justify-center text-(length:--icon-size) [&_svg]:size-[1em]';

interface ButtonContentProps {
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  children?: ReactNode;
  isPending?: boolean;
  labels?: Partial<ButtonLabels>;
}

function ButtonContent({ startIcon, endIcon, children, isPending, labels }: ButtonContentProps) {
  const t = useLabels('button', defaultButtonLabels, labels);

  return (
    <>
      <span
        data-slot="content"
        className="inline-flex items-center justify-center gap-[inherit] transition-opacity duration-150 group-data-[pending]/button:opacity-0 group-data-[pending]/button:delay-300"
      >
        {startIcon ? (
          <span data-slot="start-icon" className={iconSlot}>
            {startIcon}
          </span>
        ) : null}
        {children != null ? <span data-slot="label">{children}</span> : null}
        {endIcon ? (
          <span data-slot="end-icon" className={iconSlot}>
            {endIcon}
          </span>
        ) : null}
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

export interface ButtonProps
  extends Omit<AriaButtonProps, 'onPress' | 'children' | 'className'>, ButtonStyleProps {
  onPress?: (event: PressEvent) => void | Promise<unknown>;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  children?: ReactNode;
  labels?: Partial<ButtonLabels>;
  className?: AriaButtonProps['className'];
}

export function Button({
  variant,
  tone,
  size,
  fullWidth,
  startIcon,
  endIcon,
  children,
  labels,
  className,
  onPress,
  isPending: isPendingProp,
  isDisabled,
  ...props
}: ButtonProps) {
  const { isGroupDisabled, ...style } = useGroupedStyle({ variant, tone, size });
  const [isRunning, setRunning] = useState(false);
  const isPending = isPendingProp ?? isRunning;

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
      data-slot="button"
      data-variant={style.variant}
      data-tone={style.tone}
      data-size={style.size}
      className={composeRenderProps(className, (className) =>
        buttonStyles({ ...style, fullWidth, className }),
      )}
    >
      <ButtonContent startIcon={startIcon} endIcon={endIcon} isPending={isPending} labels={labels}>
        {children}
      </ButtonContent>
    </AriaButton>
  );
}

export interface ButtonLinkProps
  extends Omit<AriaLinkProps, 'children' | 'className'>, ButtonStyleProps {
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  children?: ReactNode;
  className?: AriaLinkProps['className'];
}

export function ButtonLink({
  variant,
  tone,
  size,
  fullWidth,
  startIcon,
  endIcon,
  children,
  className,
  isDisabled,
  ...props
}: ButtonLinkProps) {
  const { isGroupDisabled, ...style } = useGroupedStyle({ variant, tone, size });

  return (
    <AriaLink
      {...props}
      isDisabled={isDisabled ?? isGroupDisabled}
      data-slot="button"
      data-variant={style.variant}
      data-tone={style.tone}
      data-size={style.size}
      className={composeRenderProps(className, (className) =>
        buttonStyles({ ...style, fullWidth, className }),
      )}
    >
      <ButtonContent startIcon={startIcon} endIcon={endIcon}>
        {children}
      </ButtonContent>
    </AriaLink>
  );
}
