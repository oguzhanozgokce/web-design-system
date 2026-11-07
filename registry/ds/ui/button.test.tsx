import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { AddIcon } from '@/registry/ds/lib/icons';
import { Button, ButtonLink } from '@/registry/ds/ui/button';

describe('Button', () => {
  it('defaults the tone to primary for solid and to neutral for the quieter variants', async () => {
    const screen = await renderWithDS(
      <>
        <Button startIcon={<AddIcon />}>Solid</Button>
        <Button variant="soft">Soft</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="ghost" tone="error">
          Remove
        </Button>
      </>,
    );
    for (const [name, tone] of [
      ['Solid', 'primary'],
      ['Soft', 'neutral'],
      ['Outline', 'neutral'],
      ['Ghost', 'neutral'],
      ['Remove', 'error'],
    ] as const) {
      await expect.element(screen.getByRole('button', { name })).toHaveAttribute('data-tone', tone);
    }
    const solid = screen.getByRole('button', { name: 'Solid' });
    await expect.element(solid).toHaveAttribute('data-variant', 'solid');
    await expect.element(solid).toHaveAttribute('data-size', 'md');
  });

  it('is 32, 40 and 48 pixels tall at sm, md and lg', async () => {
    const screen = await renderWithDS(
      <>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </>,
    );
    for (const [name, height] of [
      ['Small', 32],
      ['Medium', 40],
      ['Large', 48],
    ] as const) {
      const element = screen.getByRole('button', { name }).element();
      expect(element.getBoundingClientRect().height).toBe(height);
    }
  });

  it('stays pending while an async onPress runs and blocks repeat presses', async () => {
    let finish: () => void = () => {};
    const onPress = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const screen = await renderWithDS(<Button onPress={onPress}>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });

    await button.click();
    await expect.element(button).toHaveAttribute('data-pending', 'true');
    await expect.element(screen.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument();

    await button.click({ force: true });
    expect(onPress).toHaveBeenCalledOnce();

    finish();
    await expect.element(button).not.toHaveAttribute('data-pending');
  });

  it('takes its pending label from labels, then DSProvider, then the English default', async () => {
    const screen = await renderWithDS(
      <>
        <Button isPending>Save</Button>
        <Button isPending labels={{ pending: 'Saving changes' }}>
          Save changes
        </Button>
      </>,
      { provider: { labels: { button: { pending: 'Working' } } } },
    );
    await expect.element(screen.getByRole('progressbar', { name: 'Working' })).toBeInTheDocument();
    await expect
      .element(screen.getByRole('progressbar', { name: 'Saving changes' }))
      .toBeInTheDocument();
  });

  it('honours provider reduced motion for press scale and disabled motion for pending fades', async () => {
    for (const motion of ['reduced', 'disabled'] as const) {
      const screen = await renderWithDS(
        <>
          <Button isPending>Save</Button>
          <ButtonLink href="/docs">Docs</ButtonLink>
        </>,
        { provider: { motion } },
      );
      for (const control of [
        screen.getByRole('button', { name: 'Save' }),
        screen.getByRole('link', { name: 'Docs' }),
      ]) {
        const element = control.element();
        element.style.transition = 'none';
        element.setAttribute('data-pressed', 'true');
        expect(getComputedStyle(element).scale).toBe('1');
      }
      if (motion === 'disabled') {
        expect(
          getComputedStyle(screen.container.querySelector('[data-slot="pending"]')!).animationName,
        ).toBe('none');
        expect(
          getComputedStyle(screen.container.querySelector('[data-slot="content"]')!)
            .transitionDuration,
        ).toBe('0s');
      }
      await screen.unmount();
    }
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-wrap gap-2 p-4">
          {(['solid', 'soft', 'outline', 'ghost'] as const).map((variant) =>
            (['primary', 'neutral', 'error'] as const).map((tone) => (
              <Button key={`${variant}-${tone}`} variant={variant} tone={tone}>
                {variant === 'solid' && tone === 'error' ? 'Delete' : `${variant} ${tone}`}
              </Button>
            )),
          )}
          <ButtonLink href="/docs" variant="outline">
            Docs
          </ButtonLink>
        </div>,
        options,
      );
      await expect.element(screen.getByRole('button', { name: 'Delete' })).toBeVisible();
      await expect
        .element(screen.getByTestId('ds-root'))
        .toHaveAttribute('dir', options.locale === 'ar' ? 'rtl' : 'ltr');
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
