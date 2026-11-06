import { readFile, writeFile, mkdir } from 'node:fs/promises';
import {
  brandColors,
  colorDeclarations,
  colorRoleNames,
  lightDarkDeclarations,
  type BrandColors,
  type ContrastLevel,
  type PaletteStyle,
  type SurfaceStyle,
} from '../registry/ds/lib/color-scheme.ts';

interface TokenConfig {
  seed: string;
  style: PaletteStyle;
  surfaces?: SurfaceStyle;
}

interface SpringSpec {
  name: string;
  damping: number;
  stiffness: number;
}

const root = new URL('../', import.meta.url);
const config: TokenConfig = JSON.parse(await readFile(new URL('tokens/config.json', root), 'utf8'));

const contrasts: ContrastLevel[] = ['standard', 'medium', 'high'];

const expressiveSprings: SpringSpec[] = [
  { name: 'spatial-fast', damping: 0.65, stiffness: 800 },
  { name: 'spatial', damping: 0.8, stiffness: 380 },
  { name: 'spatial-slow', damping: 0.8, stiffness: 200 },
  { name: 'effect-fast', damping: 1, stiffness: 3800 },
  { name: 'effect', damping: 1, stiffness: 1600 },
  { name: 'effect-slow', damping: 1, stiffness: 800 },
];

const productiveSprings: SpringSpec[] = [
  { name: 'spatial-fast', damping: 0.9, stiffness: 1400 },
  { name: 'spatial', damping: 0.9, stiffness: 700 },
  { name: 'spatial-slow', damping: 0.9, stiffness: 300 },
];

function springPosition(t: number, damping: number, stiffness: number) {
  const omega = Math.sqrt(stiffness);
  if (damping >= 1) {
    return 1 - Math.exp(-omega * t) * (1 + omega * t);
  }
  const omegaD = omega * Math.sqrt(1 - damping * damping);
  const envelope = Math.exp(-damping * omega * t);
  return (
    1 - envelope * (Math.cos(omegaD * t) + ((damping * omega) / omegaD) * Math.sin(omegaD * t))
  );
}

function settleTime(damping: number, stiffness: number) {
  const step = 0.001;
  let lastOutside = 0;
  for (let t = 0; t < 5; t += step) {
    if (Math.abs(1 - springPosition(t, damping, stiffness)) > 0.002) lastOutside = t;
  }
  return lastOutside + step;
}

function springEasing({ damping, stiffness }: SpringSpec) {
  const duration = settleTime(damping, stiffness);
  const samples = 40;
  const points: string[] = [];
  for (let i = 0; i <= samples; i += 1) {
    const value = i === samples ? 1 : springPosition((duration * i) / samples, damping, stiffness);
    points.push(String(Math.round(value * 1000) / 1000));
  }
  return { easing: `linear(${points.join(', ')})`, duration: Math.round(duration * 1000) };
}

function motionDeclarations(springs: SpringSpec[]) {
  return springs
    .flatMap((spring) => {
      const { easing, duration } = springEasing(spring);
      return [
        `  --ds-ease-${spring.name}: ${easing};`,
        `  --ds-duration-${spring.name}: ${duration}ms;`,
      ];
    })
    .join('\n');
}

const schemes: Record<'light' | 'dark', Record<ContrastLevel, BrandColors>> = {
  light: {} as Record<ContrastLevel, BrandColors>,
  dark: {} as Record<ContrastLevel, BrandColors>,
};

for (const mode of ['light', 'dark'] as const) {
  for (const contrast of contrasts) {
    schemes[mode][contrast] = brandColors({
      seed: config.seed,
      style: config.style,
      surfaces: config.surfaces ?? 'neutral',
      mode,
      contrast,
    });
  }
}

const header = '/* Generated from tokens/config.json. Do not edit. */';

const both = (contrast: ContrastLevel, indent = '    ') =>
  lightDarkDeclarations(schemes.light[contrast], schemes.dark[contrast], indent);

const supported = [
  `@supports (color: light-dark(red, red)) {`,
  `  :root {\n    color-scheme: light;\n${both('standard')}\n  }`,
  '',
  `  .light,\n  [data-theme='light'] {\n    color-scheme: light;\n  }`,
  '',
  `  .dark,\n  [data-theme='dark'] {\n    color-scheme: dark;\n  }`,
  '',
  ...(['medium', 'high'] as const).flatMap((contrast) => [
    `  :root[data-contrast='${contrast}'] {\n${both(contrast)}\n  }`,
    '',
  ]),
  `  @media (prefers-contrast: more) {\n    :root:not([data-contrast]) {\n${both('high', '      ')}\n    }\n  }`,
  `}`,
];

const fallback = [
  `@supports not (color: light-dark(red, red)) {`,
  `  :root,\n  .light,\n  [data-theme='light'] {\n    color-scheme: light;\n${colorDeclarations(schemes.light.standard, '    ')}\n  }`,
  '',
  `  .dark,\n  [data-theme='dark'] {\n    color-scheme: dark;\n${colorDeclarations(schemes.dark.standard, '    ')}\n  }`,
  '',
  ...(['medium', 'high'] as const).flatMap((contrast) => [
    `  :root[data-contrast='${contrast}'] {\n${colorDeclarations(schemes.light[contrast], '    ')}\n  }`,
    '',
    `  :root.dark[data-contrast='${contrast}'],\n  :root[data-theme='dark'][data-contrast='${contrast}'] {\n${colorDeclarations(schemes.dark[contrast], '    ')}\n  }`,
    '',
  ]),
  `  @media (prefers-contrast: more) {\n    :root:not([data-contrast]) {\n${colorDeclarations(schemes.light.high, '      ')}\n    }\n\n    :root.dark:not([data-contrast]),\n    :root[data-theme='dark']:not([data-contrast]) {\n${colorDeclarations(schemes.dark.high, '      ')}\n    }\n  }`,
  `}`,
];

const css = [
  header,
  '',
  ...supported,
  '',
  ...fallback,
  '',
  `:root {\n${motionDeclarations(expressiveSprings)}\n}`,
  '',
  `[data-motion-profile='productive'] {\n${motionDeclarations(productiveSprings)}\n}`,
  '',
].join('\n');

const dtcg = {
  $description: `Material 3 color roles generated from seed ${config.seed} (${config.style}, spec 2025).`,
  color: Object.fromEntries(
    (['light', 'dark'] as const).map((mode) => [
      mode,
      Object.fromEntries(
        contrasts.map((contrast) => [
          contrast,
          Object.fromEntries(
            colorRoleNames.map((role) => [
              role,
              { $type: 'color', $value: schemes[mode][contrast][role] },
            ]),
          ),
        ]),
      ),
    ]),
  ),
};

await mkdir(new URL('registry/ds/styles/', root), { recursive: true });
await writeFile(new URL('registry/ds/styles/tokens.css', root), css);
await writeFile(new URL('tokens/tokens.json', root), `${JSON.stringify(dtcg, null, 2)}\n`);
console.log(`tokens: ${colorRoleNames.length} roles × 2 modes × 3 contrasts from ${config.seed}`);
