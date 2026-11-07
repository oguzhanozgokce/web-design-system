import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { CheckIcon, CloseIcon, MailIcon } from '@/registry/ds/lib/icons';
import { Switch } from '@/registry/ds/ui/switch';

function part(slot: string, root: ParentNode = document) {
  return root.querySelector<HTMLElement>(`[data-slot="${slot}"]`);
}

function parts(slot: string, root: ParentNode = document) {
  return [...root.querySelectorAll<HTMLElement>(`[data-slot="${slot}"]`)];
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

const still = { provider: { motion: 'disabled' as const } };

describe('Switch', () => {
  it('sizes the track at 48 by 24 and 40 by 20 pixels', async () => {
    await renderWithDS(
      <>
        <Switch>Default</Switch>
        <Switch size="sm">Compact</Switch>
      </>,
    );
    const [md, sm] = parts('track').map((track) => track.getBoundingClientRect());
    expect([md.width, md.height]).toEqual([48, 24]);
    expect([sm.width, sm.height]).toEqual([40, 20]);
    const [mdThumb, smThumb] = parts('thumb').map((thumb) => thumb.getBoundingClientRect());
    expect([mdThumb.width, mdThumb.height]).toEqual([28, 20]);
    expect([smThumb.width, smThumb.height]).toEqual([22, 16]);
    expect(parts('switch').map((root) => root.getAttribute('data-size'))).toEqual(['md', 'sm']);
    expect(part('switch')?.getAttribute('data-variant')).toBe('default');
    expect(part('switch')?.getAttribute('data-label-placement')).toBe('end');
  });

  it('fills the track with the solid primary when on and a grey when off', async () => {
    const screen = await renderWithDS(
      <>
        <span data-testid="primary" className="bg-primary-solid" />
        <span data-testid="grey" className="bg-outline-variant" />
        <span data-testid="thumb" className="bg-surface-thumb" />
        <Switch defaultSelected>On</Switch>
        <Switch>Off</Switch>
      </>,
      still,
    );
    const fill = (testId: string) =>
      getComputedStyle(screen.getByTestId(testId).element()).backgroundColor;
    const [on, off] = parts('track');
    expect(getComputedStyle(on).backgroundColor).toBe(fill('primary'));
    expect(getComputedStyle(off).backgroundColor).toBe(fill('grey'));
    expect(on.getAttribute('data-selected')).toBe('true');
    for (const thumb of parts('thumb')) {
      expect(getComputedStyle(thumb).backgroundColor).toBe(fill('thumb'));
    }

    await page.elementLocator(off).hover();
    await expect.poll(() => getComputedStyle(off).backgroundColor).not.toBe(fill('grey'));
    await page.elementLocator(on).hover();
    await expect.poll(() => getComputedStyle(on).backgroundColor).not.toBe(fill('primary'));
  });

  it('shows no icon by default and the icons it is given', async () => {
    const screen = await renderWithDS(
      <div>
        <div data-testid="plain">
          <Switch defaultSelected>No icon</Switch>
        </div>
        <div data-testid="icons">
          <Switch
            selectedIcon={<CheckIcon data-testid="check" />}
            unselectedIcon={<CloseIcon data-testid="cross" />}
          >
            Check and cross
          </Switch>
        </div>
      </div>,
      still,
    );
    expect(part('thumb-icon', screen.getByTestId('plain').element())).toBeNull();
    await expect.element(screen.getByTestId('cross')).toBeInTheDocument();
    await screen.getByText('Check and cross').click();
    await expect.element(screen.getByTestId('check')).toBeInTheDocument();
    await expect.element(screen.getByTestId('cross')).not.toBeInTheDocument();
  });

  it.each([
    ['en', 32],
    ['ar', 16],
  ])('moves the selected thumb to the end in %s', async (locale, center) => {
    await renderWithDS(<Switch defaultSelected>Dark theme</Switch>, { locale, ...still });
    const track = part('track')!.getBoundingClientRect();
    const thumb = part('thumb')!.getBoundingClientRect();
    expect(thumb.left + thumb.width / 2 - track.left).toBe(center);
  });

  it('places the label at the start', async () => {
    await renderWithDS(<Switch labelPlacement="start">Round corners</Switch>);
    const target = part('target')!;
    expect(target.lastElementChild?.getAttribute('data-slot')).toBe('track');
    expect(part('switch')?.getAttribute('data-label-placement')).toBe('start');
  });

  it('toggles a settings row from its description and keeps the name short', async () => {
    const screen = await renderWithDS(
      <>
        <Switch
          variant="row"
          icon={<MailIcon />}
          description="A summary of last week every Monday."
        >
          Weekly summary email
        </Switch>
        <Switch aria-label="Monthly report for the Design team" description="First of the month.">
          Monthly report
        </Switch>
      </>,
    );
    const control = screen.getByRole('switch', { name: 'Weekly summary email', exact: true });
    await expect
      .element(control)
      .toHaveAccessibleDescription('A summary of last week every Monday.');
    await screen.getByText('A summary of last week every Monday.').click();
    await expect.element(control).toBeChecked();
    expect(part('icon')).not.toBeNull();
    await expect
      .element(screen.getByRole('switch', { name: 'Monthly report for the Design team' }))
      .toHaveAccessibleDescription('First of the month.');
  });
  it('widens the thumb by 4px while pressed', async () => {
    await renderWithDS(<Switch defaultSelected>Show seconds</Switch>, still);
    const track = part('track')!;
    await userEvent.tab();
    await userEvent.keyboard('{Space>}');
    const pressed = part('thumb')!.getBoundingClientRect();
    expect(pressed.width).toBe(32);
    expect(track.getBoundingClientRect().right - pressed.right).toBe(2);
    await userEvent.keyboard('{/Space}');
    expect(part('thumb')?.getBoundingClientRect().width).toBe(28);
  });

  it('slides the thumb without a transition when motion is reduced', async () => {
    await renderWithDS(<Switch defaultSelected>Dark theme</Switch>, {
      provider: { motion: 'reduced' },
    });
    expect(getComputedStyle(part('thumb')!).transitionProperty).toBe('none');
  });
  it('draws the focus ring on the track, and inside a settings row', async () => {
    await renderWithDS(
      <>
        <Switch>Maintenance mode</Switch>
        <Switch variant="row" description="Every Monday.">
          Weekly summary email
        </Switch>
      </>,
    );
    const [inline, row] = parts('switch');
    await userEvent.tab();
    const track = part('track', inline)!;
    expect(track.hasAttribute('data-focus-visible')).toBe(true);
    expect(getComputedStyle(track).outlineWidth).toBe('2px');

    await userEvent.tab();
    const target = part('target', row)!;
    expect(target.hasAttribute('data-focus-visible')).toBe(true);
    expect(getComputedStyle(target).outlineWidth).toBe('2px');
    expect(getComputedStyle(target).outlineOffset).toBe('-2px');
    expect(part('track', row)?.hasAttribute('data-focus-visible')).toBe(false);
  });
  it('keeps a default switch to its own width and stretches a settings row', async () => {
    const onChange = vi.fn();
    await renderWithDS(
      <div style={{ width: 600 }}>
        <div data-testid="default">
          <Switch onChange={onChange}>Show seconds</Switch>
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

    await page.elementLocator(part('switch', inline)!).click({ position: { x: 580, y: 12 } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('fills an editable row on hover but not a read-only one', async () => {
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
      still,
    );
    const editable = part('target', document.querySelector('[data-testid="editable"]')!)!;
    const readOnly = part('target', document.querySelector('[data-testid="read-only"]')!)!;
    const resting = getComputedStyle(editable).backgroundColor;
    const readOnlyResting = getComputedStyle(readOnly).backgroundColor;

    await page.elementLocator(editable).hover();
    await expect.poll(() => getComputedStyle(editable).backgroundColor).not.toBe(resting);

    await page.elementLocator(readOnly).hover();
    expect(readOnly.hasAttribute('data-readonly')).toBe(true);
    expect(getComputedStyle(readOnly).backgroundColor).toBe(readOnlyResting);
  });

  it('shows an error message when invalid', async () => {
    const screen = await renderWithDS(
      <Switch isInvalid errorMessage="Accept the terms before going live.">
        Publish the site
      </Switch>,
    );
    const control = screen.getByRole('switch', { name: 'Publish the site' });
    await expect.element(control).toHaveAttribute('aria-invalid', 'true');
    await expect
      .element(control)
      .toHaveAccessibleDescription('Accept the terms before going live.');
    expect(part('error')?.textContent).toBe('Accept the terms before going live.');
  });

  it.each([
    ['light', {}],
    ['dark', { dark: true }],
  ])('draws thumb icons that stand out from the thumb in %s', async (_, options) => {
    const screen = await renderWithDS(
      <>
        <Switch defaultSelected selectedIcon={<CheckIcon />}>
          Email comments
        </Switch>
        <Switch unselectedIcon={<CloseIcon />}>Push comments</Switch>
      </>,
      { ...options, ...still },
    );
    await expect.element(screen.getByRole('switch', { name: 'Email comments' })).toBeChecked();
    const thumbs = parts('thumb');
    expect(thumbs).toHaveLength(2);
    for (const thumb of thumbs) {
      const glyph = part('thumb-icon', thumb)!;
      expect(
        contrastRatio(getComputedStyle(glyph).color, getComputedStyle(thumb).backgroundColor),
      ).toBeGreaterThanOrEqual(3);
    }
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-6 p-6">
          <Switch defaultSelected>Auto-update apps</Switch>
          <Switch description="Members confirm a code when they sign in.">
            Require two-factor sign-in
          </Switch>
          <Switch labelPlacement="start" size="sm" unselectedIcon={<CloseIcon />}>
            Round corners
          </Switch>
          <Switch isDisabled defaultSelected>
            Single sign-on
          </Switch>
          <Switch isDisabled>Guest access</Switch>
          <Switch isInvalid errorMessage="Accept the terms before going live.">
            Publish the site
          </Switch>
          <div className="rounded-container bg-surface-raised p-1">
            <Switch variant="row" icon={<MailIcon />} description="Every Monday." defaultSelected>
              Weekly summary email
            </Switch>
          </div>
        </div>,
        options,
      );
      await expect.element(screen.getByRole('switch', { name: 'Auto-update apps' })).toBeChecked();
      expect(screen.container.querySelectorAll('[role="switch"]')).toHaveLength(7);
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
