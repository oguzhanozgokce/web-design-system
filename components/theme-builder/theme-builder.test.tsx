import { commands, page, userEvent } from 'vitest/browser';
import { brandColors, colorRoleNames } from '@/registry/ds/lib/color-scheme';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { AdminPreview } from '@/components/theme-builder/admin-preview';
import { RoleSwatches } from '@/components/theme-builder/role-swatches';
import { ThemeBuilder } from '@/components/theme-builder/theme-builder';
import {
  buildSchemes,
  composeCall,
  configJson,
  contrastOptions,
  defaultSettings,
  formatSeed,
  paletteStyleOptions,
  schemeStyle,
  tokensCss,
} from '@/components/theme-builder/theme-model';

const errorText = 'Enter 3 or 6 hex digits, with or without the leading #.';

const teal = { seed: '#0B8F6A' };

const navy = { seed: '#123' };

function previewVar(role: string) {
  const preview = document.querySelector<HTMLElement>('[data-slot="theme-preview"]');
  return preview?.style.getPropertyValue(`--${role}`);
}

function defaults(overrides: Partial<Parameters<typeof brandColors>[0]> = {}) {
  return brandColors({
    seed: defaultSettings.seed,
    style: defaultSettings.style,
    mode: 'light',
    ...overrides,
  });
}

function setNativeValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

