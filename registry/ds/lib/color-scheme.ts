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

export interface BrandColorsOptions {
  seed: string;
  mode: ColorMode;
  style?: PaletteStyle;
  contrast?: ContrastLevel;
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

export type ColorRole = SchemeRole | FeedbackRole;

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

export const colorRoleNames: ColorRole[] = [...schemeRoleNames, ...feedbackRoleNames];

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

export function brandColors({
  seed,
  mode,
  style = 'tonal-spot',
  contrast = 'standard',
}: BrandColorsOptions): BrandColors {
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
  return { ...result, ...feedbackColors(argb, dark) };
}

export function colorDeclarations(colors: BrandColors, indent = '  ') {
  return colorRoleNames.map((role) => `${indent}--${role}: ${colors[role]};`).join('\n');
}

export function lightDarkDeclarations(light: BrandColors, dark: BrandColors, indent = '  ') {
  return colorRoleNames
    .map((role) => `${indent}--${role}: light-dark(${light[role]}, ${dark[role]});`)
    .join('\n');
}

export function brandColorsStyle(options: Omit<BrandColorsOptions, 'mode'>) {
  const light = brandColors({ ...options, mode: 'light' });
  const dark = brandColors({ ...options, mode: 'dark' });
  return { light, dark };
}
