import { Dialog, Modal, ModalOverlay } from 'react-aria-components';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { useCopyToClipboard } from '@/registry/ds/hooks/use-copy-to-clipboard';
import { Button } from '@/registry/ds/ui/button';
import { ButtonGroup } from '@/registry/ds/ui/button-group';
import { CopyButton } from '@/registry/ds/ui/copy-button';

function mockClipboard() {
  const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
  const write = vi.spyOn(navigator.clipboard, 'write').mockResolvedValue(undefined);
  return { writeText, write };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('CopyButton', () => {
  it('renders an icon button named by its English copy label', async () => {
    mockClipboard();
    const screen = await renderWithDS(<CopyButton value="ws_8f3a21c9" />);
    const button = screen.getByRole('button', { name: 'Copy' });
    await expect.element(button).toHaveAttribute('data-variant', 'text');
    await expect.element(button).toHaveAttribute('data-status', 'idle');
    await expect.element(page.getByRole('status')).toBeEmptyDOMElement();
  });

  it('copies a string, shows the check and announces it', async () => {
    const { writeText } = mockClipboard();
    const onCopy = vi.fn();
    const screen = await renderWithDS(
      <CopyButton value="ws_8f3a21c9" aria-label="Copy workspace ID" onCopy={onCopy} />,
    );
    const button = screen.getByRole('button', { name: 'Copy workspace ID' });

    await button.click();
    expect(writeText).toHaveBeenCalledWith('ws_8f3a21c9');
    await expect.element(button).toHaveAttribute('data-status', 'copied');
    await expect.element(page.getByRole('status')).toHaveTextContent('Copied');
    expect(onCopy).toHaveBeenCalledWith('ws_8f3a21c9');
    await expect.element(button).not.toHaveAttribute('data-pending');
  });

  it('copies a synchronous function value without going pending', async () => {
    const { writeText, write } = mockClipboard();
    const value = vi.fn(() => 'INV-2041');
    const screen = await renderWithDS(<CopyButton value={value} aria-label="Copy invoice" />);
    const button = screen.getByRole('button', { name: 'Copy invoice' });
    await button.click();
    await expect.element(button).toHaveAttribute('data-status', 'copied');
    await expect.element(button).not.toHaveAttribute('data-pending');
    expect(value).toHaveBeenCalledOnce();
    expect(writeText).toHaveBeenCalledWith('INV-2041');
    expect(write).not.toHaveBeenCalled();
  });

  it('announces every copy, even a repeat within the timeout', async () => {
    mockClipboard();
    const onCopy = vi.fn();
    const screen = await renderWithDS(
      <CopyButton value="ws_8f3a21c9" aria-label="Copy workspace ID" onCopy={onCopy} />,
    );
    const button = screen.getByRole('button', { name: 'Copy workspace ID' });
    const status = page.getByRole('status');

    await button.click();
    await expect.element(status).toHaveTextContent('Copied');
    const first = status.element().firstElementChild;

    await button.click();
    await expect.poll(() => onCopy.mock.calls.length).toBe(2);
    await expect.poll(() => status.element().firstElementChild).not.toBe(first);
    await expect.element(status).toHaveTextContent('Copied');
  });

  it('reports a failure when the Clipboard API is unavailable', async () => {
    vi.spyOn(navigator, 'clipboard', 'get').mockReturnValue(undefined as unknown as Clipboard);
    const onCopyError = vi.fn();
    const screen = await renderWithDS(
      <CopyButton value="ws_8f3a21c9" aria-label="Copy workspace ID" onCopyError={onCopyError} />,
    );
    const button = screen.getByRole('button', { name: 'Copy workspace ID' });
    await button.click();
    await expect.element(button).toHaveAttribute('data-status', 'failed');
    await expect.element(page.getByRole('status')).toHaveTextContent('Couldn’t copy');
    expect(onCopyError).toHaveBeenCalledOnce();
    expect(button.element().querySelector('[data-slot="glyph"]')).toHaveAttribute(
      'data-status',
      'failed',
    );
  });

  it('does not treat an error thrown by onCopy as a failed copy', async () => {
    mockClipboard();
    const onCopyError = vi.fn();
    let outcome: Promise<unknown> = Promise.resolve();

    function CopyInvoice() {
      const { status, copy } = useCopyToClipboard({
        onCopy: () => {
          throw new Error('Analytics offline');
        },
        onCopyError,
      });
      return (
        <button
          type="button"
          data-status={status}
          onClick={() => {
            outcome = copy('INV-2041').catch((error: Error) => error.message);
          }}
        >
          Copy invoice
        </button>
      );
    }

    const screen = await renderWithDS(<CopyInvoice />);
    const button = screen.getByRole('button', { name: 'Copy invoice' });
    await button.click();
    expect(await outcome).toBe('Analytics offline');
    await expect.element(button).toHaveAttribute('data-status', 'copied');
    expect(onCopyError).not.toHaveBeenCalled();
  });

  it('returns to idle after the timeout', async () => {
    mockClipboard();
    const screen = await renderWithDS(<CopyButton value="INV-2041" timeout={150} />);
    const button = screen.getByRole('button', { name: 'Copy' });
    await button.click();
    await expect.element(button).toHaveAttribute('data-status', 'copied');
    await expect.element(button).toHaveAttribute('data-status', 'idle');
    await expect.element(page.getByRole('status')).toBeEmptyDOMElement();
  });

  it('swaps its label to Copied and back', async () => {
    mockClipboard();
    const screen = await renderWithDS(
      <CopyButton value="https://app.example.com/invite/7Q4M" timeout={300}>
        Copy invite link
      </CopyButton>,
    );
    const button = screen.getByRole('button', { name: 'Copy invite link' });
    await expect.element(button).toHaveAttribute('data-variant', 'outlined');

    await button.click();
    await expect.element(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
    await expect
      .element(screen.getByRole('button', { name: 'Copy invite link' }))
      .toBeInTheDocument();
  });

  it('resolves an async value while pending and blocks repeat presses', async () => {
    const { write } = mockClipboard();
    let finish: (text: string) => void = () => {};
    const value = vi.fn(() => new Promise<string>((resolve) => (finish = resolve)));
    const onCopy = vi.fn();
    const screen = await renderWithDS(
      <CopyButton value={value} onCopy={onCopy}>
        Copy share link
      </CopyButton>,
    );
    await expect.element(screen.getByRole('button', { name: 'Copy share link' })).toBeVisible();
    const button = screen.getByRole('button');

    await button.click();
    await expect.element(button).toHaveAttribute('data-pending', 'true');
    await button.click({ force: true });
    expect(value).toHaveBeenCalledOnce();

    finish('https://app.example.com/s/q3-report');
    await expect.element(button).not.toHaveAttribute('data-pending');
    await expect.element(button).toHaveAttribute('data-status', 'copied');
    expect(onCopy).toHaveBeenCalledWith('https://app.example.com/s/q3-report');

    const item = write.mock.calls[0][0][0];
    const blob = await item.getType('text/plain');
    expect(await blob.text()).toBe('https://app.example.com/s/q3-report');
  });

  it('falls back to writeText when a clipboard item cannot be written', async () => {
    const { writeText, write } = mockClipboard();
    write.mockRejectedValue(new DOMException('Unsupported', 'NotAllowedError'));
    const screen = await renderWithDS(
      <CopyButton value={async () => 'INV-2041'} aria-label="Copy invoice number" />,
    );
    const button = screen.getByRole('button', { name: 'Copy invoice number' });
    await button.click();
    await expect.element(button).toHaveAttribute('data-status', 'copied');
    expect(writeText).toHaveBeenCalledWith('INV-2041');
  });

  it('falls back to writeText when clipboard items are unsupported', async () => {
    const { writeText, write } = mockClipboard();
    vi.stubGlobal(
      'ClipboardItem',
      class {
        constructor() {
          throw new TypeError('Promises are not supported');
        }
      },
    );
    const onCopyError = vi.fn();
    const screen = await renderWithDS(
      <>
        <CopyButton
          value={() => Promise.reject(new Error('Link expired'))}
          aria-label="Copy expired link"
          onCopyError={onCopyError}
        />
        <CopyButton value={async () => 'INV-2041'} aria-label="Copy invoice" />
      </>,
    );
    await screen.getByRole('button', { name: 'Copy expired link' }).click();
    await expect.poll(() => onCopyError.mock.calls.length).toBe(1);
    expect(onCopyError.mock.calls[0][0]).toEqual(new Error('Link expired'));

    const invoice = screen.getByRole('button', { name: 'Copy invoice' });
    await invoice.click();
    await expect.element(invoice).toHaveAttribute('data-status', 'copied');
    expect(write).not.toHaveBeenCalled();
    expect(writeText).toHaveBeenCalledWith('INV-2041');
  });

  it('reports a failure', async () => {
    const { writeText } = mockClipboard();
    const error = new DOMException('Write permission denied', 'NotAllowedError');
    writeText.mockRejectedValue(error);
    const onCopy = vi.fn();
    const onCopyError = vi.fn();
    const screen = await renderWithDS(
      <CopyButton value="ws_8f3a21c9" onCopy={onCopy} onCopyError={onCopyError}>
        Copy ID
      </CopyButton>,
    );
    await screen.getByRole('button', { name: 'Copy ID' }).click();
    await expect.element(page.getByRole('status')).toHaveTextContent('Couldn’t copy');
    await expect
      .element(screen.getByRole('button', { name: 'Couldn’t copy' }))
      .toHaveAttribute('data-status', 'failed');
    expect(onCopyError).toHaveBeenCalledWith(error);
    expect(onCopy).not.toHaveBeenCalled();
  });

  it('copies with the keyboard', async () => {
    const { writeText } = mockClipboard();
    const screen = await renderWithDS(<CopyButton value="LEDGER-7Q4M" />);
    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard('{Enter}');
    expect(writeText).toHaveBeenCalledWith('LEDGER-7Q4M');
    await expect
      .element(screen.getByRole('button', { name: 'Copy' }))
      .toHaveAttribute('data-status', 'copied');
  });

  it('takes its name, label and announcements from the labels prop', async () => {
    const { writeText } = mockClipboard();
    writeText.mockRejectedValueOnce(new DOMException('Write permission denied', 'NotAllowedError'));
    const labels = { copy: 'Kopyala', copied: 'Kopyalandı', copyFailed: 'Kopyalanamadı' };
    const screen = await renderWithDS(
      <>
        <CopyButton value="TR-5521" labels={labels} />
        <CopyButton value="https://app.example.com/invite/7Q4M" labels={labels}>
          Davet bağlantısını kopyala
        </CopyButton>
      </>,
    );
    const iconOnly = screen.getByRole('button', { name: 'Kopyala', exact: true });
    await iconOnly.click();
    await expect.element(iconOnly).toHaveAttribute('data-status', 'failed');
    await expect
      .element(page.getByRole('status').filter({ hasText: 'Kopyalanamadı' }))
      .toBeInTheDocument();

    await screen.getByRole('button', { name: 'Davet bağlantısını kopyala' }).click();
    await expect.element(screen.getByRole('button', { name: 'Kopyalandı' })).toBeVisible();
  });

  it('takes its text from DSProvider labels, and the labels prop wins', async () => {
    mockClipboard();
    const screen = await renderWithDS(
      <CopyButton value="TR-5521" labels={{ copied: 'Panoya kopyalandı' }} />,
      { provider: { labels: { copyButton: { copy: 'Kopyala', copied: 'Kopyalandı' } } } },
    );
    await screen.getByRole('button', { name: 'Kopyala' }).click();
    await expect.element(page.getByRole('status')).toHaveTextContent('Panoya kopyalandı');
  });

  it('does not copy when disabled', async () => {
    const { writeText } = mockClipboard();
    const screen = await renderWithDS(<CopyButton value="ws_8f3a21c9" isDisabled />);
    await screen.getByRole('button', { name: 'Copy' }).click({ force: true });
    expect(writeText).not.toHaveBeenCalled();
  });

  it('announces outside the button in the DSProvider locale', async () => {
    mockClipboard();
    const screen = await renderWithDS(
      <CopyButton value="ws_8f3a21c9" labels={{ copied: 'Kopiert' }}>
        ID kopieren
      </CopyButton>,
      { locale: 'de' },
    );
    const button = screen.getByRole('button', { name: 'ID kopieren' });
    const status = page.getByRole('status');
    expect(button.element().contains(status.element())).toBe(false);
    expect(button.element().nextElementSibling).toBeNull();
    await expect.element(status).toHaveAttribute('lang', 'de');
    await button.click();
    await expect.element(status).toHaveTextContent('Kopiert');
  });

  it('keeps announcing inside a modal dialog', async () => {
    mockClipboard();
    await renderWithDS(
      <ModalOverlay isOpen>
        <Modal>
          <Dialog aria-label="Share report">
            <CopyButton value="https://app.example.com/s/q3" aria-label="Copy share link" />
          </Dialog>
        </Modal>
      </ModalOverlay>,
    );
    await page.getByRole('button', { name: 'Copy share link' }).click();
    const status = page.getByRole('status');
    await expect.element(status).toHaveTextContent('Copied');
    expect(status.element().closest('[aria-hidden="true"], [inert]')).toBeNull();
  });

  it('fits a connected button group and follows its variant', async () => {
    mockClipboard();
    const screen = await renderWithDS(
      <ButtonGroup variant="connected" buttonVariant="tonal">
        <Button>Open invoice</Button>
        <CopyButton value="INV-2041" aria-label="Copy invoice number" />
      </ButtonGroup>,
    );
    const button = screen.getByRole('button', { name: 'Copy invoice number' });
    await expect.element(button).toHaveAttribute('data-variant', 'tonal');
    expect(button.element().nextElementSibling).toBeNull();
    const end = getComputedStyle(button.element()).borderTopRightRadius;
    const start = getComputedStyle(button.element()).borderTopLeftRadius;
    expect(parseFloat(end)).toBeGreaterThan(parseFloat(start));
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    mockClipboard();
    for (const options of [{}, { dark: true }, { locale: 'ar' }] as {
      dark?: boolean;
      locale?: string;
    }[]) {
      const screen = await renderWithDS(
        <div className="flex flex-wrap items-center gap-3 p-4">
          {(['text', 'outlined', 'tonal', 'filled', 'elevated'] as const).map((variant) => (
            <CopyButton key={variant} value="ws_8f3a21c9" variant={variant} />
          ))}
          <CopyButton value="https://app.example.com/invite/7Q4M">Copy invite link</CopyButton>
          <CopyButton value="ws_8f3a21c9" variant="tonal" size="sm">
            Copy ID
          </CopyButton>
          <CopyButton value="ws_8f3a21c9" isDisabled />
        </div>,
        options,
      );
      await expect.element(page.getByRole('button', { name: 'Copy ID' })).toBeVisible();
      await expectNoA11yViolations(screen.container);
      await page.getByRole('button', { name: 'Copy invite link' }).click();
      await expect.element(page.getByRole('button', { name: 'Copied' })).toBeVisible();
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
