import {
  argbFromHex,
  Blend,
  DynamicScheme,
  Hct,
  hexFromArgb,
  MaterialDynamicColors,
  SchemeExpressive,
  SchemeFidelity,
  SchemeMonochrome,
  SchemeNeutral,
  SchemeTonalSpot,
  SchemeVibrant,
  TonalPalette,
} from '@material/material-color-utilities';

export type PaletteStyle =
  'tonal-spot' | 'vibrant' | 'expressive' | 'fidelity' | 'neutral' | 'monochrome';

export type ContrastLevel = 'standard' | 'medium' | 'high';

export type ColorMode = 'light' | 'dark';

export type SurfaceStyle = 'neutral' | 'tinted';

export interface BrandColorsOptions {
  seed: string;
  mode: ColorMode;
  style?: PaletteStyle;
  contrast?: ContrastLevel;
  surfaces?: SurfaceStyle;
}

const contrastValues: Record<ContrastLevel, number> = {
  standard: 0,
  medium: 0.5,
  high: 1,
};

const schemeRoles = {
  primary: MaterialDynamicColors.primary,
  'on-primary': MaterialDynamicColors.onPrimary,
  'primary-container': MaterialDynamicColors.primaryContainer,
  'on-primary-container': MaterialDynamicColors.onPrimaryContainer,
  'inverse-primary': MaterialDynamicColors.inversePrimary,
  secondary: MaterialDynamicColors.secondary,
  'on-secondary': MaterialDynamicColors.onSecondary,
  'secondary-container': MaterialDynamicColors.secondaryContainer,
  'on-secondary-container': MaterialDynamicColors.onSecondaryContainer,
  tertiary: MaterialDynamicColors.tertiary,
  'on-tertiary': MaterialDynamicColors.onTertiary,
  'tertiary-container': MaterialDynamicColors.tertiaryContainer,
  'on-tertiary-container': MaterialDynamicColors.onTertiaryContainer,
  background: MaterialDynamicColors.background,
  'on-background': MaterialDynamicColors.onBackground,
  surface: MaterialDynamicColors.surface,
  'on-surface': MaterialDynamicColors.onSurface,
  'surface-variant': MaterialDynamicColors.surfaceVariant,
  'on-surface-variant': MaterialDynamicColors.onSurfaceVariant,
  'surface-tint': MaterialDynamicColors.surfaceTint,
  'inverse-surface': MaterialDynamicColors.inverseSurface,
  'inverse-on-surface': MaterialDynamicColors.inverseOnSurface,
  error: MaterialDynamicColors.error,
  'on-error': MaterialDynamicColors.onError,
  'error-container': MaterialDynamicColors.errorContainer,
  'on-error-container': MaterialDynamicColors.onErrorContainer,
  outline: MaterialDynamicColors.outline,
  'outline-variant': MaterialDynamicColors.outlineVariant,
  scrim: MaterialDynamicColors.scrim,
  shadow: MaterialDynamicColors.shadow,
  'surface-bright': MaterialDynamicColors.surfaceBright,
  'surface-dim': MaterialDynamicColors.surfaceDim,
  'surface-container-lowest': MaterialDynamicColors.surfaceContainerLowest,
  'surface-container-low': MaterialDynamicColors.surfaceContainerLow,
  'surface-container': MaterialDynamicColors.surfaceContainer,
  'surface-container-high': MaterialDynamicColors.surfaceContainerHigh,
  'surface-container-highest': MaterialDynamicColors.surfaceContainerHighest,
  'primary-fixed': MaterialDynamicColors.primaryFixed,
  'primary-fixed-dim': MaterialDynamicColors.primaryFixedDim,
  'on-primary-fixed': MaterialDynamicColors.onPrimaryFixed,
  'on-primary-fixed-variant': MaterialDynamicColors.onPrimaryFixedVariant,
  'secondary-fixed': MaterialDynamicColors.secondaryFixed,
  'secondary-fixed-dim': MaterialDynamicColors.secondaryFixedDim,
  'on-secondary-fixed': MaterialDynamicColors.onSecondaryFixed,
  'on-secondary-fixed-variant': MaterialDynamicColors.onSecondaryFixedVariant,
  'tertiary-fixed': MaterialDynamicColors.tertiaryFixed,
  'tertiary-fixed-dim': MaterialDynamicColors.tertiaryFixedDim,
  'on-tertiary-fixed': MaterialDynamicColors.onTertiaryFixed,
  'on-tertiary-fixed-variant': MaterialDynamicColors.onTertiaryFixedVariant,
};

