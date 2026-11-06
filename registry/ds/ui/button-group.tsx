'use client';

import { use, useMemo } from 'react';
import { Group, composeRenderProps, type GroupProps } from 'react-aria-components';
import { tv, type VariantProps } from '@/registry/ds/lib/utils';
import { ButtonGroupContext, type ButtonStyleProps } from '@/registry/ds/ui/button';
import { useMotionPreference } from '@/registry/ds/ui/ds-provider';

export const buttonGroupStyles = tv({
  base: 'max-w-full motion-reduce:[--button-morph-duration:0ms]',
  variants: {
    variant: {
      standard: 'items-center gap-2',
      connected: [
        'gap-0.5 [--button-group-inner:var(--radius-xs)]',
        '[&>[data-slot]]:rounded-(--button-group-inner)',
        '[&>[data-slot][data-pressed]]:rounded-(--button-group-round) [&>[data-slot][data-selected]]:rounded-(--button-group-round)',
        '[&>[data-slot][data-pressed]]:scale-100 [&>[data-slot][data-focus-visible]]:z-10',
        '[&>[data-slot]]:[transition:background-color_150ms_var(--ease-standard),color_150ms_var(--ease-standard),border-color_150ms_var(--ease-standard),box-shadow_150ms_var(--ease-standard),border-radius_var(--button-morph-duration,var(--ds-duration-spatial))_var(--ds-ease-spatial)]',
      ],
    },
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col items-stretch',
    },
    size: {
      xs: '[--button-group-round:0.875rem]',
      sm: '[--button-group-round:1rem]',
      md: '[--button-group-round:1.25rem]',
      lg: '[--button-group-round:1.5rem]',
      xl: '[--button-group-round:1.75rem]',
    },
    fullWidth: {
      true: 'flex w-full [&>[data-slot]]:min-w-0 [&>[data-slot]]:flex-1',
      false: 'inline-flex',
    },
    morph: {
      true: '',
      false: '[--button-morph-duration:0ms]',
    },
  },
  compoundVariants: [
    { variant: 'standard', orientation: 'horizontal', class: 'flex-wrap' },
    { variant: 'connected', orientation: 'horizontal', class: 'items-center' },
    {
      variant: 'connected',
      orientation: 'horizontal',
      class:
        '[&>[data-slot]:first-child]:rounded-s-(--button-group-round) [&>[data-slot]:last-child]:rounded-e-(--button-group-round)',
    },
    {
      variant: 'connected',
      orientation: 'vertical',
      class:
        '[&>[data-slot]:first-child]:rounded-t-(--button-group-round) [&>[data-slot]:last-child]:rounded-b-(--button-group-round)',
    },
  ],
  defaultVariants: {
    variant: 'standard',
    orientation: 'horizontal',
    size: 'md',
    fullWidth: false,
    morph: true,
  },
});

export type ButtonGroupStyleProps = Omit<VariantProps<typeof buttonGroupStyles>, 'morph'>;

export interface ButtonGroupProps extends Omit<GroupProps, 'className'>, ButtonGroupStyleProps {
  buttonVariant?: ButtonStyleProps['variant'];
  tone?: ButtonStyleProps['tone'];
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
  const { spatialEnabled } = useMotionPreference();
  const groupSize = size ?? outer?.size;
  const groupVariant = buttonVariant ?? outer?.variant;
  const groupTone = tone ?? outer?.tone;
  const groupDisabled = isDisabled ?? outer?.isDisabled;
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
        data-variant={variant ?? 'standard'}
        data-orientation={orientation ?? 'horizontal'}
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
