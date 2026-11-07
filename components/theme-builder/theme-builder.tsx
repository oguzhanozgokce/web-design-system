'use client';

import { memo, useId, useMemo, useState } from 'react';
import type { ContrastLevel, PaletteStyle } from '@/registry/ds/lib/color-scheme';
import { parseSeed } from '@/registry/ds/lib/dynamic-color';
import { AdminPreview } from '@/components/theme-builder/admin-preview';
import { RoleSwatches } from '@/components/theme-builder/role-swatches';
import { ThemeControls } from '@/components/theme-builder/theme-controls';
import { ThemeExport } from '@/components/theme-builder/theme-export';
import {
  configJson,
  contrastName,
  defaultSettings,
  formatSeed,
  paletteStyleName,
  schemeStyle,
  tokensCss,
  type SchemeSet,
} from '@/components/theme-builder/theme-model';
import { useThemePalette } from '@/components/theme-builder/use-theme-palette';

const Preview = memo(AdminPreview);
const Swatches = memo(RoleSwatches);
const Export = memo(ThemeExport);

export function ThemeBuilder({ initialSchemes }: { initialSchemes: SchemeSet }) {
  const [seed, setSeed] = useState(defaultSettings.seed);
  const [seedText, setSeedText] = useState(formatSeed(defaultSettings.seed));
  const [style, setStyle] = useState<PaletteStyle>(defaultSettings.style);
  const [contrast, setContrast] = useState<ContrastLevel>(defaultSettings.contrast);
  const [isDark, setDark] = useState(defaultSettings.mode === 'dark');
  const previewId = useId();
  const rolesId = useId();

  const { palette, hasError, isUpdating } = useThemePalette({ seed, style }, initialSchemes);
  const { schemes } = palette;
  const exportFiles = useMemo(
    () => ({
      css: tokensCss(schemes),
      config: configJson(palette.seed, palette.style),
    }),
    [schemes, palette.seed, palette.style],
  );

  const mode = isDark ? 'dark' : 'light';
  const colors = schemes[mode][contrast];
  const themeStyle = useMemo(() => schemeStyle(colors, mode), [colors, mode]);
  const isSeedValid = parseSeed(seedText) !== null;
  const isDefault =
    seed === defaultSettings.seed &&
    isSeedValid &&
    style === defaultSettings.style &&
    contrast === defaultSettings.contrast &&
    mode === defaultSettings.mode;
  const summary = `${formatSeed(palette.seed)} · ${paletteStyleName(palette.style)} · ${contrastName(contrast)} contrast · ${isDark ? 'Dark' : 'Light'}`;

  function changeSeedText(text: string) {
    setSeedText(text);
    const parsed = parseSeed(text);
    if (parsed) setSeed(parsed);
  }

  function commitSeedText() {
    const parsed = parseSeed(seedText);
    if (parsed) setSeedText(formatSeed(parsed));
  }

  function pickSeed(value: string) {
    const parsed = parseSeed(value);
    if (!parsed) return;
    setSeed(parsed);
    setSeedText(formatSeed(parsed));
  }

  function reset() {
    setSeed(defaultSettings.seed);
    setSeedText(formatSeed(defaultSettings.seed));
    setStyle(defaultSettings.style);
    setContrast(defaultSettings.contrast);
    setDark(defaultSettings.mode === 'dark');
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:py-14">
      <header className="flex max-w-3xl flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">
          Theme builder
        </h1>
        <p className="text-base text-pretty text-on-surface-variant sm:text-lg">
          Pick a seed colour and a palette style, check the scheme on a working admin screen in
          light and dark, then copy the tokens. It runs the same engine as{' '}
          <code className="font-mono text-[0.9em] text-on-surface">npm run generate</code>.
        </p>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <ThemeControls
          seed={seed}
          seedText={seedText}
          isSeedValid={isSeedValid}
          style={style}
          contrast={contrast}
          isDark={isDark}
          isDefault={isDefault}
          onSeedPick={pickSeed}
          onSeedTextChange={changeSeedText}
          onSeedTextCommit={commitSeedText}
          onStyleChange={setStyle}
          onContrastChange={setContrast}
          onDarkChange={setDark}
          onReset={reset}
          className="lg:sticky lg:top-20"
        />

        <div className="flex min-w-0 flex-col gap-10">
          <section aria-labelledby={previewId} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 id={previewId} className="text-lg font-semibold text-on-surface">
                Preview
              </h2>
              <p role="status" className="text-sm text-on-surface-variant">
                {isUpdating && !hasError ? 'Updating palette…' : summary}
              </p>
            </div>
            {hasError ? (
              <p role="alert" className="text-sm text-error">
                Could not generate this palette. Reload the page to try again.
              </p>
            ) : null}
            <div
              data-slot="theme-preview"
              aria-busy={isUpdating}
              data-theme={mode}
              style={themeStyle}
              className="overflow-hidden rounded-container border border-outline-subtle bg-canvas text-on-surface"
            >
              <Preview />
            </div>
          </section>

          <section aria-labelledby={rolesId} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h2 id={rolesId} className="text-lg font-semibold text-on-surface">
                Colour roles
              </h2>
              <p className="max-w-prose text-sm text-on-surface-variant">
                All {Object.keys(colors).length} roles for this mode and contrast level. Text on a
                role uses its on-colour; that pairing is what keeps every seed readable.
              </p>
            </div>
            <div
              data-slot="theme-roles"
              data-theme={mode}
              style={themeStyle}
              className="overflow-hidden rounded-container border border-outline-subtle bg-canvas text-on-surface"
            >
              <Swatches colors={colors} />
            </div>
          </section>

          <Export css={exportFiles.css} config={exportFiles.config} isPending={isUpdating} />
        </div>
      </div>
    </div>
  );
}
