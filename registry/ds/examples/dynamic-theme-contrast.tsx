import type { ContrastLevel } from '@/registry/ds/lib/color-scheme';
import { Button } from '@/registry/ds/ui/button';
import { DynamicTheme } from '@/registry/ds/ui/dynamic-theme';

const seed = '#C98A00';
const levels: ContrastLevel[] = ['standard', 'medium', 'high'];

export default function DynamicThemeContrast() {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-3">
      {levels.map((contrast) => (
        <DynamicTheme
          key={contrast}
          seed={seed}
          contrast={contrast}
          className="flex flex-col gap-3 rounded-container border border-outline-subtle bg-surface-raised p-4 text-on-surface"
        >
          <p className="text-sm font-medium">{contrast}</p>
          <p className="text-xs text-on-surface-variant">Supporting text and outlines</p>
          <div className="flex gap-2">
            <Button size="sm">Save</Button>
            <Button size="sm" variant="outline">
              Cancel
            </Button>
          </div>
        </DynamicTheme>
      ))}
    </div>
  );
}
