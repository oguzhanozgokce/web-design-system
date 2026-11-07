import { cdp } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { Button } from '@/registry/ds/ui/button';
import { Divider, OrDivider } from '@/registry/ds/ui/divider';

describe('Divider', () => {
  it('renders a horizontal hr separator by default', async () => {
    const screen = await renderWithDS(
      <div className="flex w-80 flex-col">
        <span>Sharing</span>
        <Divider />
        <span>Members</span>
      </div>,
    );
    const separator = screen.getByRole('separator');
    await expect.element(separator).toBeInTheDocument();
    expect(separator.element().tagName).toBe('HR');
    await expect.element(separator).toHaveAttribute('data-orientation', 'horizontal');
    await expect.element(separator).toHaveAttribute('data-inset', 'none');
    await expect.element(separator).toHaveAttribute('data-variant', 'subtle');
    const box = separator.element().getBoundingClientRect();
    expect(box.width).toBe(320);
    expect(box.height).toBe(1);
  });

  it('draws a 1px fill in the outline role, and in CanvasText under forced colours', async () => {
    const screen = await renderWithDS(
      <div className="flex w-80 flex-col gap-2">
        <Divider data-testid="subtle" />
        <Divider variant="strong" data-testid="strong" />
        <Divider variant="strong" data-testid="labelled">
          Older
        </Divider>
        <span data-testid="subtle-probe" className="bg-outline-subtle" />
        <span data-testid="strong-probe" className="bg-outline-variant" />
      </div>,
    );
    const style = (id: string) => getComputedStyle(screen.getByTestId(id).element());
    expect(style('subtle').backgroundColor).toBe(style('subtle-probe').backgroundColor);
    expect(style('subtle').borderTopWidth).toBe('0px');
    expect(style('strong').backgroundColor).toBe(style('strong-probe').backgroundColor);
    await expect.element(screen.getByTestId('strong')).toHaveAttribute('data-variant', 'strong');
    const line = screen
      .getByTestId('labelled')
      .element()
      .querySelector('[data-slot="divider-line"]')!;
    expect(getComputedStyle(line).backgroundColor).toBe(style('strong-probe').backgroundColor);
    expect(line.getBoundingClientRect().height).toBe(1);

    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'forced-colors', value: 'active' }],
    });
    try {
      const canvas = getComputedStyle(document.body).backgroundColor;
      expect(style('subtle').backgroundColor).not.toBe(canvas);
      expect(getComputedStyle(line).backgroundColor).not.toBe(canvas);
    } finally {
      await cdp().send('Emulation.setEmulatedMedia', { features: [] });
    }
  });

  it('renders a vertical separator that stretches to the row height', async () => {
    const screen = await renderWithDS(
      <div className="flex h-10 items-center gap-2">
        <Button variant="ghost">Bold</Button>
        <Divider orientation="vertical" />
        <Button variant="ghost">Link</Button>
      </div>,
    );
    const separator = screen.getByRole('separator');
    await expect.element(separator).toHaveAttribute('aria-orientation', 'vertical');
    expect(separator.element().getBoundingClientRect().height).toBe(40);
    expect(separator.element().getBoundingClientRect().width).toBe(1);
  });

  it('insets by the logical start or both sides in either orientation', async () => {
    const screen = await renderWithDS(
      <div>
        <div className="flex w-80 flex-col" data-testid="list">
          <Divider inset="start" data-testid="start" />
          <Divider inset="middle" data-testid="middle" />
        </div>
        <div className="flex h-10 items-center gap-2" data-testid="row">
          <span>Draft</span>
          <Divider orientation="vertical" inset="start" data-testid="vertical-start" />
          <span>Review</span>
          <Divider orientation="vertical" inset="middle" data-testid="vertical-middle" />
          <span>Published</span>
        </div>
      </div>,
      { locale: 'ar' },
    );
    const start = screen.getByTestId('start').element().getBoundingClientRect();
    const middle = screen.getByTestId('middle').element().getBoundingClientRect();
    const list = screen.getByTestId('list').element().getBoundingClientRect();
    expect(start.width).toBe(304);
    expect(start.left).toBe(list.left);
    expect(start.right).toBe(list.right - 16);
    expect(middle.width).toBe(288);
    await expect.element(screen.getByTestId('start')).toHaveAttribute('data-inset', 'start');

    const row = screen.getByTestId('row').element().getBoundingClientRect();
    const top = screen.getByTestId('vertical-start').element().getBoundingClientRect();
    const both = screen.getByTestId('vertical-middle').element().getBoundingClientRect();
    expect(top.top).toBe(row.top + 8);
    expect(top.bottom).toBe(row.bottom);
    expect(both.top).toBe(row.top + 8);
    expect(both.bottom).toBe(row.bottom - 8);
    expect(top.width).toBe(1);
  });

  it('names a vertical labelled divider and keeps it vertical', async () => {
    const screen = await renderWithDS(
      <div className="flex h-32 items-stretch gap-4">
        <span>Upload a file</span>
        <OrDivider orientation="vertical" />
        <span>Paste a link</span>
      </div>,
    );
    const separator = screen.getByRole('separator', { name: 'or' });
    await expect.element(separator).toHaveAttribute('aria-orientation', 'vertical');
    const lines = separator.element().querySelectorAll('[data-slot=divider-line]');
    expect(lines).toHaveLength(2);
    expect(lines[0].getBoundingClientRect().width).toBe(1);
    expect(lines[0].getBoundingClientRect().height).toBeGreaterThan(8);
  });

  it('names a labelled divider by its label, or by an explicit aria-label first', async () => {
    const screen = await renderWithDS(
      <div className="flex w-80 flex-col">
        <Divider labelPosition="start">Archived folders</Divider>
        <Divider aria-label="Entries older than 30 days">Older</Divider>
      </div>,
    );
    const labelled = screen.getByRole('separator', { name: 'Archived folders' });
    await expect.element(labelled).toHaveAttribute('data-label-position', 'start');
    expect(labelled.element().querySelectorAll('[data-slot=divider-line]')).toHaveLength(1);
    const separator = screen.getByRole('separator', { name: 'Entries older than 30 days' });
    await expect.element(separator).not.toHaveAttribute('aria-labelledby');
  });

  it('takes the or word from labels, then DSProvider, then the English default', async () => {
    const english = await renderWithDS(<OrDivider />);
    await expect.element(english.getByRole('separator', { name: 'or' })).toBeVisible();
    await english.unmount();

    const screen = await renderWithDS(
      <>
        <OrDivider />
        <OrDivider labels={{ or: 'Alternatively' }} />
      </>,
      { provider: { labels: { divider: { or: 'Either option' } } } },
    );
    await expect
      .element(screen.getByRole('separator', { name: 'Either option' }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole('separator', { name: 'Alternatively' }))
      .toBeInTheDocument();
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex w-80 flex-col gap-4 p-4">
          <Divider />
          <Divider variant="strong" />
          <Divider inset="start" />
          <Divider inset="middle" />
          <OrDivider />
          <Divider labelPosition="end">Older</Divider>
          <div className="flex h-10 items-center gap-2">
            <span>Draft</span>
            <Divider orientation="vertical" inset="middle" />
            <span>Review</span>
          </div>
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