async function transitionsSettled() {
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const transitions = document
    .getAnimations()
    .filter((animation) => animation instanceof CSSTransition);
  await Promise.all(transitions.map((transition) => transition.finished.catch(() => undefined)));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ThemeBuilder', () => {
  it('themes only the preview, starting from tokens/config.json', async () => {
    const screen = await renderWithDS(<ThemeBuilder />);

    await expect
      .element(screen.getByRole('heading', { level: 1, name: 'Theme builder' }))
      .toBeVisible();
    await expect
      .element(screen.getByRole('textbox', { name: 'Seed colour' }))
      .toHaveValue(formatSeed(defaultSettings.seed));
    expect(previewVar('primary')).toBe(defaults().primary);
    expect(previewVar('on-primary-container')).toBe(defaults()['on-primary-container']);
    expect(document.querySelector('[data-slot="theme-preview"]')).toHaveAttribute(
      'data-theme',
      'light',
    );
    expect(screen.container.style.getPropertyValue('--primary')).toBe('');
    await expect.element(screen.getByRole('button', { name: 'Reset' })).toBeDisabled();
  });

  it('applies a hex value as it is typed and keeps the last scheme while it is invalid', async () => {
    const seed = '#0B8F6A';
    const screen = await renderWithDS(<ThemeBuilder />);
    const field = screen.getByRole('textbox', { name: 'Seed colour' });

    await field.fill(seed.slice(1));
    await expect.poll(() => previewVar('primary')).toBe(defaults({ seed }).primary);
    expect(screen.getByLabelText('Pick the seed colour').element()).toHaveValue(seed.toLowerCase());

    await field.fill(seed.slice(0, 5));
    await expect.element(field).toHaveAttribute('aria-invalid', 'true');
    await expect.element(screen.getByText(errorText)).toBeVisible();
    expect(previewVar('primary')).toBe(defaults({ seed }).primary);
    await expect.element(screen.getByRole('button', { name: 'Reset' })).toBeEnabled();
  });

  it('expands and upper-cases a short hex when the field loses focus', async () => {
    const seed = '#AABBCC';
    const screen = await renderWithDS(<ThemeBuilder />);
    const field = screen.getByRole('textbox', { name: 'Seed colour' });

    await field.fill('abc');
    await userEvent.tab();
    await expect.element(field).toHaveValue(seed);
    await expect.poll(() => previewVar('primary')).toBe(defaults({ seed }).primary);
  });

  it('follows the native colour picker', async () => {
    const seed = '#c2185b';
    const screen = await renderWithDS(<ThemeBuilder />);
    const picker = screen.getByLabelText('Pick the seed colour').element() as HTMLInputElement;

    setNativeValue(picker, seed);

    await expect
      .element(screen.getByRole('textbox', { name: 'Seed colour' }))
      .toHaveValue(seed.toUpperCase());
    await expect.poll(() => previewVar('primary')).toBe(defaults({ seed }).primary);
  });

  it('switches the palette style and writes it to config.json', async () => {
    const screen = await renderWithDS(<ThemeBuilder />);

    await screen.getByRole('button', { name: /Palette style/ }).click();
    await page.getByRole('option', { name: /^Neutral/ }).click();

    await expect.poll(() => previewVar('primary')).toBe(defaults({ style: 'neutral' }).primary);
    await screen.getByRole('tab', { name: 'config.json' }).click();
    await expect
      .element(screen.getByRole('region', { name: 'tokens/config.json' }))
      .toMatchTextContent(/"style": "neutral"/);
  });

  it('previews contrast and dark mode, and carries contrast into the Compose call', async () => {
    const screen = await renderWithDS(<ThemeBuilder />);

    await screen.getByRole('radio', { name: 'High' }).click();
    await expect.poll(() => previewVar('primary')).toBe(defaults({ contrast: 'high' }).primary);

    await screen.getByText('Dark preview').click();
    const dark = defaults({ contrast: 'high', mode: 'dark' });
    await expect.poll(() => previewVar('surface')).toBe(dark.surface);
    expect(document.querySelector('[data-slot="theme-preview"]')).toHaveAttribute(
      'data-theme',
      'dark',
    );
    expect(document.querySelector('[data-slot="theme-roles"]')).toHaveAttribute(
      'data-theme',
      'dark',
    );

    await screen.getByRole('tab', { name: 'Compose' }).click();
    await expect
      .element(screen.getByRole('region', { name: 'Compose' }))
      .toMatchTextContent(/contrast = DSContrast\.HIGH/);
  });

  it('resets every control to the catalogue default', async () => {
    const screen = await renderWithDS(<ThemeBuilder />);

    await screen.getByRole('radio', { name: 'Medium' }).click();
    await screen.getByText('Dark preview').click();
    await screen.getByRole('textbox', { name: 'Seed colour' }).fill(navy.seed);
    (screen.getByRole('button', { name: 'Reset' }).element() as HTMLElement).focus();
    await userEvent.keyboard('{Enter}');

    await expect.element(screen.getByRole('radio', { name: 'Standard' })).toBeChecked();
    await expect.element(screen.getByRole('switch', { name: /Dark preview/ })).not.toBeChecked();
    await expect
      .element(screen.getByRole('textbox', { name: 'Seed colour' }))
      .toHaveValue(formatSeed(defaultSettings.seed));
    await expect.poll(() => previewVar('primary')).toBe(defaults().primary);
    await expect.element(screen.getByRole('button', { name: 'Reset' })).toBeDisabled();
    await expect.element(screen.getByRole('textbox', { name: 'Seed colour' })).toHaveFocus();
  });

  it('sends a click on the seed field to the hex input, with the picker after it', async () => {
    const screen = await renderWithDS(<ThemeBuilder />);
    const field = screen.getByRole('textbox', { name: 'Seed colour' });
    const container = document.querySelector(
      '[data-slot="theme-controls"] [data-slot="text-field"] [data-slot="container"]',
    );

    await userEvent.click(container!, { position: { x: 4, y: 4 } });
    await expect.element(field).toHaveFocus();

    await userEvent.tab();
    await expect.element(screen.getByLabelText('Pick the seed colour')).toHaveFocus();
  });

  it('copies the export that is on screen', async () => {
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    const screen = await renderWithDS(<ThemeBuilder />);

    await screen.getByRole('button', { name: 'Copy CSS' }).click();
    await expect
      .poll(() => writeText.mock.calls[0]?.[0])
      .toBe(tokensCss(buildSchemes(defaultSettings.seed, defaultSettings.style)));

    await screen.getByRole('tab', { name: 'Compose' }).click();
    await screen.getByRole('button', { name: 'Copy Kotlin' }).click();
    await expect
      .poll(() => writeText.mock.calls[1]?.[0])
      .toBe(composeCall(defaultSettings.seed, defaultSettings.style, 'standard'));
  });

  it('shows every colour role with its value', async () => {
    await renderWithDS(<ThemeBuilder />);
    const tiles = Array.from(document.querySelectorAll('[data-slot="role-swatches"] [data-role]'));
    const shown = new Set(
      tiles.flatMap((tile) => [tile.getAttribute('data-role'), tile.getAttribute('data-on-role')]),
    );

    expect(colorRoleNames.filter((role) => !shown.has(role))).toEqual([]);
    const primary = tiles.find((tile) => tile.getAttribute('data-role') === 'primary');
    expect(primary?.textContent).toContain(defaults().primary);
    expect(primary?.textContent).toContain(defaults()['on-primary']);
  });
});

