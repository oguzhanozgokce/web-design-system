import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { AddIcon } from '@/registry/ds/lib/icons';
import { Button, ButtonLink } from '@/registry/ds/ui/button';

describe('Button', () => {
  it('renders an accessible button with its label', async () => {
    const screen = await renderWithDS(<Button startIcon={<AddIcon />}>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    await expect.element(button).toBeVisible();
    await expect.element(button).toHaveAttribute('data-variant', 'filled');
    await expect.element(button).toHaveAttribute('data-size', 'md');
  });

  it('calls onPress', async () => {
    const onPress = vi.fn();
    const screen = await renderWithDS(<Button onPress={onPress}>Save</Button>);
    await screen.getByRole('button', { name: 'Save' }).click();
    expect(onPress).toHaveBeenCalledOnce();
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
        <Button isPending labels={{ pending: 'Kaydediliyor' }}>
          Kaydet
        </Button>
      </>,
      { provider: { labels: { button: { pending: 'Yükleniyor' } } } },
    );
    await expect
      .element(screen.getByRole('progressbar', { name: 'Yükleniyor' }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole('progressbar', { name: 'Kaydediliyor' }))
      .toBeInTheDocument();
  });

  it('says Loading by default', async () => {
    const screen = await renderWithDS(<Button isPending>Save</Button>);
    await expect.element(screen.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument();
  });

  it('does not fire when disabled', async () => {
    const onPress = vi.fn();
    const screen = await renderWithDS(
      <Button isDisabled onPress={onPress}>
        Save
      </Button>,
    );
    await screen.getByRole('button', { name: 'Save' }).click({ force: true });
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders ButtonLink as a link', async () => {
    const screen = await renderWithDS(
      <ButtonLink href="/docs" variant="outlined">
        Docs
      </ButtonLink>,
    );
    await expect
      .element(screen.getByRole('link', { name: 'Docs' }))
      .toHaveAttribute('href', '/docs');
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-wrap gap-2 p-4">
          {(['filled', 'tonal', 'outlined', 'text', 'elevated'] as const).map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
          {(['filled', 'tonal', 'outlined', 'text', 'elevated'] as const).map((variant) => (
            <Button key={`destructive-${variant}`} variant={variant} tone="destructive">
              {variant === 'filled' ? 'Delete' : `Delete ${variant}`}
            </Button>
          ))}
          <ButtonLink href="/docs" variant="outlined">
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
