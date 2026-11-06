'use client';

import { use, useMemo, type ReactNode } from 'react';
import {
  ToggleButton as AriaToggleButton,
  ToggleButtonGroup as AriaToggleButtonGroup,
  composeRenderProps,
  type ToggleButtonGroupProps as AriaToggleButtonGroupProps,
  type ToggleButtonProps as AriaToggleButtonProps,
} from 'react-aria-components';
import { tv, type VariantProps } from '@/registry/ds/lib/utils';
import { ButtonGroupContext, type ButtonStyleProps } from '@/registry/ds/ui/button';
import { buttonGroupStyles, type ButtonGroupStyleProps } from '@/registry/ds/ui/button-group';
import { useMotionPreference } from '@/registry/ds/ui/ds-provider';

export const toggleButtonStyles = tv({
  base: [
    'state-layer focus-ring group/toggle-button relative inline-flex shrink-0 cursor-default items-center justify-center font-medium whitespace-nowrap no-underline select-none',
    'rounded-[var(--toggle-pressed-radius,var(--toggle-selected-radius,var(--toggle-rest-radius)))]',
    'data-[pressed]:[--toggle-pressed-radius:var(--toggle-pressed)]',
    '[transition:background-color_150ms_var(--ease-standard),color_150ms_var(--ease-standard),border-color_150ms_var(--ease-standard),box-shadow_150ms_var(--ease-standard),border-radius_var(--button-morph-duration,var(--ds-duration-spatial))_var(--ds-ease-spatial)]',
    'motion-reduce:[--button-morph-duration:0ms]',
    'data-[disabled]:text-on-surface/38 data-[disabled]:shadow-none',
  ],
  variants: {
    variant: {
      filled: [
        'bg-surface-container text-on-surface-variant data-[disabled]:bg-on-surface/12',
        'data-[selected]:not-data-[disabled]:bg-primary data-[selected]:not-data-[disabled]:text-on-primary',
      ],
      tonal: [
        'bg-secondary-container text-on-secondary-container data-[disabled]:bg-on-surface/12',
        'data-[selected]:not-data-[disabled]:bg-secondary data-[selected]:not-data-[disabled]:text-on-secondary',
      ],
      outlined: [
        'border border-outline-variant bg-transparent text-on-surface-variant data-[disabled]:border-on-surface/12',
        'data-[selected]:not-data-[disabled]:border-transparent data-[selected]:not-data-[disabled]:bg-inverse-surface data-[selected]:not-data-[disabled]:text-inverse-on-surface',
        'data-[selected]:data-[disabled]:bg-on-surface/12',
      ],
      elevated: [
        'bg-surface-container-low text-primary shadow-elevation-1 data-[disabled]:bg-on-surface/12 data-[hovered]:shadow-elevation-2',
        'data-[selected]:not-data-[disabled]:bg-primary data-[selected]:not-data-[disabled]:text-on-primary',
      ],
    },
    size: {
      xs: 'h-7 gap-1 px-3 text-label-md [--icon-size:1rem] [--toggle-pressed:var(--radius-xs)] [--toggle-round:0.875rem] [--toggle-square:var(--radius-sm)]',
      sm: 'h-8 gap-1.5 px-3.5 text-label-lg [--icon-size:1.125rem] [--toggle-pressed:var(--radius-sm)] [--toggle-round:1rem] [--toggle-square:var(--radius-md)]',
      md: 'h-10 gap-2 px-5 text-label-lg [--icon-size:1.25rem] [--toggle-pressed:var(--radius-sm)] [--toggle-round:1.25rem] [--toggle-square:var(--radius-md)]',
      lg: 'h-12 gap-2 px-6 text-title-md [--icon-size:1.375rem] [--toggle-pressed:var(--radius-sm)] [--toggle-round:1.5rem] [--toggle-square:var(--radius-md)]',
      xl: 'h-14 gap-2.5 px-8 text-title-lg [--icon-size:1.5rem] [--toggle-pressed:var(--radius-md)] [--toggle-round:1.75rem] [--toggle-square:var(--radius-lg)]',
    },
    shape: {
      round:
        '[--toggle-rest-radius:var(--toggle-round)] data-[selected]:[--toggle-selected-radius:var(--toggle-square)]',
      square:
        '[--toggle-rest-radius:var(--toggle-square)] data-[selected]:[--toggle-selected-radius:var(--toggle-round)]',
    },
    fullWidth: {
      true: 'w-full',
    },
    morph: {
      true: '',
      false: '[--button-morph-duration:0ms]',
    },
  },
  defaultVariants: {
    variant: 'filled',
    size: 'md',
    shape: 'round',
    morph: true,
  },
});

