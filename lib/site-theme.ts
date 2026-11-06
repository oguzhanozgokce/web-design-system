import config from '@/tokens/config.json';
import { brandColors, type BrandColors, type ContrastLevel } from '@/registry/ds/lib/color-scheme';

const neutralRoles = [
  'background',
  'on-background',
  'surface',
  'on-surface',
  'surface-variant',
  'on-surface-variant',
  'inverse-surface',
  'inverse-on-surface',
  'outline',
  'outline-variant',
  'shadow',
  'scrim',
  'surface-bright',
  'surface-dim',
  'surface-container-lowest',
  'surface-container-low',
  'surface-container',
  'surface-container-high',
  'surface-container-highest',
] as const;

function scheme(mode: 'light' | 'dark', contrast: ContrastLevel) {
  return brandColors({ seed: config.seed, mode, style: 'monochrome', contrast });
}

function lightDark(level: ContrastLevel) {
  const light = scheme('light', level);
  const dark = scheme('dark', level);
  return neutralRoles.map((role) => `--${role}:light-dark(${light[role]},${dark[role]})`).join(';');
}

function single(colors: BrandColors) {
  return neutralRoles.map((role) => `--${role}:${colors[role]}`).join(';');
}

export function siteThemeCss() {
  const modern = [
    `html:root{${lightDark('standard')}}`,
    `html:root[data-contrast=medium]{${lightDark('medium')}}`,
    `html:root[data-contrast=high]{${lightDark('high')}}`,
    `@media (prefers-contrast: more){html:root:not([data-contrast]){${lightDark('high')}}}`,
  ].join('');
  const legacy = [
    `html:root{${single(scheme('light', 'standard'))}}`,
    `html:root:is(.dark,[data-theme=dark]){${single(scheme('dark', 'standard'))}}`,
  ].join('');
  return `@supports (color: light-dark(red, red)){${modern}}@supports not (color: light-dark(red, red)){${legacy}}`;
}
