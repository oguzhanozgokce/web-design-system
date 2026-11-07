'use client';

import { use, useMemo } from 'react';
import { Group, composeRenderProps, type GroupProps } from 'react-aria-components';
import { tv } from '@/registry/ds/lib/utils';
import {
  ButtonGroupContext,
  type ButtonSize,
  type ButtonTone,
  type ButtonVariant,
} from '@/registry/ds/ui/button';

export const buttonGroupStyles = tv({
  base: 'max-w-full',
  variants: {
    variant: {
      attached: [
        'isolate gap-0',
        '[&>[data-slot]]:rounded-none [&>[data-slot][data-pressed]]:scale-100 [&>[data-slot][data-focus-visible]]:z-10',
        '[&>[data-slot]:not(:first-child)]:before:pointer-events-none [&>[data-slot]:not(:first-child)]:before:absolute [&>[data-slot]:not(:first-child)]:before:rounded-full [&>[data-slot]:not(:first-child)]:before:bg-current [&>[data-slot]:not(:first-child)]:before:opacity-15',
        '[&>[data-variant=outline]]:before:hidden [&>[data-variant=outline]+[data-slot]]:before:hidden',
        '[&>[data-selected]]:before:hidden [&>[data-selected]+[data-slot]]:before:hidden',
      ],
      detached: 'gap-2',
    },
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col items-stretch',
    },
    size: {
      sm: '[--button-group-radius:1rem]',
      md: '[--button-group-radius:1.25rem]',
      lg: '[--button-group-radius:1.5rem]',
    },
    fullWidth: {
      true: 'flex w-full [&>[data-slot]]:min-w-0 [&>[data-slot]]:flex-1',
      false: 'inline-flex',
    },
  },
  compoundVariants: [
    { variant: 'detached', orientation: 'horizontal', class: 'flex-wrap items-center' },
    {
      variant: 'attached',
      orientation: 'horizontal',
      class: [
        'items-center',
        '[&>[data-slot]:first-child]:rounded-s-control [&>[data-slot]:last-child]:rounded-e-control',
        '[&>[data-slot]:not(:first-child)]:before:inset-s-[-1px] [&>[data-slot]:not(:first-child)]:before:top-1/4 [&>[data-slot]:not(:first-child)]:before:h-1/2 [&>[data-slot]:not(:first-child)]:before:w-px',
        '[&>[data-variant=outline]:not(:first-child)]:-ms-px',
      ],
    },
    {
      variant: 'attached',
      orientation: 'vertical',
      class: [
        '[&>[data-slot]:first-child]:rounded-t-(--button-group-radius) [&>[data-slot]:last-child]:rounded-b-(--button-group-radius)',
        '[&>[data-slot]:not(:first-child)]:before:inset-s-1/4 [&>[data-slot]:not(:first-child)]:before:top-[-1px] [&>[data-slot]:not(:first-child)]:before:h-px [&>[data-slot]:not(:first-child)]:before:w-1/2',
        '[&>[data-variant=outline]:not(:first-child)]:-mt-px',
      ],
    },
  ],
  defaultVariants: {
    variant: 'attached',
    orientation: 'horizontal',
    size: 'md',
    fullWidth: false,
  },
});

export type ButtonGroupVariant = 'attached' | 'detached';
export type ButtonGroupOrientation = 'horizontal' | 'vertical';

export interface ButtonGroupStyleProps {
  variant?: ButtonGroupVariant;
  orientation?: ButtonGroupOrientation;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export interface ButtonGroupProps extends Omit<GroupProps, 'className'>, ButtonGroupStyleProps {
  buttonVariant?: ButtonVariant;
  tone?: ButtonTone;
  className?: GroupProps['className'];
}

export function ButtonGroup({
  variant,
  orientation,
  size,
  fullWidth,
  buttonVariant,
  tone,
  isDisabled,
  className,
  ...props
}: ButtonGroupProps) {
  const outer = use(ButtonGroupContext);
  const groupSize = size ?? outer?.size;
  const groupVariant = buttonVariant ?? outer?.variant;
  const groupTone = tone ?? outer?.tone;
  const groupDisabled = isDisabled ?? outer?.isDisabled;
  const resolvedVariant = variant ?? 'attached';
  const context = useMemo(
    () => ({ size: groupSize, variant: groupVariant, tone: groupTone, isDisabled: groupDisabled }),
    [groupSize, groupVariant, groupTone, groupDisabled],
  );

  return (
    <ButtonGroupContext value={context}>
      <Group
        {...props}
        isDisabled={groupDisabled}
        data-slot="button-group"
        data-variant={resolvedVariant}
        data-orientation={orientation ?? 'horizontal'}
        data-size={groupSize ?? 'md'}
        className={composeRenderProps(className, (className) =>
          buttonGroupStyles({
            variant: resolvedVariant,
            orientation,
            size: groupSize,
            fullWidth,
            className,
          }),
        )}
      />
    </ButtonGroupContext>
  );
}
