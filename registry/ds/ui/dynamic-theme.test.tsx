import { Activity, useState } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { cdp, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { useLocalStorageState } from '@/registry/ds/hooks/use-local-storage-state';
import { brandColors, type ColorMode, type ContrastLevel } from '@/registry/ds/lib/color-scheme';
import {
  dynamicBootAttribute,
  dynamicSchemeCss,
  dynamicThemeBootScript,
  removeBootStyles,
} from '@/registry/ds/lib/dynamic-color';
import { useThemeScopeProps } from '@/registry/ds/lib/theme-scope';
import { Button } from '@/registry/ds/ui/button';
import { Dialog, DialogTrigger } from '@/registry/ds/ui/dialog';
import { DSProvider } from '@/registry/ds/ui/ds-provider';
import { DynamicTheme, useDynamicTheme, useThemeTransition } from '@/registry/ds/ui/dynamic-theme';
import { Popover, PopoverDialog, PopoverTrigger } from '@/registry/ds/ui/popover';

const seedTeal = '#0B8F6A';
const seedCoral = '#E8613C';

function rgb(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16);
  return `rgb(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255})`;
}

function expected(
  seed: string,
  mode: ColorMode,
  contrast: ContrastLevel = 'standard',
  style: 'tonal-spot' | 'vibrant' = 'tonal-spot',
) {
  return rgb(brandColors({ seed, mode, contrast, style }).primary);
}

function Swatch({ id = 'swatch' }: { id?: string }) {
  return <div data-testid={id} className="size-4 bg-primary" />;
}

function background(element: Element) {
  return getComputedStyle(element).backgroundColor;
}

function schemeStyles() {
  return [...document.head.querySelectorAll('style[data-ds-scheme-style]')];
}

