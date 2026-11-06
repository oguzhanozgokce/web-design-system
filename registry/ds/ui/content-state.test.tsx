import { useState } from 'react';
import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { Button } from '@/registry/ds/ui/button';
import { ContentState, type ContentStatus } from '@/registry/ds/ui/content-state';

interface Invoice {
  id: string;
  customer: string;
}

const invoices: Invoice[] = [
  { id: 'INV-2048', customer: 'Acme Corp' },
  { id: 'INV-2049', customer: 'Globex' },
];

function InvoiceList({ items }: { items: Invoice[] }) {
  return (
    <ul aria-label="Invoices">
      {items.map((invoice) => (
        <li key={invoice.id}>
          {invoice.id} · {invoice.customer}
        </li>
      ))}
    </ul>
  );
}

function root(container: HTMLElement) {
  return container.querySelector<HTMLElement>('[data-slot="content-state"]')!;
}

describe('ContentState', () => {
  it('shows a labelled progress bar and marks the region busy while data is undefined', async () => {
    const screen = await renderWithDS(
      <ContentState<Invoice[]> data={undefined} loadingLabel="Loading invoices">
        {(items) => <InvoiceList items={items} />}
      </ContentState>,
    );
    await expect
      .element(screen.getByRole('progressbar', { name: 'Loading invoices' }))
      .toBeInTheDocument();
    expect(root(screen.container).getAttribute('aria-busy')).toBe('true');
    expect(root(screen.container).getAttribute('data-status')).toBe('loading');
  });

  it('renders the default empty state for an empty array', async () => {
    const screen = await renderWithDS(
      <ContentState data={[] as Invoice[]}>
        {(items) => <InvoiceList items={items} />}
      </ContentState>,
    );
    await expect.element(screen.getByRole('status')).toHaveTextContent('Nothing here yet');
    await expect
      .element(screen.getByRole('heading', { name: 'Nothing here yet' }))
      .toBeInTheDocument();
    expect(root(screen.container).hasAttribute('aria-busy')).toBe(false);
  });

  it('passes loaded data to a render function', async () => {
    const screen = await renderWithDS(
      <ContentState data={invoices}>{(items) => <InvoiceList items={items} />}</ContentState>,
    );
    await expect.element(screen.getByRole('list', { name: 'Invoices' })).toBeVisible();
    await expect.element(screen.getByText('INV-2049 · Globex')).toBeVisible();
  });

  it('respects a custom isEmpty and empty copy', async () => {
    const screen = await renderWithDS(
      <ContentState
        data={{ total: 0, rows: [] as Invoice[] }}
        isEmpty={(page) => page.total === 0}
        emptyTitle="No invoices yet"
        emptyDescription="Invoices you send appear here."
        emptyAction={<Button>New invoice</Button>}
      >
        {(page) => <InvoiceList items={page.rows} />}
      </ContentState>,
    );
    await expect
      .element(screen.getByRole('heading', { name: 'No invoices yet' }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole('button', { name: 'New invoice' }))
      .toHaveAttribute('data-variant', 'filled');
  });

  it('shows an alert with an async retry that stays pending and ignores repeats', async () => {
    let finish: () => void = () => {};
    const onRetry = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const screen = await renderWithDS(
      <ContentState data={undefined} error={new Error('timeout')} onRetry={onRetry}>
        content
      </ContentState>,
    );
    await expect
      .element(screen.getByRole('alert'))
      .toHaveTextContent('Something went wrongPlease try again in a moment.Try again');
    const retry = screen.getByRole('button', { name: 'Try again' });
    await retry.click();
    await expect.element(retry).toHaveAttribute('data-pending', 'true');
    await retry.click({ force: true });
    expect(onRetry).toHaveBeenCalledOnce();
    finish();
    await expect.element(retry).not.toHaveAttribute('data-pending');
  });

  it('builds error copy from the error and hides retry without onRetry', async () => {
    const screen = await renderWithDS(
      <ContentState
        status="error"
        error={{ status: 403 }}
        errorTitle={(error) =>
          (error as { status: number }).status === 403 ? 'You do not have access' : 'Failed'
        }
        errorDescription="Ask a workspace owner to add you to Billing."
      />,
    );
    await expect
      .element(screen.getByRole('heading', { name: 'You do not have access' }))
      .toBeInTheDocument();
    await expect.element(screen.getByRole('button')).not.toBeInTheDocument();
  });

  it('keeps stale content and shows a refresh error banner when data and error coexist', async () => {
    const onRetry = vi.fn();
    const screen = await renderWithDS(
      <ContentState data={invoices} error={new Error('offline')} onRetry={onRetry}>
        {(items) => <InvoiceList items={items} />}
      </ContentState>,
    );
    await expect.element(screen.getByRole('list', { name: 'Invoices' })).toBeVisible();
    await expect
      .element(screen.getByRole('alert'))
      .toHaveTextContent('Error: Something went wrongPlease try again in a moment.');
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('follows an explicit status and renders custom slots', async () => {
    function Harness() {
      const [status, setStatus] = useState<ContentStatus>('loading');
      return (
        <>
          {(['loading', 'error', 'empty', 'content'] as const).map((next) => (
            <Button key={next} onPress={() => setStatus(next)}>
              Show {next}
            </Button>
          ))}
          <ContentState
            status={status}
            loadingContent={<div data-testid="skeleton" />}
            errorContent={(error, retry) => <p>Custom error {String(Boolean(retry))}</p>}
            emptyContent={<p>Custom empty</p>}
          >
            <p>Ledger rows</p>
          </ContentState>
        </>
      );
    }
    const screen = await renderWithDS(<Harness />);
    await expect.element(screen.getByTestId('skeleton')).toBeInTheDocument();
    await expect.element(screen.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument();

    await screen.getByRole('button', { name: 'Show error' }).click();
    await expect.element(screen.getByRole('alert')).toHaveTextContent('Custom error false');

    await screen.getByRole('button', { name: 'Show empty' }).click();
    await expect.element(screen.getByRole('status')).toHaveTextContent('Custom empty');

    await screen.getByRole('button', { name: 'Show content' }).click();
    await expect.element(screen.getByText('Ledger rows')).toBeVisible();
    const content = screen.container.querySelector('[data-slot="content-view"]')!;
    expect(content.className).toMatch(/animate-ds-fade-in/);
  });

  it('moves focus to the region when the focused view goes away', async () => {
    function Harness() {
      const [status, setStatus] = useState<ContentStatus>('error');
      return (
        <ContentState status={status} onRetry={() => setStatus('loading')}>
          <p>Ledger rows</p>
        </ContentState>
      );
    }
    const screen = await renderWithDS(<Harness />);
    const retry = screen.getByRole('button', { name: 'Try again' });
    await userEvent.keyboard('{Tab}');
    await expect.element(retry).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    await expect.element(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(document.activeElement).toBe(root(screen.container));
  });

  it('moves focus to the region when focused content goes away', async () => {
    function Harness() {
      const [status, setStatus] = useState<ContentStatus>('content');
      return (
        <ContentState status={status}>
          <Button onPress={() => setStatus('loading')}>Reload ledger</Button>
        </ContentState>
      );
    }
    const screen = await renderWithDS(<Harness />);
    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('button', { name: 'Reload ledger' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    await expect.element(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(document.activeElement).toBe(root(screen.container));
    await userEvent.keyboard('{Tab}');
    expect(root(screen.container).hasAttribute('tabindex')).toBe(false);
  });

  it('keeps content visible and marks the region busy while refreshing', async () => {
    const screen = await renderWithDS(
      <ContentState data={invoices} isRefreshing>
        {(items) => <InvoiceList items={items} />}
      </ContentState>,
    );
    await expect.element(screen.getByRole('list', { name: 'Invoices' })).toBeVisible();
    const element = root(screen.container);
    expect(element.getAttribute('aria-busy')).toBe('true');
    expect(element.getAttribute('data-refreshing')).toBe('true');
    expect(element.getAttribute('data-status')).toBe('content');
  });

  it('treats null as empty and shows the error when empty data comes with an error', async () => {
    const screen = await renderWithDS(
      <>
        <ContentState data={null} data-testid="empty" />
        <ContentState data={[]} error={new Error('timeout')} data-testid="failed" />
      </>,
    );
    await expect.element(screen.getByTestId('empty')).toHaveAttribute('data-status', 'empty');
    await expect.element(screen.getByTestId('failed')).toHaveAttribute('data-status', 'error');
    await expect.element(screen.getByRole('alert')).toMatchTextContent(/^Something went wrong/);
  });

  it('takes its copy from props, then labels, then DSProvider', async () => {
    const screen = await renderWithDS(
      <div>
        <ContentState
          status="error"
          onRetry={() => {}}
          labels={{ errorTitle: 'Faturalar yüklenemedi' }}
        />
        <ContentState status="empty" labels={{ emptyTitle: 'Henüz fatura yok' }} />
        <ContentState status="loading" />
        <ContentState
          status="loading"
          loadingLabel="Müşteriler yükleniyor"
          labels={{ loading: 'Bekleniyor' }}
        />
      </div>,
      {
        provider: {
          labels: {
            contentState: {
              errorTitle: 'Bir şeyler ters gitti',
              errorDescription: 'Lütfen biraz sonra tekrar dene.',
              retry: 'Tekrar dene',
              loading: 'Yükleniyor',
            },
          },
        },
      },
    );
    await expect
      .element(screen.getByRole('heading', { name: 'Faturalar yüklenemedi' }))
      .toBeInTheDocument();
    await expect.element(screen.getByText('Lütfen biraz sonra tekrar dene.')).toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Tekrar dene' })).toBeInTheDocument();
    await expect
      .element(screen.getByRole('heading', { name: 'Henüz fatura yok' }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole('progressbar', { name: 'Yükleniyor' }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole('progressbar', { name: 'Müşteriler yükleniyor' }))
      .toBeInTheDocument();
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-4 p-4">
          <ContentState status="loading" size="compact" />
          <ContentState status="error" headingLevel={3} onRetry={() => {}} />
          <ContentState status="empty" size="compact" headingLevel={3} />
          <ContentState data={invoices} error={new Error('offline')} onRetry={() => {}}>
            {(items) => <InvoiceList items={items} />}
          </ContentState>
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
