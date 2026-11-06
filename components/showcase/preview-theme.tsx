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

export function PreviewThemePicker({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const [theme, setTheme] = usePreviewTheme();
  const outer = size === 'sm' ? 'size-7' : 'size-9';
  const inner = size === 'sm' ? 'size-5' : 'size-7';

  return (
    <RadioGroup
      aria-label="Preview colour"
      orientation="horizontal"
      value={theme.id}
      onChange={setTheme}
      className="flex flex-wrap items-center gap-1.5"
    >
      {previewThemes.map((item) => (
        <Radio
          key={item.id}
          value={item.id}
          aria-label={item.name}
          className={cn(
            'grid cursor-pointer place-items-center rounded-full focus-ring outline-offset-2',
            'data-[selected]:ring-2 data-[selected]:ring-on-surface data-[selected]:ring-offset-2 data-[selected]:ring-offset-surface',
            outer,
          )}
        >
          <DynamicTheme
            seed={item.seed}
            paletteStyle={item.paletteStyle === 'monochrome' ? 'monochrome' : 'fidelity'}
            contrast="standard"
            className={cn(
              'overflow-clip rounded-full',
              item.paletteStyle === 'monochrome'
                ? 'bg-[linear-gradient(135deg,var(--primary)_50%,var(--on-primary)_50%)] ring-1 ring-outline-variant'
                : 'bg-primary-container',
              inner,
            )}
          />
        </Radio>
      ))}
    </RadioGroup>
  );
}
