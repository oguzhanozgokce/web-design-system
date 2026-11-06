import type { ColorMode } from '@/registry/ds/lib/color-scheme';
import { Button } from '@/registry/ds/ui/button';
import { DynamicTheme } from '@/registry/ds/ui/dynamic-theme';

const seed = '#C2185B';
const modes: ColorMode[] = ['light', 'dark'];

export default function DynamicThemeMode() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      {modes.map((mode) => (
        <DynamicTheme
          key={mode}
          seed={seed}
          mode={mode}
          paletteStyle="expressive"
          className="flex flex-col gap-3 rounded-xl bg-surface-container-high p-5 text-on-surface"
        >
          <p className="text-label-md text-primary uppercase">Always {mode}</p>
          <p className="text-title-lg">New features are here</p>
          <p className="text-body-md text-on-surface-variant">
            Dark mode, keyboard shortcuts and faster search.
          </p>
          <Button className="self-start">Learn more</Button>
        </DynamicTheme>
      ))}
    </div>
  );
}
