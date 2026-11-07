import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { PreviewFrame } from '@/components/docs/preview-frame';

const code = <pre data-testid="example-code">{'<Button>Create</Button>'}</pre>;

function stage() {
  return document.querySelector<HTMLElement>('[data-slot="preview-stage"]');
}

function canvasColor() {
  const probe = document.createElement('div');
  probe.className = 'bg-canvas';
  stage()!.append(probe);
  const color = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return color;
}

describe('PreviewFrame', () => {
  it('renders the example on the canvas layer inside a raised frame', async () => {
    const screen = await renderWithDS(<PreviewFrame name="button-demo" code={code} />);

    await expect.element(screen.getByRole('button', { name: 'Create' })).toBeVisible();
    expect(stage()).toHaveAttribute('dir', 'ltr');
    expect(screen.getByRole('radiogroup', { name: 'Accent colour' }).query()).toBeNull();
    expect(getComputedStyle(stage()!).backgroundColor).toBe(canvasColor());
    const frame = document.querySelector<HTMLElement>('[data-preview="button-demo"]')!;
    expect(getComputedStyle(frame).borderTopWidth).toBe('1px');
    expect(getComputedStyle(frame).backgroundColor).not.toBe(
      getComputedStyle(stage()!).backgroundColor,
    );
  });

  it('mirrors the stage when RTL is chosen', async () => {
    const screen = await renderWithDS(<PreviewFrame name="button-demo" code={code} />);

    await screen.getByRole('radio', { name: 'RTL' }).click();
    await expect.poll(() => stage()?.getAttribute('dir')).toBe('rtl');
    await expect.element(screen.getByRole('radio', { name: 'RTL' })).toBeChecked();
  });

  it('shows the code on the Code tab and hides the stage controls', async () => {
    const plain = await renderWithDS(<PreviewFrame name="button-demo" />);
    await expect.element(plain.getByRole('tab', { name: 'Preview' })).toBeVisible();
    expect(plain.getByRole('tab', { name: 'Code' }).query()).toBeNull();
    await plain.unmount();

    const screen = await renderWithDS(<PreviewFrame name="button-demo" code={code} />);

    await screen.getByRole('tab', { name: 'Code' }).click();
    await expect.element(screen.getByTestId('example-code')).toBeVisible();
    expect(stage()).toBeNull();
    expect(screen.getByRole('radiogroup', { name: 'Direction' }).query()).toBeNull();
    expect(screen.getByRole('radiogroup', { name: 'Accent colour' }).query()).toBeNull();

    await screen.getByRole('tab', { name: 'Preview' }).click();
    await expect.element(screen.getByRole('radiogroup', { name: 'Direction' })).toBeVisible();
  });

  it('reports a missing example instead of failing', async () => {
    const screen = await renderWithDS(<PreviewFrame name="does-not-exist" />);

    await expect.element(screen.getByText('Missing example: does-not-exist')).toBeVisible();
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(<PreviewFrame name="button-demo" code={code} />, options);
      await expect.element(screen.getByRole('button', { name: 'Create' })).toBeVisible();
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
