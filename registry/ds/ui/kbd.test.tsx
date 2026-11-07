import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { DSProvider } from '@/registry/ds/ui/ds-provider';
import { Kbd, KbdCombo, resolveKbdKey, toAriaKeyShortcuts } from '@/registry/ds/ui/kbd';

function visibleText(element: Element) {
  return [...element.querySelectorAll('[data-slot="kbd"]')]
    .map((key) => {
      const glyph = key.querySelector('[data-slot="kbd-glyph"]');
      return glyph ? glyph.textContent : key.textContent;
    })
    .join(' ');
}

function spokenText(element: Element) {
  const clone = element.cloneNode(true) as Element;
  clone.querySelectorAll('[aria-hidden="true"]').forEach((node) => node.remove());
  return clone.textContent;
}

describe('Kbd', () => {
  it('renders a literal key in a kbd element on the size scale', async () => {
    const screen = await renderWithDS(
      <div>
        <Kbd>K</Kbd>
        <Kbd size="sm">J</Kbd>
      </div>,
    );
    const key = screen.getByText('K').element();
    expect(key.tagName).toBe('KBD');
    expect(key.getAttribute('data-variant')).toBe('soft');
    expect(key.getAttribute('data-size')).toBe('md');
    expect(key.getBoundingClientRect().height).toBe(24);
    const style = getComputedStyle(key);
    expect(style.borderTopLeftRadius).toBe('8px');
    expect(style.fontWeight).toBe('500');
    expect(style.fontSize).toBe('12px');
    expect(style.borderTopWidth).toBe('0px');
    const small = screen.getByText('J').element();
    expect(small.getBoundingClientRect().height).toBe(20);
    expect(getComputedStyle(small).borderTopLeftRadius).toBe('6px');
  });

  it('uses the sans font inside monospaced text', async () => {
    const screen = await renderWithDS(
      <p className="font-mono">
        <span data-testid="mono">x</span> <Kbd>K</Kbd>
      </p>,
    );
    const key = screen.getByText('K').element();
    expect(getComputedStyle(key).fontFamily).not.toBe(
      getComputedStyle(screen.getByTestId('mono').element()).fontFamily,
    );
  });

  it('paints the soft key on the neutral fill and the ghost key on nothing', async () => {
    const screen = await renderWithDS(
      <div className="flex gap-2">
        <Kbd>A</Kbd>
        <Kbd variant="ghost">B</Kbd>
        <span data-testid="probe" className="bg-neutral-soft" />
      </div>,
    );
    expect(getComputedStyle(screen.getByText('A').element()).backgroundColor).toBe(
      getComputedStyle(screen.getByTestId('probe').element()).backgroundColor,
    );
    expect(getComputedStyle(screen.getByText('B').element()).backgroundColor).toBe(
      'rgba(0, 0, 0, 0)',
    );
  });

  it('shows a glyph and speaks the English key name by default', async () => {
    const screen = await renderWithDS(
      <div data-testid="keys">
        <Kbd platform="apple">enter</Kbd>
        <Kbd platform="other">ArrowUp</Kbd>
        <Kbd platform="other">Esc</Kbd>
      </div>,
    );
    const keys = screen.getByTestId('keys').element();
    expect(visibleText(keys)).toBe('↩ ↑ Esc');
    expect(spokenText(keys)).toBe('EnterUp arrowEscape');
    expect(keys.querySelector('[data-key="escape"]')).not.toBeNull();
  });
});

