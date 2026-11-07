import type { CSSProperties } from 'react';
import {
  brandColors,
  colorRoleNames,
  schemeCss,
  type SchemeSet,
  type BrandColors,
  type ColorMode,
  type ContrastLevel,
  type PaletteStyle,
} from '@/registry/ds/lib/color-scheme';
import { parseSeed } from '@/registry/ds/lib/dynamic-color';
import tokenConfig from '@/tokens/config.json';

export interface PaletteStyleOption {
  id: PaletteStyle;
  name: string;
  description: string;
}

export const paletteStyleOptions: PaletteStyleOption[] = [
  {
    id: 'tonal-spot',
    name: 'Tonal spot',
    description: 'Calm, low-chroma accents',
  },
  { id: 'vibrant', name: 'Vibrant', description: 'Saturated accents; the catalogue default' },
  { id: 'expressive', name: 'Expressive', description: 'Shifts hues for playful palettes' },
  {
    id: 'fidelity',
    name: 'Fidelity',
    description: 'Keeps primary-container closest to the seed',
  },
  {
    id: 'neutral',
    name: 'Neutral',
    description: 'Nearly grey, for tools and dense admin screens',
  },
  { id: 'monochrome', name: 'Monochrome', description: 'Grey only' },
];

export interface ContrastOption {
  id: ContrastLevel;
  name: string;
}

export const contrastOptions: ContrastOption[] = [
  { id: 'standard', name: 'Standard' },
  { id: 'medium', name: 'Medium' },
  { id: 'high', name: 'High' },
];

const colorModes: ColorMode[] = ['light', 'dark'];

const contrastLevels = contrastOptions.map((option) => option.id);

export function isPaletteStyle(value: unknown): value is PaletteStyle {
  return paletteStyleOptions.some((option) => option.id === value);
}

export function isContrastLevel(value: unknown): value is ContrastLevel {
  return contrastOptions.some((option) => option.id === value);
}

function configuredSeed() {
  const seed = parseSeed(tokenConfig.seed);
  if (!seed) throw new Error(`tokens/config.json has an invalid seed: ${tokenConfig.seed}`);
  return seed;
}

export interface ThemeSettings {
  seed: string;
  style: PaletteStyle;
  contrast: ContrastLevel;
  mode: ColorMode;
}

export const defaultSettings: ThemeSettings = {
  seed: configuredSeed(),
  style: isPaletteStyle(tokenConfig.style) ? tokenConfig.style : 'tonal-spot',
  contrast: 'standard',
  mode: 'light',
};

export function buildSchemes(seed: string, style: PaletteStyle): SchemeSet {
  return Object.fromEntries(
    colorModes.map((mode) => [
      mode,
      Object.fromEntries(
        contrastLevels.map((contrast) => [
          contrast,
          brandColors({ seed, mode, style, contrast, surfaces: 'neutral' }),
        ]),
      ),
    ]),
  ) as SchemeSet;
}

export function formatSeed(seed: string) {
  return seed.toUpperCase();
}

export function paletteStyleName(style: PaletteStyle) {
  return paletteStyleOptions.find((option) => option.id === style)?.name ?? style;
}

export function contrastName(contrast: ContrastLevel) {
  return contrastOptions.find((option) => option.id === contrast)?.name ?? contrast;
}

export function schemeStyle(colors: BrandColors, mode: ColorMode): CSSProperties {
  const properties: Record<string, string> = { colorScheme: mode };
  for (const role of colorRoleNames) properties[`--${role}`] = colors[role];
  return properties as CSSProperties;
}

export type { SchemeSet };

export function tokensCss(schemes: SchemeSet) {
  const header = '/* Generated from tokens/config.json. Do not edit. */';

  return [header, '', schemeCss(schemes), ''].join('\n');
}

export function configJson(seed: string, style: PaletteStyle) {
  return `${JSON.stringify({ ...tokenConfig, seed: formatSeed(seed), style }, null, 2)}\n`;
}
