import { useState } from 'react';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { CloseIcon, MailIcon } from '@/registry/ds/lib/icons';
import { Switch } from '@/registry/ds/ui/switch';

function part(slot: string, root: ParentNode = document) {
  return root.querySelector<HTMLElement>(`[data-slot="${slot}"]`);
}

function hasHoverLayer(element: HTMLElement) {
  const layer = getComputedStyle(element, '::before');
  return layer.content !== 'none' && layer.opacity !== '0';
}

function relativeLuminance(color: string) {
  const context = document.createElement('canvas').getContext('2d')!;
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [red, green, blue] = Array.from(context.getImageData(0, 0, 1, 1).data.slice(0, 3)).map(
    (channel) => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    },
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(first: string, second: string) {
  const [lighter, darker] = [relativeLuminance(first), relativeLuminance(second)].sort(
    (a, b) => b - a,
  );
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Switch', () => {
  it('renders an accessible switch that toggles on click', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(<Switch onChange={onChange}>Auto-renew subscription</Switch>);
    const control = screen.getByRole('switch', { name: 'Auto-renew subscription' });
    await expect.element(control).not.toBeChecked();

    await screen.getByText('Auto-renew subscription').click();
    await expect.element(control).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(part('switch')?.getAttribute('data-variant')).toBe('default');
    expect(part('switch')?.getAttribute('data-label-placement')).toBe('end');
  });

  it('toggles with the keyboard and shows the focus ring on the track', async () => {
    const screen = await renderWithDS(<Switch>Maintenance mode</Switch>);
    await userEvent.tab();
    await userEvent.keyboard('[Space]');
    await expect.element(screen.getByRole('switch', { name: 'Maintenance mode' })).toBeChecked();
    expect(part('track')?.hasAttribute('data-focus-visible')).toBe(true);
  });

  it('supports controlled state', async () => {
    function Controlled() {
      const [selected, setSelected] = useState(true);
      return (
        <>
          <Switch isSelected={selected} onChange={setSelected}>
            Payout alerts
          </Switch>
          <output>{selected ? 'on' : 'off'}</output>
        </>
      );
    }
    const screen = await renderWithDS(<Controlled />);
    await screen.getByText('Payout alerts').click();
    await expect.element(screen.getByRole('status')).toHaveTextContent('off');
  });

  it('grows the handle and shows a check when selected', async () => {
    const screen = await renderWithDS(<Switch>Show cents</Switch>, {
      provider: { motion: 'disabled' },
    });
    expect(part('handle')?.getBoundingClientRect().width).toBe(16);
    expect(part('handle-icon')).toBeNull();

    await screen.getByText('Show cents').click();
    await expect.element(screen.getByRole('switch')).toBeChecked();
    expect(part('handle')?.getBoundingClientRect().width).toBe(24);
    expect(part('handle-icon')?.querySelector('svg')).not.toBeNull();
  });

  it('renders the unselected icon and lets the selected icon be removed', async () => {
    const screen = await renderWithDS(
      <div>
        <div data-testid="crossed">
          <Switch unselectedIcon={<CloseIcon data-testid="cross" />}>Check and cross</Switch>
        </div>
        <div data-testid="plain">
          <Switch defaultSelected selectedIcon={null}>
            No icon
          </Switch>
        </div>
      </div>,
      { provider: { motion: 'disabled' } },
    );
    await expect.element(screen.getByTestId('cross')).toBeInTheDocument();
    const crossed = screen.getByTestId('crossed').element();
    expect(part('handle', crossed)?.getBoundingClientRect().width).toBe(24);
    const plain = screen.getByTestId('plain').element();
    expect(part('handle-icon', plain)).toBeNull();
  });

  it.each([
    ['en', 36],
    ['ar', 16],
  ])('moves the selected handle to the end in %s', async (locale, center) => {
    await renderWithDS(<Switch defaultSelected>Dark theme</Switch>, {
      locale,
      provider: { motion: 'disabled' },
    });
    const track = part('track')!.getBoundingClientRect();
    const handle = part('handle')!.getBoundingClientRect();
    expect(handle.left + handle.width / 2 - track.left).toBe(center);
  });

  it('places the label at the start', async () => {
    await renderWithDS(<Switch labelPlacement="start">Round to whole units</Switch>);
    const target = part('target')!;
    expect(target.lastElementChild?.getAttribute('data-slot')).toBe('track');
    expect(part('switch')?.getAttribute('data-label-placement')).toBe('start');
  });

  it('toggles a settings row from its description and keeps the name short', async () => {
    const screen = await renderWithDS(
      <Switch
        variant="row"
        icon={<MailIcon />}
        description="A summary of last week's revenue every Monday."
      >
        Weekly summary email
      </Switch>,
    );
    const control = screen.getByRole('switch');
    await expect.element(control).toHaveAccessibleName('Weekly summary email');
    await expect
      .element(control)
      .toHaveAccessibleDescription("A summary of last week's revenue every Monday.");
    await screen.getByText("A summary of last week's revenue every Monday.").click();
    await expect.element(control).toBeChecked();
    expect(part('state-layer')).toBeNull();
    expect(part('icon')).not.toBeNull();
  });

  it('does not toggle when disabled', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <Switch isDisabled onChange={onChange}>
        Allow guest checkout
      </Switch>,
    );
    await expect.element(screen.getByRole('switch')).toBeDisabled();
    await screen.getByText('Allow guest checkout').click({ force: true });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('grows the handle to 28px while pressed', async () => {
    await renderWithDS(<Switch>Show cents</Switch>, { provider: { motion: 'disabled' } });
    await userEvent.tab();
    await userEvent.keyboard('{Space>}');
    expect(part('handle')?.getBoundingClientRect().width).toBe(28);
    await userEvent.keyboard('{/Space}');
    expect(part('handle')?.getBoundingClientRect().width).toBe(24);
  });

  it.each([
    ['system', 'inset-inline-start'],
    ['reduced', 'none'],
  ] as const)('slides the handle with motion %s', async (motion, transitionProperty) => {
    await renderWithDS(<Switch defaultSelected>Dark theme</Switch>, { provider: { motion } });
    expect(getComputedStyle(part('thumb')!).transitionProperty).toBe(transitionProperty);
  });

  it('draws the focus ring inside a settings row', async () => {
    await renderWithDS(
      <Switch variant="row" description="Every Monday.">
        Weekly summary email
      </Switch>,
    );
    await userEvent.tab();
    const target = part('target')!;
    expect(target.hasAttribute('data-focus-visible')).toBe(true);
    expect(getComputedStyle(target).outlineWidth).toBe('3px');
    expect(getComputedStyle(target).outlineOffset).toBe('-3px');
    expect(part('track')?.hasAttribute('data-focus-visible')).toBe(false);
  });

  it('keeps an explicit aria-label when a description is present', async () => {
    const screen = await renderWithDS(
      <Switch aria-label="Weekly summary email for Finance" description="Every Monday.">
        Weekly summary
      </Switch>,
    );
    await expect
      .element(screen.getByRole('switch'))
      .toHaveAccessibleName('Weekly summary email for Finance');
  });

  it('does not toggle when read-only', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <Switch isReadOnly defaultSelected onChange={onChange}>
        Single sign-on
      </Switch>,
    );
    await screen.getByText('Single sign-on').click();
    expect(onChange).not.toHaveBeenCalled();
    await expect.element(screen.getByRole('switch')).toBeChecked();
  });

  it('keeps a default switch to its own width and stretches a settings row', async () => {
    const onChange = vi.fn();
    await renderWithDS(
      <div style={{ width: 600 }}>
        <div data-testid="default">
          <Switch onChange={onChange}>Show cents</Switch>
        </div>
        <div data-testid="row">
          <Switch variant="row">Weekly summary email</Switch>
        </div>
      </div>,
    );
    const inline = document.querySelector<HTMLElement>('[data-testid="default"]')!;
    expect(part('target', inline)!.getBoundingClientRect().width).toBeLessThan(250);
    const row = document.querySelector<HTMLElement>('[data-testid="row"]')!;
    expect(part('target', row)!.getBoundingClientRect().width).toBe(600);

    await page.elementLocator(part('switch', inline)!).click({ position: { x: 580, y: 16 } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows the hover layer on an editable row but not on a read-only one', async () => {
    await renderWithDS(
      <div className="flex flex-col gap-4">
        <div data-testid="editable">
          <Switch variant="row">Weekly summary email</Switch>
        </div>
        <div data-testid="read-only">
          <Switch variant="row" isReadOnly defaultSelected>
            Single sign-on
          </Switch>
        </div>
      </div>,
    );
    const editable = part('target', document.querySelector('[data-testid="editable"]')!)!;
    const readOnly = part('target', document.querySelector('[data-testid="read-only"]')!)!;

    await page.elementLocator(editable).hover();
    await expect.poll(() => getComputedStyle(editable, '::before').opacity).toBe('0.08');

    await page.elementLocator(readOnly).hover();
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(readOnly.hasAttribute('data-readonly')).toBe(true);
    expect(hasHoverLayer(readOnly)).toBe(false);
  });

  it('shows an error message when invalid', async () => {
    const screen = await renderWithDS(
      <Switch isInvalid errorMessage="Accept the terms before going live.">
        Publish the store
      </Switch>,
    );
    const control = screen.getByRole('switch', { name: 'Publish the store' });
    await expect.element(control).toHaveAttribute('aria-invalid', 'true');
    await expect
      .element(control)
      .toHaveAccessibleDescription('Accept the terms before going live.');
    expect(part('error')?.textContent).toBe('Accept the terms before going live.');
  });

  it.each([
    ['light', {}],
    ['dark', { dark: true }],
  ])('draws the selected check so it stands out from the handle in %s', async (_, options) => {
    await renderWithDS(<Switch defaultSelected>Email receipts</Switch>, {
      ...options,
      provider: { motion: 'disabled' },
    });
    const handle = part('handle')!;
    const glyph = part('handle-icon')!.querySelector('svg')!;
    expect(
      contrastRatio(getComputedStyle(glyph).color, getComputedStyle(handle).backgroundColor),
    ).toBeGreaterThanOrEqual(3);
  });

  it.each([
    ['light', {}],
    ['dark', { dark: true }],
    ['RTL', { locale: 'ar' }],
  ])('has no accessibility violations in %s', async (_, options) => {
    const screen = await renderWithDS(
      <div className="flex flex-col gap-6 p-6">
        <Switch defaultSelected>Auto-renew subscription</Switch>
        <Switch description="Members confirm a code when they sign in.">
          Require two-factor sign-in
        </Switch>
        <Switch labelPlacement="start" unselectedIcon={<CloseIcon />}>
          Round totals
        </Switch>
        <Switch isDisabled defaultSelected>
          Single sign-on
        </Switch>
        <Switch isDisabled>Guest checkout</Switch>
        <Switch isInvalid errorMessage="Accept the terms before going live.">
          Publish the store
        </Switch>
        <div className="rounded-lg bg-surface-container-low p-2">
          <Switch variant="row" icon={<MailIcon />} description="Every Monday." defaultSelected>
            Weekly summary email
          </Switch>
        </div>
      </div>,
      options,
    );
    await expect
      .element(screen.getByRole('switch', { name: 'Auto-renew subscription' }))
      .toBeChecked();
    expect(screen.container.querySelectorAll('[role="switch"]')).toHaveLength(7);
    await expectNoA11yViolations(screen.container);
  });
});