describe('DynamicTheme', () => {
  afterEach(async () => {
    document.documentElement.removeAttribute('data-contrast');
    document.documentElement.classList.remove('dark');
    localStorage.clear();
    removeBootStyles('ds-test');
    removeBootStyles('accent-theme');
    await cdp().send('Emulation.setEmulatedMedia', { features: [] });
  });

  it('applies the scheme of its seed to its subtree only', async () => {
    const screen = await renderWithDS(
      <>
        <DynamicTheme seed={seedTeal}>
          <Swatch />
        </DynamicTheme>
        <Swatch id="outside" />
      </>,
    );
    expect(background(screen.getByTestId('swatch').element())).toBe(expected(seedTeal, 'light'));
    expect(background(screen.getByTestId('outside').element())).not.toBe(
      expected(seedTeal, 'light'),
    );
  });

  it('keeps its style in the document head, shared between scopes and removed with the last', async () => {
    const screen = await renderWithDS(
      <>
        <DynamicTheme seed={seedTeal} data-testid="a" />
        <DynamicTheme seed={seedTeal} data-testid="b" />
      </>,
    );
    expect(screen.container.querySelector('style')).toBeNull();
    expect(schemeStyles()).toHaveLength(1);
    await screen.unmount();
    expect(schemeStyles()).toHaveLength(0);
  });

  it('follows a dark ancestor, by class or by data-theme', async () => {
    const screen = await render(
      <>
        <div className="dark">
          <DynamicTheme seed={seedTeal}>
            <Swatch id="class" />
          </DynamicTheme>
        </div>
        <div data-theme="dark">
          <DynamicTheme seed={seedTeal}>
            <Swatch id="attribute" />
          </DynamicTheme>
        </div>
      </>,
    );
    expect(background(screen.getByTestId('class').element())).toBe(expected(seedTeal, 'dark'));
    expect(background(screen.getByTestId('attribute').element())).toBe(expected(seedTeal, 'dark'));
  });

  it('follows the nearest mode, not any dark ancestor', async () => {
    document.documentElement.classList.add('dark');
    const screen = await render(
      <>
        <div data-theme="light">
          <DynamicTheme seed={seedTeal}>
            <Swatch id="island" />
          </DynamicTheme>
        </div>
        <DynamicTheme seed={seedTeal} mode="light">
          <DynamicTheme seed={seedCoral}>
            <Swatch id="nested" />
          </DynamicTheme>
        </DynamicTheme>
      </>,
    );
    expect(background(screen.getByTestId('island').element())).toBe(expected(seedTeal, 'light'));
    expect(background(screen.getByTestId('nested').element())).toBe(expected(seedCoral, 'light'));
  });

  it('keeps its colours in a static mode island inside it', async () => {
    const screen = await render(
      <DynamicTheme seed={seedTeal}>
        <div className="dark">
          <Swatch id="dark" />
          <div className="light">
            <Swatch id="light" />
          </div>
        </div>
      </DynamicTheme>,
    );
    expect(background(screen.getByTestId('dark').element())).toBe(expected(seedTeal, 'dark'));
    expect(background(screen.getByTestId('light').element())).toBe(expected(seedTeal, 'light'));
  });

  it('follows a mode class on its own element', async () => {
    const screen = await renderWithDS(
      <DynamicTheme seed={seedTeal} className="dark">
        <Swatch />
      </DynamicTheme>,
    );
    expect(background(screen.getByTestId('swatch').element())).toBe(expected(seedTeal, 'dark'));
  });

  it('pins a mode for its subtree and marks it with data-theme', async () => {
    const screen = await renderWithDS(
      <DynamicTheme seed={seedTeal} mode="dark" data-testid="scope">
        <Swatch />
      </DynamicTheme>,
    );
    expect(background(screen.getByTestId('swatch').element())).toBe(expected(seedTeal, 'dark'));
    await expect.element(screen.getByTestId('scope')).toHaveAttribute('data-theme', 'dark');
  });

  it('follows data-contrast on the root when contrast is auto', async () => {
    document.documentElement.setAttribute('data-contrast', 'high');
    const screen = await renderWithDS(
      <DynamicTheme seed={seedTeal}>
        <Swatch />
      </DynamicTheme>,
    );
    expect(background(screen.getByTestId('swatch').element())).toBe(
      expected(seedTeal, 'light', 'high'),
    );
  });

  it('follows the system contrast preference when the page sets none', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-contrast', value: 'more' }],
    });
    const screen = await renderWithDS(
      <>
        <DynamicTheme seed={seedTeal}>
          <Swatch />
        </DynamicTheme>
        <Swatch id="static" />
      </>,
    );
    expect(background(screen.getByTestId('swatch').element())).toBe(
      expected(seedTeal, 'light', 'high'),
    );
    expect(background(screen.getByTestId('static').element())).toBe(
      rgb(
        brandColors({ seed: '#5B4BFF', mode: 'light', contrast: 'high', style: 'vibrant' }).primary,
      ),
    );
  });

  it('pins a contrast level', async () => {
    document.documentElement.setAttribute('data-contrast', 'high');
    const screen = await renderWithDS(
      <DynamicTheme seed={seedTeal} contrast="medium">
        <Swatch />
      </DynamicTheme>,
      { dark: true },
    );
    expect(background(screen.getByTestId('swatch').element())).toBe(
      expected(seedTeal, 'dark', 'medium'),
    );
  });

  it('uses the palette style', async () => {
    const screen = await renderWithDS(
      <DynamicTheme seed={seedTeal} paletteStyle="vibrant">
        <Swatch />
      </DynamicTheme>,
    );
    expect(background(screen.getByTestId('swatch').element())).toBe(
      expected(seedTeal, 'light', 'standard', 'vibrant'),
    );
  });

  it('lets an inner scope override an outer one', async () => {
    const screen = await renderWithDS(
      <DynamicTheme seed={seedTeal}>
        <Swatch id="outer" />
        <DynamicTheme seed={seedCoral}>
          <Swatch id="inner" />
        </DynamicTheme>
      </DynamicTheme>,
    );
    expect(background(screen.getByTestId('outer').element())).toBe(expected(seedTeal, 'light'));
    expect(background(screen.getByTestId('inner').element())).toBe(expected(seedCoral, 'light'));
  });

  it('renders children untouched for a missing or invalid seed', async () => {
    const screen = await renderWithDS(
      <>
        <DynamicTheme seed="teal" data-testid="invalid">
          <Swatch />
        </DynamicTheme>
        <DynamicTheme seed={null} data-testid="none" />
      </>,
    );
    await expect.element(screen.getByTestId('invalid')).not.toHaveAttribute('data-ds-scheme');
    await expect.element(screen.getByTestId('none')).not.toHaveAttribute('data-ds-scheme');
    await expect.element(screen.getByTestId('swatch')).toBeInTheDocument();
  });

  it('puts the nonce on its style', async () => {
    await renderWithDS(<DynamicTheme seed={seedTeal} nonce="n0nce" />);
    expect((schemeStyles()[0] as HTMLStyleElement).nonce).toBe('n0nce');
  });

  it('exposes the scheme and the overlay attributes to its subtree', async () => {
    function Probe() {
      const theme = useDynamicTheme();
      const overlay = useThemeScopeProps();
      return (
        <span data-testid="probe" {...overlay}>
          {theme ? `${theme.seed} ${theme.paletteStyle}` : 'none'}
        </span>
      );
    }
    const screen = await renderWithDS(
      <>
        <DynamicTheme seed={seedTeal} paletteStyle="vibrant" mode="dark">
          <Probe />
        </DynamicTheme>
        <Probe />
      </>,
    );
    const [inside, outside] = screen.getByTestId('probe').elements();
    expect(inside.textContent).toBe(`${seedTeal.toLowerCase()} vibrant`);
    expect(inside.getAttribute('data-ds-scheme')).toMatch(/^s0b8f6a-vibrant/);
    expect(inside.getAttribute('data-theme')).toBe('dark');
    expect(outside.textContent).toBe('none');
    expect(outside.hasAttribute('data-ds-scheme')).toBe(false);
  });

  it('keeps its scheme in popovers and dialogs that render outside it', async () => {
    const screen = await renderWithDS(
      <DynamicTheme seed={seedTeal} mode="dark">
        <PopoverTrigger>
          <Button>Details</Button>
          <Popover>
            <PopoverDialog aria-label="Details">
              <Swatch id="popover" />
            </PopoverDialog>
          </Popover>
        </PopoverTrigger>
        <DialogTrigger>
          <Button>Settings</Button>
          <Dialog aria-label="Settings">
            <Swatch id="dialog" />
          </Dialog>
        </DialogTrigger>
      </DynamicTheme>,
    );
    await screen.getByRole('button', { name: 'Details' }).click();
    const popover = screen.getByTestId('popover');
    await expect.element(popover).toBeVisible();
    expect(screen.container.contains(popover.element())).toBe(false);
    expect(background(popover.element())).toBe(expected(seedTeal, 'dark'));
    await userEvent.keyboard('{Escape}');
    await screen.getByRole('button', { name: 'Settings' }).click();
    const dialog = screen.getByTestId('dialog');
    await expect.element(dialog).toBeVisible();
    expect(background(dialog.element())).toBe(expected(seedTeal, 'dark'));
  });

  describe('scope root', () => {
    it('themes the whole page and restores it on unmount', async () => {
      const root = document.documentElement;
      const before = getComputedStyle(root).getPropertyValue('--primary');
      const screen = await render(<DynamicTheme scope="root" seed={seedCoral} />);
      const light = brandColors({ seed: seedCoral, mode: 'light' }).primary;
      expect(getComputedStyle(root).getPropertyValue('--primary')).toContain(light);
      await screen.unmount();
      expect(getComputedStyle(root).getPropertyValue('--primary')).toBe(before);
    });

    it('reaches mode islands below the root', async () => {
      document.documentElement.classList.add('dark');
      const screen = await render(
        <>
          <DynamicTheme scope="root" seed={seedCoral} />
          <Swatch id="page" />
          <div data-theme="light">
            <Swatch id="island" />
          </div>
          <div className="dark">
            <Swatch id="wrapper" />
          </div>
        </>,
      );
      expect(background(screen.getByTestId('page').element())).toBe(expected(seedCoral, 'dark'));
      expect(background(screen.getByTestId('island').element())).toBe(expected(seedCoral, 'light'));
      expect(background(screen.getByTestId('wrapper').element())).toBe(expected(seedCoral, 'dark'));
    });

    it('stops theming the page while hidden in an Activity', async () => {
      function Page({ visible }: { visible: boolean }) {
        return (
          <Activity mode={visible ? 'visible' : 'hidden'}>
            <DynamicTheme scope="root" seed={seedCoral} />
          </Activity>
        );
      }
      const root = document.documentElement;
      const before = getComputedStyle(root).getPropertyValue('--primary');
      const screen = await render(<Page visible />);
      expect(getComputedStyle(root).getPropertyValue('--primary')).not.toBe(before);
      await screen.rerender(<Page visible={false} />);
      expect(getComputedStyle(root).getPropertyValue('--primary')).toBe(before);
      await screen.rerender(<Page visible />);
      expect(getComputedStyle(root).getPropertyValue('--primary')).not.toBe(before);
    });

    it('caches its scheme for the boot script and clears it for a missing seed', async () => {
      const boot = document.createElement('style');
      boot.setAttribute(dynamicBootAttribute, 'ds-test');
      document.head.append(boot);

      const screen = await render(
        <DynamicTheme scope="root" seed={seedCoral} storageKey="ds-test" />,
      );
      await expect.poll(() => localStorage.getItem('ds-test')).toContain('html:root,');
      expect(document.querySelector(`style[${dynamicBootAttribute}]`)).toBeNull();

      await screen.rerender(<DynamicTheme scope="root" seed="" storageKey="ds-test" />);
      await expect.poll(() => localStorage.getItem('ds-test')).toBeNull();
    });

    it('hydrates a remembered accent without an unthemed frame', async () => {
      const css = dynamicSchemeCss({ seed: seedCoral }, { scope: 'root' });
      localStorage.setItem('accent', JSON.stringify(seedCoral));
      localStorage.setItem('accent-theme', css);
      const script = document.createElement('script');
      script.textContent = dynamicThemeBootScript('accent-theme');
      document.head.append(script);
      script.remove();

      function AccentTheme() {
        const [accent] = useLocalStorageState<string | null>('accent', null);
        return <DynamicTheme scope="root" seed={accent} storageKey="accent-theme" />;
      }

      const themed = brandColors({ seed: seedCoral, mode: 'light' }).primary;
      const container = document.createElement('div');
      container.innerHTML = renderToString(<AccentTheme />);
      document.body.append(container);

      const samples: string[] = [];
      const cacheSeen: (string | null)[] = [];
      let sampling = true;
      const sample = () => {
        samples.push(getComputedStyle(document.documentElement).getPropertyValue('--primary'));
        cacheSeen.push(localStorage.getItem('accent-theme'));
        if (sampling) requestAnimationFrame(sample);
      };
      sample();
      const root = hydrateRoot(container, <AccentTheme />);
      await expect.poll(() => schemeStyles().length).toBe(1);
      await new Promise((resolve) => setTimeout(resolve, 100));
      sampling = false;

      expect(samples.length).toBeGreaterThan(2);
      expect(samples.every((value) => value.includes(themed))).toBe(true);
      expect(cacheSeen.every((value) => value !== null)).toBe(true);
      expect(document.querySelector(`style[${dynamicBootAttribute}]`)).toBeNull();
      root.unmount();
      container.remove();
    });
  });

  describe('useThemeTransition', () => {
    function Switcher({ onRender }: { onRender?: () => void }) {
      const [seed, setSeed] = useState(seedTeal);
      const transition = useThemeTransition();
      onRender?.();
      return (
        <DynamicTheme seed={seed}>
          <Swatch />
          <button type="button" onClick={() => transition(() => setSeed(seedCoral))}>
            Switch
          </button>
        </DynamicTheme>
      );
    }

    it('applies the new scheme inside the view transition', async () => {
      const original = document.startViewTransition.bind(document);
      let inside = '';
      const spy = vi.spyOn(document, 'startViewTransition').mockImplementation((callback) =>
        original(() => {
          (callback as () => void)();
          inside = background(document.querySelector('[data-testid="swatch"]')!);
        }),
      );
      try {
        const screen = await renderWithDS(<Switcher />);
        await screen.getByRole('button', { name: 'Switch' }).click();
        await expect.poll(() => spy.mock.calls.length).toBe(1);
        await expect.poll(() => inside).toBe(expected(seedCoral, 'light'));
      } finally {
        spy.mockRestore();
      }
    });

    it('switches without a view transition when motion is disabled', async () => {
      const spy = vi.spyOn(document, 'startViewTransition');
      try {
        const screen = await renderWithDS(<Switcher />, { provider: { motion: 'disabled' } });
        await screen.getByRole('button', { name: 'Switch' }).click();
        expect(spy).not.toHaveBeenCalled();
        expect(background(screen.getByTestId('swatch').element())).toBe(
          expected(seedCoral, 'light'),
        );
      } finally {
        spy.mockRestore();
      }
    });

    it('reports an update that throws instead of rejecting silently', async () => {
      const reported = vi.fn();
      window.addEventListener('error', reported);
      const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
      function Thrower() {
        const transition = useThemeTransition();
        return (
          <button
            type="button"
            onClick={() =>
              transition(() => {
                throw new Error('boom');
              })
            }
          >
            Throw
          </button>
        );
      }
      try {
        const screen = await render(
          <DSProvider>
            <Thrower />
          </DSProvider>,
        );
        await screen.getByRole('button', { name: 'Throw' }).click();
        await expect.poll(() => reported.mock.calls.length).toBe(1);
      } finally {
        window.removeEventListener('error', reported);
        errors.mockRestore();
      }
    });
  });

  it.each([
    ['light', {}],
    ['dark', { dark: true }],
    ['ar', { locale: 'ar' }],
  ] as const)('has no accessibility violations (%s)', async (_, options) => {
    const screen = await renderWithDS(
      <DynamicTheme seed={seedCoral} paletteStyle="vibrant" className="bg-surface p-4">
        <div className="rounded-md bg-primary-container p-3 text-on-primary-container">
          <p className="text-title-md">Workspace</p>
          <p className="text-body-sm">Plan renews on 1 December</p>
        </div>
        <button type="button" className="mt-2 rounded-full bg-primary px-4 py-2 text-on-primary">
          Upgrade
        </button>
      </DynamicTheme>,
      options,
    );
    await expectNoA11yViolations(screen.container);
  });
});
