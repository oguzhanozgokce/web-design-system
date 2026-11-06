import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { Button } from '@/registry/ds/ui/button';
import { Divider, OrDivider } from '@/registry/ds/ui/divider';

describe('Divider', () => {
  it('renders a horizontal hr separator by default', async () => {
    const screen = await renderWithDS(
      <div className="flex w-80 flex-col">
        <span>Billing</span>
        <Divider />
        <span>Members</span>
      </div>,
    );
    const separator = screen.getByRole('separator');
    await expect.element(separator).toBeInTheDocument();
    expect(separator.element().tagName).toBe('HR');
    await expect.element(separator).toHaveAttribute('data-orientation', 'horizontal');
    await expect.element(separator).toHaveAttribute('data-inset', 'none');
    expect(separator.element().getBoundingClientRect().width).toBe(320);
  });

  it('renders a vertical separator that stretches to the row height', async () => {
    const screen = await renderWithDS(
      <div className="flex h-10 items-center gap-2">
        <Button variant="text">Bold</Button>
        <Divider orientation="vertical" />
        <Button variant="text">Link</Button>
      </div>,
    );
    const separator = screen.getByRole('separator');
    await expect.element(separator).toHaveAttribute('aria-orientation', 'vertical');
    expect(separator.element().getBoundingClientRect().height).toBe(40);
  });

  it('insets by the logical start or both sides', async () => {
    const screen = await renderWithDS(
      <div className="flex w-80 flex-col" data-testid="list">
        <Divider inset="start" data-testid="start" />
        <Divider inset="middle" data-testid="middle" />
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
  });

  it('shortens a vertical divider at the top or at both ends', async () => {
    const screen = await renderWithDS(
      <div className="flex h-10 items-center gap-2" data-testid="row">
        <span>Draft</span>
        <Divider orientation="vertical" inset="start" data-testid="start" />
        <span>Posted</span>
        <Divider orientation="vertical" inset="middle" data-testid="middle" />
        <span>Paid</span>
      </div>,
    );
    const row = screen.getByTestId('row').element().getBoundingClientRect();
    const start = screen.getByTestId('start').element().getBoundingClientRect();
    const middle = screen.getByTestId('middle').element().getBoundingClientRect();
    expect(start.top).toBe(row.top + 8);
    expect(start.bottom).toBe(row.bottom);
    expect(middle.top).toBe(row.top + 8);
    expect(middle.bottom).toBe(row.bottom - 8);
    expect(start.width).toBe(1);
  });

  it('names a vertical labelled divider and keeps it vertical', async () => {
    const screen = await renderWithDS(
      <div className="flex h-32 items-stretch gap-4">
        <span>Card payment</span>
        <OrDivider orientation="vertical" />
        <span>Bank transfer</span>
      </div>,
    );
    const separator = screen.getByRole('separator', { name: 'or' });
    await expect.element(separator).toHaveAttribute('aria-orientation', 'vertical');
    const lines = separator.element().querySelectorAll('[data-slot=divider-line]');
    expect(lines).toHaveLength(2);
    expect(lines[0].getBoundingClientRect().width).toBe(1);
    expect(lines[0].getBoundingClientRect().height).toBeGreaterThan(8);
  });

  it('prefers an explicit aria-label over the visible label', async () => {
    const screen = await renderWithDS(
      <div className="flex w-80 flex-col">
        <Divider aria-label="Entries older than 30 days">Older</Divider>
      </div>,
    );
    const separator = screen.getByRole('separator', { name: 'Entries older than 30 days' });
    await expect.element(separator).not.toHaveAttribute('aria-labelledby');
  });

  it('names a labelled divider by its label', async () => {
    const screen = await renderWithDS(
      <div className="flex w-80 flex-col">
        <Divider labelPosition="start">Archived ledgers</Divider>
      </div>,
    );
    const separator = screen.getByRole('separator', { name: 'Archived ledgers' });
    await expect.element(separator).toHaveAttribute('data-label-position', 'start');
    expect(separator.element().querySelectorAll('[data-slot=divider-line]')).toHaveLength(1);
  });

  it('takes the or word from labels, then DSProvider, then the English default', async () => {
    const screen = await renderWithDS(
      <>
        <OrDivider />
        <OrDivider labels={{ or: 'ya da' }} />
      </>,
      { provider: { labels: { divider: { or: 'veya' } } } },
    );
    await expect.element(screen.getByRole('separator', { name: 'veya' })).toBeInTheDocument();
    await expect.element(screen.getByRole('separator', { name: 'ya da' })).toBeInTheDocument();
  });

  it('says or by default', async () => {
    const screen = await renderWithDS(<OrDivider />);
    await expect.element(screen.getByRole('separator', { name: 'or' })).toBeVisible();
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex w-80 flex-col gap-4 p-4">
          <Divider />
          <Divider inset="start" />
          <Divider inset="middle" />
          <OrDivider />
          <Divider labelPosition="end">Older</Divider>
          <div className="flex h-10 items-center gap-2">
            <span>Draft</span>
            <Divider orientation="vertical" inset="middle" />
            <span>Posted</span>
          </div>
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      screen.unmount();
    }
  });
});
