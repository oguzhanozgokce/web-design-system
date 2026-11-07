'use client';

import type { ReactNode } from 'react';
import { Radio, RadioGroup } from 'react-aria-components';
import { useLocalStorageState } from '@/registry/ds/hooks/use-local-storage-state';
import type { PaletteStyle } from '@/registry/ds/lib/color-scheme';
import { cn } from '@/registry/ds/lib/utils';
import { DynamicTheme } from '@/registry/ds/ui/dynamic-theme';

export const previewThemes: {
  id: string;
  name: string;
  seed: string;
  paletteStyle: PaletteStyle;
}[] = [
  { id: 'indigo', name: 'Indigo', seed: '#5b4bff', paletteStyle: 'vibrant' },
  { id: 'blue', name: 'Blue', seed: '#0b57d0', paletteStyle: 'tonal-spot' },
  { id: 'teal', name: 'Teal', seed: '#0b8f6a', paletteStyle: 'tonal-spot' },
  { id: 'amber', name: 'Amber', seed: '#c98a00', paletteStyle: 'tonal-spot' },
  { id: 'coral', name: 'Coral', seed: '#e8613c', paletteStyle: 'tonal-spot' },
  { id: 'rose', name: 'Rose', seed: '#c2185b', paletteStyle: 'tonal-spot' },
  { id: 'mono', name: 'Monochrome', seed: '#5b4bff', paletteStyle: 'monochrome' },
];

export const swatchRadio =
  'focus-ring grid shrink-0 cursor-pointer place-items-center rounded-full transition-shadow duration-150 ease-out data-[hovered]:not-data-[selected]:inset-ring-2 data-[hovered]:not-data-[selected]:inset-ring-outline-variant data-[selected]:inset-ring-2 data-[selected]:inset-ring-on-surface';

export function usePreviewTheme() {
  const [id, setId] = useLocalStorageState('ds-preview-theme', 'indigo');
  const theme = previewThemes.find((item) => item.id === id) ?? previewThemes[0];
  return [theme, setId] as const;
}

export function PreviewThemeScope({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [theme] = usePreviewTheme();
  return (
    <DynamicTheme seed={theme.seed} paletteStyle={theme.paletteStyle} className={className}>
      {children}
    </DynamicTheme>
  );
}

export function PreviewThemePicker({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md';
  className?: string;
}) {
  const [theme, setTheme] = usePreviewTheme();
  const outer = size === 'sm' ? 'size-7' : 'size-9';
  const inner = size === 'sm' ? 'size-4.5' : 'size-6';

  return (
    <RadioGroup
      aria-label="Preview colour"
      orientation="horizontal"
      value={theme.id}
      onChange={setTheme}
      className={cn('flex flex-wrap items-center', size === 'sm' ? 'gap-0' : 'gap-1', className)}
    >
      {previewThemes.map((item) => (
        <Radio
          key={item.id}
          value={item.id}
          aria-label={item.name}
          data-theme-id={item.id}
          className={cn(swatchRadio, outer)}
        >
          <DynamicTheme
            seed={item.seed}
            paletteStyle={item.paletteStyle === 'monochrome' ? 'monochrome' : 'fidelity'}
            contrast="standard"
            className={cn(
              'overflow-clip rounded-full',
              item.paletteStyle === 'monochrome'
                ? 'bg-[linear-gradient(135deg,var(--primary)_50%,var(--on-primary)_50%)] inset-ring-1 inset-ring-outline-variant'
                : 'bg-primary-container',
              inner,
            )}
          />
        </Radio>
      ))}
    </RadioGroup>
  );
}
