'use client';

import { useId, useRef, type ChangeEvent } from 'react';
import type { ContrastLevel, PaletteStyle } from '@/registry/ds/lib/color-scheme';
import { UndoIcon } from '@/registry/ds/lib/icons';
import { cn } from '@/registry/ds/lib/utils';
import { Button } from '@/registry/ds/ui/button';
import { ListBoxItem } from '@/registry/ds/ui/list-box';
import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';
import { Select } from '@/registry/ds/ui/select';
import { Switch } from '@/registry/ds/ui/switch';
import { TextField } from '@/registry/ds/ui/text-field';
import {
  contrastOptions,
  isContrastLevel,
  isPaletteStyle,
  paletteStyleOptions,
} from '@/components/theme-builder/theme-model';

export interface ThemeControlsProps {
  seed: string;
  seedText: string;
  isSeedValid: boolean;
  style: PaletteStyle;
  contrast: ContrastLevel;
  isDark: boolean;
  isDefault: boolean;
  onSeedPick: (seed: string) => void;
  onSeedTextChange: (text: string) => void;
  onSeedTextCommit: () => void;
  onStyleChange: (style: PaletteStyle) => void;
  onContrastChange: (contrast: ContrastLevel) => void;
  onDarkChange: (isDark: boolean) => void;
  onReset: () => void;
  className?: string;
}

function SeedPicker({ seed, onPick }: { seed: string; onPick: (seed: string) => void }) {
  return (
    <input
      type="color"
      aria-label="Pick the seed colour"
      value={seed}
      onChange={(event: ChangeEvent<HTMLInputElement>) => onPick(event.target.value)}
      className={cn(
        'ms-2 block size-6 shrink-0 cursor-pointer appearance-none rounded-full border border-outline-variant bg-transparent p-0 focus-ring transition-transform duration-150 ease-out hover:scale-110 motion-reduce:transition-none',
        '[&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0',
        '[&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-0',
      )}
    />
  );
}

export function ThemeControls({
  seed,
  seedText,
  isSeedValid,
  style,
  contrast,
  isDark,
  isDefault,
  onSeedPick,
  onSeedTextChange,
  onSeedTextCommit,
  onStyleChange,
  onContrastChange,
  onDarkChange,
  onReset,
  className,
}: ThemeControlsProps) {
  const headingId = useId();
  const contrastLabelId = useId();
  const contrastHintId = useId();
  const seedInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    onReset();
    seedInputRef.current?.focus();
  }

  return (
    <section
      aria-labelledby={headingId}
      data-slot="theme-controls"
      className={cn(
        'flex flex-col gap-6 rounded-container border border-outline-subtle bg-surface-raised p-4 sm:p-5',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id={headingId} className="text-lg font-semibold text-on-surface">
          Scheme
        </h2>
        <Button
          variant="ghost"
          size="sm"
          startIcon={<UndoIcon className="rtl:-scale-x-100" />}
          isDisabled={isDefault}
          onPress={reset}
        >
          Reset
        </Button>
      </div>

      <TextField
        label="Seed colour"
        value={seedText}
        onChange={onSeedTextChange}
        onBlur={onSeedTextCommit}
        isInvalid={!isSeedValid}
        errorMessage="Enter 3 or 6 hex digits, with or without the leading #."
        description="Generates the accent colours. Surfaces stay neutral."
        autoComplete="off"
        spellCheck="false"
        inputRef={seedInputRef}
        endAdornment={<SeedPicker seed={seed} onPick={onSeedPick} />}
      />

      <Select
        label="Palette style"
        items={paletteStyleOptions}
        value={style}
        onChange={(key) => {
          if (isPaletteStyle(key)) onStyleChange(key);
        }}
      >
        {(option) => <ListBoxItem description={option.description}>{option.name}</ListBoxItem>}
      </Select>

      <div className="flex flex-col gap-1.5">
        <span id={contrastLabelId} className="text-sm font-medium text-on-surface">
          Contrast
        </span>
        <SegmentedControl
          aria-labelledby={contrastLabelId}
          aria-describedby={contrastHintId}
          fullWidth
          selectedKeys={[contrast]}
          onSelectionChange={(keys) => {
            const [next] = keys;
            if (isContrastLevel(next)) onContrastChange(next);
          }}
        >
          {contrastOptions.map((option) => (
            <SegmentedControlItem key={option.id} id={option.id}>
              {option.name}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
        <p id={contrastHintId} className="text-xs text-on-surface-variant">
          Changes the preview. The exported tokens carry all three levels.
        </p>
      </div>

      <Switch
        isSelected={isDark}
        onChange={onDarkChange}
        description="The rest of the page keeps its own theme."
      >
        Dark preview
      </Switch>
    </section>
  );
}