const feedbackSources = {
  success: 0xff1e6b32,
  warning: 0xff7a5900,
  info: 0xff0061a4,
};

export type SchemeRole = keyof typeof schemeRoles;

export type FeedbackRole =
  | 'success'
  | 'on-success'
  | 'success-container'
  | 'on-success-container'
  | 'warning'
  | 'on-warning'
  | 'warning-container'
  | 'on-warning-container'
  | 'info'
  | 'on-info'
  | 'info-container'
  | 'on-info-container';

export type LayerRole =
  'canvas' | 'surface-raised' | 'surface-overlay' | 'surface-segment' | 'surface-thumb';

export const solidSourceNames = ['primary', 'error', 'success', 'warning', 'info'] as const;

type SolidSource = (typeof solidSourceNames)[number];

export type SolidRole = `${SolidSource}-solid` | `on-${SolidSource}-solid`;

export type ColorRole = SchemeRole | FeedbackRole | LayerRole | SolidRole;

export type BrandColors = Record<ColorRole, string>;

export const schemeRoleNames = Object.keys(schemeRoles) as SchemeRole[];

export const feedbackRoleNames: FeedbackRole[] = [
  'success',
  'on-success',
  'success-container',
  'on-success-container',
  'warning',
  'on-warning',
  'warning-container',
  'on-warning-container',
  'info',
  'on-info',
  'info-container',
  'on-info-container',
];

const layerSources: Record<LayerRole, Record<ColorMode, SchemeRole>> = {
  canvas: { light: 'surface-container-low', dark: 'surface' },
  'surface-raised': { light: 'surface-container-lowest', dark: 'surface-container' },
  'surface-overlay': { light: 'surface-container-lowest', dark: 'surface-container-high' },
  'surface-segment': { light: 'surface-container-lowest', dark: 'surface-container-highest' },
  'surface-thumb': { light: 'surface-container-lowest', dark: 'on-surface' },
};

export const layerRoleNames = Object.keys(layerSources) as LayerRole[];

export const solidRoleNames: SolidRole[] = solidSourceNames.flatMap(
  (name) => [`${name}-solid`, `on-${name}-solid`] as const,
);

export const colorRoleNames: ColorRole[] = [
  ...schemeRoleNames,
  ...feedbackRoleNames,
  ...layerRoleNames,
  ...solidRoleNames,
];

function createScheme(source: Hct, dark: boolean, style: PaletteStyle, contrast: number) {
  switch (style) {
    case 'vibrant':
      return new SchemeVibrant(source, dark, contrast, '2025', 'phone');
    case 'expressive':
      return new SchemeExpressive(source, dark, contrast, '2025', 'phone');
    case 'fidelity':
      return new SchemeFidelity(source, dark, contrast, '2025', 'phone');
    case 'neutral':
      return new SchemeNeutral(source, dark, contrast, '2025', 'phone');
    case 'monochrome':
      return new SchemeMonochrome(source, dark, contrast, '2025', 'phone');
    default:
      return new SchemeTonalSpot(source, dark, contrast, '2025', 'phone');
  }
}

function feedbackColors(seed: number, dark: boolean): Record<FeedbackRole, string> {
  const tones = dark ? [80, 20, 30, 90] : [40, 100, 90, 10];
  const result = {} as Record<FeedbackRole, string>;
  for (const [name, source] of Object.entries(feedbackSources)) {
    const palette = TonalPalette.fromInt(Blend.harmonize(source, seed));
    const [main, onMain, container, onContainer] = tones.map((tone) =>
      hexFromArgb(palette.tone(tone)),
    );
    result[name as 'success'] = main;
    result[`on-${name}` as 'on-success'] = onMain;
    result[`${name}-container` as 'success-container'] = container;
    result[`on-${name}-container` as 'on-success-container'] = onContainer;
  }
  return result;
}

