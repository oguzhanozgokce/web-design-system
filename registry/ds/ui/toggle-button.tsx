'use client';

import { use, useMemo, type ReactNode } from 'react';
import {
  ToggleButton as AriaToggleButton,
  ToggleButtonGroup as AriaToggleButtonGroup,
  composeRenderProps,
  type ToggleButtonGroupProps as AriaToggleButtonGroupProps,
  type ToggleButtonProps as AriaToggleButtonProps,
} from 'react-aria-components';
import { tv } from '@/registry/ds/lib/utils';
import {
  ButtonGroupContext,
  buttonStyles,
  type ButtonSize,
  type ButtonVariant,
} from '@/registry/ds/ui/button';
import { buttonGroupStyles, type ButtonGroupStyleProps } from '@/registry/ds/ui/button-group';

export const toggleButtonStyles = tv({
  extend: buttonStyles,
  base: 'data-[selected]:bg-primary-soft data-[selected]:text-on-primary-soft data-[selected]:data-[hovered]:bg-primary-soft-hover data-[selected]:data-[pressed]:bg-primary-soft-hover',
  defaultVariants: {
    variant: 'soft',
    tone: 'neutral',
    size: 'md',
  },
});

export type ToggleButtonVariant = 'soft' | 'ghost';

function toggleVariantFor(variant: ButtonVariant | undefined): ToggleButtonVariant | undefined {
  if (!variant) return undefined;
  return variant === 'solid' || variant === 'soft' ? 'soft' : 'ghost';
}

const iconSlot =
  'inline-flex shrink-0 items-center justify-center text-(length:--icon-size) [&_svg]:size-[1em]';

export interface ToggleButtonStyleProps {
  variant?: ToggleButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

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
  const style = {
    variant: variant ?? toggleVariantFor(group?.variant) ?? 'soft',
    tone: 'neutral' as const,
    size: size ?? group?.size ?? 'md',
  };

  return (
    <AriaToggleButton
      {...props}
      isDisabled={isDisabled ?? group?.isDisabled}
      data-slot="toggle-button"
      data-variant={style.variant}
      data-size={style.size}
      className={composeRenderProps(className, (className) =>
        toggleButtonStyles({ ...style, fullWidth, className }),
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
            {children != null ? (
              <span
                data-slot="label"
                className="grid justify-items-center *:col-start-1 *:row-start-1"
              >
                <span className={isSelected ? 'font-semibold' : undefined}>{children}</span>
                <span aria-hidden="true" className="invisible font-semibold">
                  {children}
                </span>
              </span>
            ) : null}
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
  variant,
  size,
  fullWidth,
  buttonVariant,
  orientation = 'horizontal',
  isDisabled,
  className,
  ...props
}: ToggleButtonGroupProps) {
  const outer = use(ButtonGroupContext);
  const groupSize = size ?? outer?.size;
  const groupVariant = buttonVariant ?? toggleVariantFor(outer?.variant);
  const groupDisabled = isDisabled ?? outer?.isDisabled;
  const resolvedVariant = variant ?? 'attached';
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
        data-variant={resolvedVariant}
        data-size={groupSize ?? 'md'}
        className={composeRenderProps(className, (className) =>
          buttonGroupStyles({
            variant: resolvedVariant,
            orientation,
            size: groupSize,
            fullWidth,
            className: resolvedVariant === 'detached' ? ['gap-1', className] : className,
          }),
        )}
      />
    </ButtonGroupContext>
  );
}