describe('Theme exports', () => {
  it('writes the same colour blocks as scripts/generate-tokens.ts', async () => {
    const generated = await commands.readFile('registry/ds/styles/tokens.css');
    const colourBlocks = generated.slice(0, generated.indexOf(':root {\n  --ds-ease'));
    const schemes = buildSchemes(defaultSettings.seed, defaultSettings.style);

    expect(tokensCss(schemes).trimEnd()).toBe(colourBlocks.trimEnd());
  });

  it('writes tokens/config.json in the file’s own shape', async () => {
    const config = await commands.readFile('tokens/config.json');
    expect(configJson(defaultSettings.seed, defaultSettings.style)).toBe(config);
    expect(JSON.parse(configJson(teal.seed.toLowerCase(), 'fidelity'))).toMatchObject({
      seed: teal.seed,
      style: 'fidelity',
    });
  });

  it('writes the Compose call with Kotlin enum names', () => {
    expect(composeCall(teal.seed.toLowerCase(), 'tonal-spot', 'medium')).toBe(
      [
        'rememberDSBrandColors(',
        '    seed = Color(0xFF0B8F6A),',
        '    style = DSPaletteStyle.TONAL_SPOT,',
        '    contrast = DSContrast.MEDIUM,',
        ')',
      ].join('\n'),
    );
  });
});

describe('ThemeBuilder accessibility', () => {
  it('has no accessibility violations with a dark, high-contrast preview', async () => {
    const screen = await renderWithDS(<ThemeBuilder />);
    await screen.getByRole('radio', { name: 'High' }).click();
    await screen.getByText('Dark preview').click();
    await expect
      .poll(() => previewVar('surface'))
      .toBe(defaults({ contrast: 'high', mode: 'dark' }).surface);
    await transitionsSettled();
    await expectNoA11yViolations(screen.container);
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(<ThemeBuilder />, options);
      await expectNoA11yViolations(screen.container);
      screen.unmount();
    }
  });

  it('keeps the preview and swatches readable for every style, mode and contrast', async () => {
    const yellow = { seed: '#F2C230' };
    for (const seed of [defaultSettings.seed, yellow.seed]) {
      for (const { id: style } of paletteStyleOptions) {
        const schemes = buildSchemes(seed, style);
        for (const mode of ['light', 'dark'] as const) {
          for (const { id: contrast } of contrastOptions) {
            const colors = schemes[mode][contrast];
            const screen = await renderWithDS(
              <div style={schemeStyle(colors, mode)} className="bg-background text-on-background">
                <AdminPreview />
                <RoleSwatches colors={colors} />
              </div>,
            );
            await expectNoA11yViolations(screen.container);
            screen.unmount();
          }
        }
      }
    }
  });
});
