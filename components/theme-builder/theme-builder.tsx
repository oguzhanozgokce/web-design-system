'use client';

import { useDeferredValue, useId, useMemo, useState } from 'react';
import type { ContrastLevel, PaletteStyle } from '@/registry/ds/lib/color-scheme';
import { parseSeed } from '@/registry/ds/lib/dynamic-color';
import { AdminPreview } from '@/components/theme-builder/admin-preview';
import { RoleSwatches } from '@/components/theme-builder/role-swatches';
import { ThemeControls } from '@/components/theme-builder/theme-controls';
import { ThemeExport } from '@/components/theme-builder/theme-export';
import {
  buildSchemes,
  configJson,
  contrastName,
  defaultSettings,
  formatSeed,
  paletteStyleName,
  schemeStyle,
  tokensCss,
} from '@/components/theme-builder/theme-model';

export function ThemeBuilder() {
  const [seed, setSeed] = useState(defaultSettings.seed);
  const [seedText, setSeedText] = useState(formatSeed(defaultSettings.seed));
  const [style, setStyle] = useState<PaletteStyle>(defaultSettings.style);
  const [contrast, setContrast] = useState<ContrastLevel>(defaultSettings.contrast);
  const [isDark, setDark] = useState(defaultSettings.mode === 'dark');
  const previewId = useId();
  const rolesId = useId();

  const deferredSeed = useDeferredValue(seed);
  const deferredStyle = useDeferredValue(style);
  const schemes = useMemo(
    () => buildSchemes(deferredSeed, deferredStyle),
    [deferredSeed, deferredStyle],
  );
  const exportFiles = useMemo(
    () => ({
      css: tokensCss(schemes),
      config: configJson(deferredSeed, deferredStyle),
    }),
    [schemes, deferredSeed, deferredStyle],
  );

  const mode = isDark ? 'dark' : 'light';
  const colors = schemes[mode][contrast];
  const themeStyle = schemeStyle(colors, mode);
  const isSeedValid = parseSeed(seedText) !== null;
  const isDefault =
    seed === defaultSettings.seed &&
    isSeedValid &&
    style === defaultSettings.style &&
    contrast === defaultSettings.contrast &&
    mode === defaultSettings.mode;
  const summary = `${formatSeed(deferredSeed)} · ${paletteStyleName(deferredStyle)} · ${contrastName(contrast)} contrast · ${isDark ? 'Dark' : 'Light'}`;

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
              <p className="text-sm text-on-surface-variant">{summary}</p>
            </div>
            <div
              data-slot="theme-preview"
              data-theme={mode}
              style={themeStyle}
              className="overflow-hidden rounded-container border border-outline-subtle bg-canvas text-on-surface"
            >
              <AdminPreview />
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
              <RoleSwatches colors={colors} />
            </div>
          </section>

          <ThemeExport css={exportFiles.css} config={exportFiles.config} />
        </div>
      </div>
    </div>
  );
}