describe('KbdCombo', () => {
  it('puts modifiers in Apple order on Apple platforms and keeps the given order elsewhere', async () => {
    const screen = await renderWithDS(
      <div>
        <KbdCombo data-testid="mac" keys={['mod', 'shift', 'alt', 'ctrl', 'P']} platform="apple" />
        <KbdCombo data-testid="windows" keys={['mod', 'shift', 'P']} platform="other" />
      </div>,
    );
    const mac = screen.getByTestId('mac').element();
    expect(mac.tagName).toBe('KBD');
    expect(mac.getAttribute('data-platform')).toBe('apple');
    expect(visibleText(mac)).toBe('⌃ ⌥ ⇧ ⌘ P');
    expect(spokenText(mac)).toBe('Control+Option+Shift+Command+P');
    const windows = screen.getByTestId('windows').element();
    expect(windows.getAttribute('data-platform')).toBe('other');
    expect(visibleText(windows)).toBe('Ctrl Shift P');
    expect(spokenText(windows)).toBe('Control+Shift+P');
  });

  it('keeps the modifier first in right-to-left text', async () => {
    const screen = await renderWithDS(
      <p>
        اضغط <KbdCombo data-testid="combo" keys={['mod', 'K']} platform="other" /> للبحث
      </p>,
      { locale: 'ar' },
    );
    const combo = screen.getByTestId('combo').element();
    expect(combo.getAttribute('dir')).toBe('ltr');
    const [modifier, letter] = combo.querySelectorAll('[data-slot="kbd"]');
    expect(modifier.getBoundingClientRect().left).toBeLessThan(letter.getBoundingClientRect().left);
  });

  it('takes modifier names from DSProvider, with the labels prop on top', async () => {
    const overrides = {
      command: 'Command key',
      control: 'Control key',
      option: 'Option key',
      shift: 'Shift key',
      controlShort: 'Ctl',
      shiftShort: 'Shft',
    };
    const screen = await renderWithDS(
      <div>
        <KbdCombo data-testid="windows" keys={['mod', 'shift', 'S']} platform="other" />
        <KbdCombo data-testid="mac" keys={['mod', 'option', 'S']} platform="apple" />
        <KbdCombo
          data-testid="override"
          keys={['mod', 'S']}
          platform="other"
          labels={{ controlShort: 'Ctrl', control: 'Control' }}
        />
        <span data-testid="key">
          <Kbd platform="other" labels={{ deleteShort: 'Del key', delete: 'Delete key' }}>
            delete
          </Kbd>
        </span>
      </div>,
      { provider: { labels: { kbd: overrides } } },
    );
    const windows = screen.getByTestId('windows').element();
    const mac = screen.getByTestId('mac').element();
    const override = screen.getByTestId('override').element();
    expect(visibleText(windows)).toBe('Ctl Shft S');
    expect(spokenText(windows)).toBe('Control key+Shift key+S');
    expect(visibleText(mac)).toBe('⌥ ⌘ S');
    expect(spokenText(mac)).toBe('Option key+Command key+S');
    expect(visibleText(override)).toBe('Ctrl S');
    expect(spokenText(override)).toBe('Control+S');
    const key = screen.getByTestId('key').element();
    expect(visibleText(key)).toBe('Del key');
    expect(spokenText(key)).toBe('Delete key');
  });

  it('hydrates server HTML without a mismatch, then shows the detected platform', async () => {
    const ui = (
      <DSProvider locale="en">
        <KbdCombo keys={['mod', 'K']} />
      </DSProvider>
    );
    const container = document.createElement('div');
    container.innerHTML = renderToString(ui);
    document.body.append(container);
    expect(visibleText(container)).toBe('Ctrl K');
    expect(container.querySelector('[data-slot="kbd-combo"]')!.hasAttribute('data-platform')).toBe(
      false,
    );

    const onRecoverableError = vi.fn();
    const root = hydrateRoot(container, ui, { onRecoverableError });
    const isApple = /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent);
    await expect
      .poll(() => container.querySelector('[data-slot="kbd-combo"]')!.getAttribute('data-platform'))
      .toBe(isApple ? 'apple' : 'other');
    expect(visibleText(container)).toBe(isApple ? '⌘ K' : 'Ctrl K');
    expect(onRecoverableError).not.toHaveBeenCalled();
    root.unmount();
    container.remove();
  });

  it('shows a visible separator without changing what is spoken', async () => {
    const screen = await renderWithDS(
      <KbdCombo data-testid="combo" keys={['mod', 'D']} platform="other" separator="+" />,
    );
    const combo = screen.getByTestId('combo').element();
    const separator = combo.querySelector('[data-slot="kbd-separator"]')!;
    expect(separator.textContent).toBe('+');
    expect(separator.getAttribute('aria-hidden')).toBe('true');
    expect(spokenText(combo)).toBe('Control+D');
  });

  it('passes variant and size to every key', async () => {
    const screen = await renderWithDS(
      <KbdCombo data-testid="combo" keys={['mod', 'K']} variant="ghost" size="sm" />,
    );
    const keys = screen.getByTestId('combo').element().querySelectorAll('[data-slot="kbd"]');
    for (const key of keys) {
      expect(key.getAttribute('data-variant')).toBe('ghost');
      expect(key.getAttribute('data-size')).toBe('sm');
    }
  });
});

describe('Kbd helpers', () => {
  it('resolves key names and aliases case-insensitively', () => {
    expect(resolveKbdKey('Ctrl')).toBe('control');
    expect(resolveKbdKey('cmd')).toBe('command');
    expect(resolveKbdKey('ArrowLeft')).toBe('left');
    expect(resolveKbdKey('return')).toBe('enter');
    expect(resolveKbdKey('K')).toBeUndefined();
    expect(resolveKbdKey('constructor')).toBeUndefined();
  });

  it('builds aria-keyshortcuts for both platforms when mod is used', () => {
    expect(toAriaKeyShortcuts(['mod', 'K'])).toBe('Meta+K Control+K');
    expect(toAriaKeyShortcuts(['shift', 'ArrowDown'])).toBe('Shift+ArrowDown');
    expect(toAriaKeyShortcuts(['alt', 'enter'])).toBe('Alt+Enter');
  });
});

describe('Kbd accessibility', () => {
  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-4 p-4">
          {(['soft', 'ghost'] as const).map((variant) => (
            <p key={variant} className="flex flex-wrap items-center gap-3 text-sm">
              <KbdCombo keys={['mod', 'shift', 'P']} variant={variant} platform="apple" />
              <KbdCombo keys={['mod', 'K']} variant={variant} size="sm" platform="other" />
              <Kbd variant={variant}>escape</Kbd>
              <Kbd variant={variant} size="sm">
                /
              </Kbd>
            </p>
          ))}
          <div className="rounded-item bg-surface-raised p-2 text-on-surface-variant">
            <KbdCombo keys={['mod', 'D']} variant="ghost" separator="+" />
          </div>
          <div className="rounded-item bg-surface-overlay p-2">
            <KbdCombo keys={['mod', 'shift', 'K']} size="sm" platform="other" />
          </div>
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
