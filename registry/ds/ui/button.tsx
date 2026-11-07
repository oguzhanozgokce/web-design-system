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
import { cn, tv } from '@/registry/ds/lib/utils';
import { useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';
import { Spinner } from '@/registry/ds/ui/spinner';

export const buttonStyles = tv({
  base: [
    'focus-ring transition-control no-tap-highlight group/button relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-control font-medium whitespace-nowrap no-underline select-none',
    'motion-reduce:data-[pressed]:scale-100',
    'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
  ],
  variants: {
    variant: {
      solid: '',
      soft: '',
      outline: 'border bg-transparent',
      ghost: 'bg-transparent',
    },
    tone: {
      primary: '',
      neutral: '',
      error: '[--focus-color:var(--error)]',
    },
    size: {
      sm: 'h-8 gap-1.5 px-3 text-sm data-[pressed]:scale-[0.98] [--icon-size:1rem]',
      md: 'h-10 gap-2 px-4 text-sm data-[pressed]:scale-[0.97] [--icon-size:1rem]',
      lg: 'h-12 gap-2 px-5 text-base data-[pressed]:scale-[0.96] [--icon-size:1.25rem]',
    },
    fullWidth: {
      true: 'w-full',
    },
  },
  compoundVariants: [
    {
      variant: 'solid',
      tone: 'primary',
      class:
        'bg-primary-solid text-on-primary-solid data-[hovered]:bg-primary-solid-hover data-[pressed]:bg-primary-solid-hover',
    },
    {
      variant: 'solid',
      tone: 'neutral',
      class:
        'bg-inverse-surface text-inverse-on-surface data-[hovered]:bg-inverse-surface-hover data-[pressed]:bg-inverse-surface-hover',
    },
    {
      variant: 'solid',
      tone: 'error',
      class:
        'bg-error-solid text-on-error-solid data-[hovered]:bg-error-solid-hover data-[pressed]:bg-error-solid-hover',
    },
    {
      variant: 'soft',
      tone: 'primary',
      class:
        'bg-primary-soft text-on-primary-soft data-[hovered]:bg-primary-soft-hover data-[pressed]:bg-primary-soft-hover',
    },
    {
      variant: 'soft',
      tone: 'neutral',
      class:
        'bg-neutral-soft text-on-surface data-[hovered]:bg-neutral-soft-hover data-[pressed]:bg-neutral-soft-hover',
    },
    {
      variant: 'soft',
      tone: 'error',
      class:
        'bg-error-soft text-on-error-soft data-[hovered]:bg-error-soft-hover data-[pressed]:bg-error-soft-hover',
    },
    {
      variant: 'outline',
      tone: 'primary',
      class: 'border-primary/40 text-primary data-[hovered]:bg-primary-soft',
    },
    {
      variant: 'outline',
      tone: 'neutral',
      class: 'border-outline-variant text-on-surface data-[hovered]:bg-neutral-soft',
    },
    {
      variant: 'outline',
      tone: 'error',
      class: 'border-error/40 text-error data-[hovered]:bg-error-soft',
    },
    {
      variant: 'ghost',
      tone: 'primary',
      class: 'text-primary data-[hovered]:bg-primary-soft data-[pressed]:bg-primary-soft-hover',
    },
    {
      variant: 'ghost',
      tone: 'neutral',
      class: 'text-on-surface data-[hovered]:bg-neutral-soft data-[pressed]:bg-neutral-soft-hover',
    },
    {
      variant: 'ghost',
      tone: 'error',
      class: 'text-error data-[hovered]:bg-error-soft data-[pressed]:bg-error-soft-hover',
    },
  ],
  defaultVariants: {
    variant: 'solid',
    tone: 'primary',
    size: 'md',
  },
});

export type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost';
export type ButtonTone = 'primary' | 'neutral' | 'error';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonStyleProps {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export function resolveButtonStyle({
  variant = 'solid',
  tone,
  size = 'md',
}: Pick<ButtonStyleProps, 'variant' | 'tone' | 'size'>) {
  const resolvedTone: ButtonTone = tone ?? (variant === 'solid' ? 'primary' : 'neutral');
  return { variant, tone: resolvedTone, size };
}

export interface ButtonGroupContextValue {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
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
    ...resolveButtonStyle({
      variant: variant ?? group?.variant,
      tone: tone ?? group?.tone,
      size: size ?? group?.size,
    }),
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
  const { effectsEnabled } = useMotionPreference();

  return (
    <>
      <span
        data-slot="content"
        className={cn(
          'inline-flex items-center justify-center gap-[inherit] group-data-[pending]/button:opacity-0',
          effectsEnabled && 'transition-opacity duration-150 group-data-[pending]/button:delay-300',
        )}
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
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            effectsEnabled && 'animate-ds-fade-in-delayed',
          )}
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