export type ToggleButtonStyleProps = Omit<VariantProps<typeof toggleButtonStyles>, 'morph'>;

type ToggleButtonVariant = NonNullable<ToggleButtonStyleProps['variant']>;

const toggleVariants = new Set<string>(['filled', 'tonal', 'outlined', 'elevated']);

function asToggleVariant(variant: ButtonStyleProps['variant']): ToggleButtonVariant | undefined {
  return variant && toggleVariants.has(variant) ? (variant as ToggleButtonVariant) : undefined;
}

const iconSlot =
  'inline-flex shrink-0 items-center justify-center text-(length:--icon-size) [&_svg]:size-[1em]';

export interface ToggleButtonProps
  extends Omit<AriaToggleButtonProps, 'children' | 'className'>, ToggleButtonStyleProps {
  startIcon?: ReactNode;
  selectedIcon?: ReactNode;
  endIcon?: ReactNode;
  children?: ReactNode;
  className?: AriaToggleButtonProps['className'];
}

export function ToggleButton({
  variant,
  size,
  shape,
  fullWidth,
  startIcon,
  selectedIcon,
  endIcon,
  children,
  className,
  isDisabled,
  ...props
}: ToggleButtonProps) {
  const group = use(ButtonGroupContext);
  const { spatialEnabled } = useMotionPreference();
  const style = {
    variant: variant ?? asToggleVariant(group?.variant) ?? 'filled',
    size: size ?? group?.size ?? 'md',
    shape: shape ?? 'round',
  };

  return (
    <AriaToggleButton
      {...props}
      isDisabled={isDisabled ?? group?.isDisabled}
      data-slot="toggle-button"
      data-variant={style.variant}
      data-size={style.size}
      data-shape={style.shape}
      className={composeRenderProps(className, (className) =>
        toggleButtonStyles({ ...style, fullWidth, morph: spatialEnabled, className }),
      )}
    >
      {({ isSelected }) => {
        const leading = isSelected && selectedIcon ? selectedIcon : startIcon;
        return (
          <>
            {leading ? (
              <span data-slot="start-icon" className={iconSlot}>
                {leading}
              </span>
            ) : null}
            {children != null ? <span data-slot="label">{children}</span> : null}
            {endIcon ? (
              <span data-slot="end-icon" className={iconSlot}>
                {endIcon}
              </span>
            ) : null}
          </>
        );
      }}
    </AriaToggleButton>
  );
}

export interface ToggleButtonGroupProps
  extends
    Omit<AriaToggleButtonGroupProps, 'className'>,
    Omit<ButtonGroupStyleProps, 'orientation'> {
  buttonVariant?: ToggleButtonVariant;
  className?: AriaToggleButtonGroupProps['className'];
}

export function ToggleButtonGroup({
  variant = 'connected',
  size,
  fullWidth,
  buttonVariant,
  orientation = 'horizontal',
  isDisabled,
  className,
  ...props
}: ToggleButtonGroupProps) {
  const outer = use(ButtonGroupContext);
  const { spatialEnabled } = useMotionPreference();
  const groupSize = size ?? outer?.size;
  const groupVariant = buttonVariant ?? asToggleVariant(outer?.variant);
  const groupDisabled = isDisabled ?? outer?.isDisabled;
  const context = useMemo(
    () => ({ size: groupSize, variant: groupVariant, isDisabled: groupDisabled }),
    [groupSize, groupVariant, groupDisabled],
  );

  return (
    <ButtonGroupContext value={context}>
      <AriaToggleButtonGroup
        {...props}
        isDisabled={groupDisabled}
        orientation={orientation}
        data-slot="toggle-button-group"
        data-variant={variant}
        data-size={groupSize ?? 'md'}
        className={composeRenderProps(className, (className) =>
          buttonGroupStyles({
            variant,
            orientation,
            size: groupSize,
            fullWidth,
            morph: spatialEnabled,
            className,
          }),
        )}
      />
    </ButtonGroupContext>
  );
}
