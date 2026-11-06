'use client';

import type { ComponentProps } from 'react';
import { tv } from '@/registry/ds/lib/utils';
import { useMotionPreference } from '@/registry/ds/ui/ds-provider';

export const spinnerStyles = tv({
  base: 'shrink-0',
  variants: {
    motion: {
      full: 'animate-ds-spin motion-reduce:animate-[ds-spin_2.4s_linear_infinite]',
      reduced: 'animate-[ds-spin_2.4s_linear_infinite]',
      none: '',
    },
  },
  defaultVariants: {
    motion: 'full',
  },
});

export interface SpinnerProps extends ComponentProps<'svg'> {
  size?: number | string;
}

export function Spinner({ size = '1em', className, ...props }: SpinnerProps) {
  const { spatialEnabled, effectsEnabled } = useMotionPreference();
  const motion = spatialEnabled ? 'full' : effectsEnabled ? 'reduced' : 'none';

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      focusable="false"
      data-slot="spinner"
      className={spinnerStyles({ motion, className })}
      {...props}
    >
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeOpacity="0.24" strokeWidth="3" />
      <path
        d="M21.5 12A9.5 9.5 0 0 0 12 2.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
