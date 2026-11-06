import type { PaletteStyle } from '@/registry/ds/lib/color-scheme';
import { DynamicTheme } from '@/registry/ds/ui/dynamic-theme';

const seed = '#0B8F6A';
const styles: PaletteStyle[] = [
  'tonal-spot',
  'vibrant',
  'expressive',
  'fidelity',
  'neutral',
  'monochrome',
];

export default function DynamicThemeStyles() {
  return (
    <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
      {styles.map((paletteStyle) => (
        <DynamicTheme
          key={paletteStyle}
          seed={seed}
          paletteStyle={paletteStyle}
          className="flex flex-col gap-2 rounded-lg bg-surface-container p-3 text-on-surface"
        >
          <p className="text-label-lg">{paletteStyle}</p>
          <div className="flex gap-1" aria-hidden>
            <span className="h-8 flex-1 rounded-s-sm bg-primary" />
            <span className="h-8 flex-1 bg-secondary" />
            <span className="h-8 flex-1 rounded-e-sm bg-tertiary" />
          </div>
          <span className="self-start rounded-full bg-primary-container px-3 py-1 text-label-md text-on-primary-container">
            Container
          </span>
        </DynamicTheme>
      ))}
    </div>
  );
}
