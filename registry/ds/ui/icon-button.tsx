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
import { tv } from '@/registry/ds/lib/utils';
import {
  ButtonGroupContext,
  buttonStyles,
  resolveButtonStyle,
  type ButtonTone,
  type ButtonVariant,
} from '@/registry/ds/ui/button';
import { useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';
import { Spinner } from '@/registry/ds/ui/spinner';

export const iconButtonStyles = tv({
  extend: buttonStyles,
  base: [
    'group/icon-button pointer-coarse:after:absolute',
    'data-[reduced-motion]:data-[pressed]:scale-100',
  ],
  variants: {
    size: {
      xs: 'size-7 p-0 data-[pressed]:scale-[0.93] [--icon-size:1rem] pointer-coarse:after:-inset-2.5',
      sm: 'size-8 p-0 [--icon-size:1rem] pointer-coarse:after:-inset-2',
      md: 'size-10 p-0 [--icon-size:1.25rem] pointer-coarse:after:-inset-1',
      lg: 'size-12 p-0 [--icon-size:1.5rem]',
    },
  },
  defaultVariants: {
    variant: 'ghost',
    tone: 'neutral',
    size: 'md',
  },
});

const selectedToggle =
  'data-[selected]:bg-primary-soft data-[selected]:text-on-primary-soft data-[selected]:data-[hovered]:bg-primary-soft-hover data-[selected]:data-[pressed]:bg-primary-soft-hover';

export const iconToggleButtonStyles = tv({
  extend: iconButtonStyles,
  base: selectedToggle,
  defaultVariants: {
    variant: 'ghost',
    tone: 'neutral',
    size: 'md',
  },
});

export type IconButtonVariant = ButtonVariant;
export type IconButtonTone = ButtonTone;
export type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type IconToggleButtonVariant = 'soft' | 'ghost';

export interface IconButtonStyleProps {
  variant?: IconButtonVariant;
  tone?: IconButtonTone;
  size?: IconButtonSize;
}

export function resolveIconButtonStyle({
  variant = 'ghost',
  tone,
  size = 'md',
}: Pick<IconButtonStyleProps, 'variant' | 'tone' | 'size'>) {
  const { tone: resolvedTone } = resolveButtonStyle({ variant, tone });
  return { variant, tone: resolvedTone, size };
}

function toggleVariantFor(variant: ButtonVariant | undefined): IconToggleButtonVariant | undefined {
  if (!variant) return undefined;
  return variant === 'solid' || variant === 'soft' ? 'soft' : 'ghost';
}

function useGroupedStyle({ variant, tone, size }: IconButtonStyleProps) {
  const group = use(ButtonGroupContext);
  return {
    ...resolveIconButtonStyle({
      variant: variant ?? group?.variant,
      tone: tone ?? group?.tone,
      size: size ?? group?.size,
    }),
    isGroupDisabled: group?.isDisabled,
  };
}

function useReducedMotionAttribute() {
  const { preference } = useMotionPreference();
  return preference === 'system' ? undefined : true;
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
  icon,
  labels,
  className,
  onPress,
  isPending: isPendingProp,
  isDisabled,
  ...props
}: IconButtonProps) {
  const { isGroupDisabled, ...style } = useGroupedStyle({ variant, tone, size });
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
      data-reduced-motion={reducedMotion}
      className={composeRenderProps(className, (className) =>
        iconButtonStyles({ ...style, className }),
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
  icon,
  className,
  isDisabled,
  ...props
}: IconButtonLinkProps) {
  const { isGroupDisabled, ...style } = useGroupedStyle({ variant, tone, size });
  const reducedMotion = useReducedMotionAttribute();

  return (
    <AriaLink
      {...props}
      isDisabled={isDisabled ?? isGroupDisabled}
      data-slot="icon-button"
      data-variant={style.variant}
      data-tone={style.tone}
      data-size={style.size}
      data-reduced-motion={reducedMotion}
      className={composeRenderProps(className, (className) =>
        iconButtonStyles({ ...style, className }),
      )}
    >
      <IconButtonContent icon={icon} />
    </AriaLink>
  );
}

export interface IconToggleButtonProps
  extends
    Omit<AriaToggleButtonProps, 'children' | 'className' | 'aria-label'>,
    Omit<IconButtonStyleProps, 'tone' | 'variant'> {
  'aria-label': string;
  icon: ReactNode;
  selectedIcon?: ReactNode;
  variant?: IconToggleButtonVariant;
  className?: AriaToggleButtonProps['className'];
  ref?: Ref<HTMLButtonElement>;
}

export function IconToggleButton({
  variant,
  size,
  icon,
  selectedIcon,
  className,
  isDisabled,
  ...props
}: IconToggleButtonProps) {
  const group = use(ButtonGroupContext);
  const reducedMotion = useReducedMotionAttribute();
  const style = {
    variant: variant ?? toggleVariantFor(group?.variant) ?? 'ghost',
    tone: 'neutral' as const,
    size: size ?? group?.size ?? 'md',
  };

  return (
    <AriaToggleButton
      {...props}
      isDisabled={isDisabled ?? group?.isDisabled}
      data-slot="icon-toggle-button"
      data-variant={style.variant}
      data-size={style.size}
      data-reduced-motion={reducedMotion}
      className={composeRenderProps(className, (className) =>
        iconToggleButtonStyles({ ...style, className }),
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