export const neutralRoleNames: SchemeRole[] = [
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
];

export function brandColors({
  seed,
  mode,
  style = 'tonal-spot',
  contrast = 'standard',
  surfaces = 'tinted',
}: BrandColorsOptions): BrandColors {
  if (surfaces === 'neutral' && style !== 'monochrome') {
    const accents = brandColors({ seed, mode, style, contrast });
    const neutrals = brandColors({ seed, mode, style: 'monochrome', contrast });
    for (const role of neutralRoleNames) accents[role] = neutrals[role];
    for (const role of layerRoleNames) accents[role] = neutrals[role];
    return accents;
  }
  const argb = argbFromHex(seed);
  const dark = mode === 'dark';
  const scheme: DynamicScheme = createScheme(
    Hct.fromInt(argb),
    dark,
    style,
    contrastValues[contrast],
  );
  const result = {} as BrandColors;
  for (const role of schemeRoleNames) {
    result[role] = hexFromArgb(schemeRoles[role].getArgb(scheme));
  }
  for (const role of layerRoleNames) {
    result[role] = result[layerSources[role][mode]];
  }
  Object.assign(result, feedbackColors(argb, dark));
  const solids =
    dark && style !== 'monochrome' ? brandColors({ seed, mode: 'light', style, contrast }) : result;
  for (const name of solidSourceNames) {
    result[`${name}-solid`] = solids[name];
    result[`on-${name}-solid`] = solids[`on-${name}`];
  }
  return result;
}

export function colorDeclarations(colors: BrandColors, indent = '  ') {
  return colorRoleNames.map((role) => `${indent}--${role}: ${colors[role]};`).join('\n');
}

export type SchemeSet = Record<ColorMode, Record<ContrastLevel, BrandColors>>;

const outsideScope = ':not([data-ds-scheme] *)';
const lightIsland = `:is(.light, [data-theme='light'])${outsideScope}`;
const darkIsland = `:is(.dark, [data-theme='dark'])${outsideScope}`;
const darkSelf = `:is(.dark, [data-theme='dark'])`;

function schemeBlock(selectors: string[], colors: BrandColors, indent: string) {
  const list = selectors.map((selector) => `${indent}  ${selector}`).join(',\n');
  return `${indent}:where(\n${list}\n${indent}) {\n${colorDeclarations(colors, `${indent}  `)}\n${indent}}`;
}

export function schemeCss(schemes: SchemeSet) {
  const blocks = [
    `:where(:root, .light, [data-theme='light']) {\n  color-scheme: light;\n}`,
    `:where(.dark, [data-theme='dark']) {\n  color-scheme: dark;\n}`,
    schemeBlock([':root', lightIsland], schemes.light.standard, ''),
    schemeBlock([darkIsland], schemes.dark.standard, ''),
  ];
  for (const contrast of ['medium', 'high'] as const) {
    const root = `:root[data-contrast='${contrast}']`;
    blocks.push(
      schemeBlock([root, `${root} ${lightIsland}`], schemes.light[contrast], ''),
      schemeBlock([`${root}${darkSelf}`, `${root} ${darkIsland}`], schemes.dark[contrast], ''),
    );
  }
  const auto = ':root:not([data-contrast])';
  blocks.push(
    [
      '@media (prefers-contrast: more) {',
      schemeBlock([auto, `${auto} ${lightIsland}`], schemes.light.high, '  '),
      '',
      schemeBlock([`${auto}${darkSelf}`, `${auto} ${darkIsland}`], schemes.dark.high, '  '),
      '}',
    ].join('\n'),
  );
  return blocks.join('\n\n');
}

export function brandColorsStyle(options: Omit<BrandColorsOptions, 'mode'>) {
  const light = brandColors({ ...options, mode: 'light' });
  const dark = brandColors({ ...options, mode: 'dark' });
  return { light, dark };
}
