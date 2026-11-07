import { readFile } from 'node:fs/promises';
import type { ColorRole } from '@/registry/ds/lib/color-scheme';
import { swatchGroups } from '@/components/theme-builder/role-swatches';
import {
  buildSchemes,
  configJson,
  contrastOptions,
  defaultSettings,
  paletteStyleOptions,
  tokensCss,
} from '@/components/theme-builder/theme-model';

function luminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/../g)!
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

it('writes the same colour blocks as the token generator', async () => {
  const generated = await readFile('registry/ds/styles/tokens.css', 'utf8');
  const colourBlocks = generated.slice(0, generated.indexOf(':root {\n  --ds-ease'));
  const schemes = buildSchemes(defaultSettings.seed, defaultSettings.style);
  expect(tokensCss(schemes).trimEnd()).toBe(colourBlocks.trimEnd());
});

it('preserves the config shape and normalises the exported seed', async () => {
  const config = await readFile('tokens/config.json', 'utf8');
  expect(configJson(defaultSettings.seed, defaultSettings.style)).toBe(config);
  expect(JSON.parse(configJson('#0b8f6a', 'fidelity'))).toMatchObject({
    seed: '#0B8F6A',
    style: 'fidelity',
  });
});

it('keeps generated text pairs readable across seeds, palette styles, modes and contrast levels', () => {
  const pairs: [ColorRole, ColorRole][] = [
    ['canvas', 'on-surface-variant'],
    ['surface-raised', 'on-surface-variant'],
  ];
  for (const { swatches } of swatchGroups) {
    for (const swatch of swatches) {
      if (swatch.kind === 'pair') pairs.push([swatch.role, swatch.on]);
      else if (swatch.kind === 'surface') pairs.push([swatch.role, 'on-surface']);
    }
  }
  for (const seed of [defaultSettings.seed, '#F2C230']) {
    for (const { id: style } of paletteStyleOptions) {
      const schemes = buildSchemes(seed, style);
      for (const mode of ['light', 'dark'] as const) {
        for (const { id: contrast } of contrastOptions) {
          const colors = schemes[mode][contrast];
          for (const [background, foreground] of pairs) {
            const a = luminance(colors[background]);
            const b = luminance(colors[foreground]);
            const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
            expect(
              ratio,
              `${seed} ${style} ${mode} ${contrast}: ${background}/${foreground}`,
            ).toBeGreaterThanOrEqual(4.5);
          }
        }
      }
    }
  }
});
