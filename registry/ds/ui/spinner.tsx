'use client';

import type { ComponentProps } from 'react';
import { tv } from '@/registry/ds/lib/utils';
import { useMotionPreference } from '@/registry/ds/ui/ds-provider';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

export type SpinnerTone = 'current' | 'primary';

export const spinnerStyles = tv({
  base: 'shrink-0',
  variants: {
    tone: {
      current: '',
      primary: 'text-primary',
    },
    motion: {
      full: 'animate-ds-spin motion-reduce:animate-[ds-spin_1.5s_linear_infinite]',
      reduced: 'animate-[ds-spin_1.5s_linear_infinite]',
      none: '',
    },
  },
  defaultVariants: {
    tone: 'current',
    motion: 'full',
  },
});

const presets: Record<SpinnerSize, { size: number; stroke: number }> = {
  sm: { size: 16, stroke: 2 },
  md: { size: 24, stroke: 2.5 },
  lg: { size: 32, stroke: 3 },
  xl: { size: 40, stroke: 3.5 },
};

const viewBox = 24;
const customStroke = 3;

function isPreset(size: SpinnerProps['size']): size is SpinnerSize {
  return typeof size === 'string' && size in presets;
}

export interface SpinnerProps extends ComponentProps<'svg'> {
  size?: SpinnerSize | number | string;
  tone?: SpinnerTone;
}

export function Spinner({ size = '1em', tone = 'current', className, ...props }: SpinnerProps) {
  const { spatialEnabled, effectsEnabled } = useMotionPreference();
  const motion = spatialEnabled ? 'full' : effectsEnabled ? 'reduced' : 'none';
  const preset = isPreset(size) ? presets[size] : null;
  const box = preset ? preset.size : size;
  const stroke = preset ? (preset.stroke * viewBox) / preset.size : customStroke;
  const radius = viewBox / 2 - 1 - stroke / 2;
  const centre = viewBox / 2;

  return (
    <svg
      viewBox={`0 0 ${viewBox} ${viewBox}`}
      width={box}
      height={box}
      fill="none"
      aria-hidden="true"
      focusable="false"
      data-slot="spinner"
      data-size={preset ? size : undefined}
      data-tone={tone}
      className={spinnerStyles({ tone, motion, className })}
      {...props}
    >
      <circle
        data-slot="track"
        cx={centre}
        cy={centre}
        r={radius}
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth={stroke}
      />
      <path
        data-slot="arc"
        d={`M${centre + radius} ${centre}A${radius} ${radius} 0 0 0 ${centre} ${centre - radius}`}
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    </svg>
  );
}
