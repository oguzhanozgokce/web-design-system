import { Dialog, Modal, ModalOverlay } from 'react-aria-components';
import { page } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { useCopyToClipboard } from '@/registry/ds/hooks/use-copy-to-clipboard';
import { Button } from '@/registry/ds/ui/button';
import { ButtonGroup } from '@/registry/ds/ui/button-group';
import { CopyButton } from '@/registry/ds/ui/copy-button';

function roleStyle(className: string) {
  const probe = document.createElement('span');
  probe.className = className;
  document.querySelector('[data-testid="ds-root"]')!.append(probe);
  const style = getComputedStyle(probe);
  const result = { backgroundColor: style.backgroundColor, color: style.color };
  probe.remove();
  return result;
}

function glyph(button: Element, state: 'idle' | 'copied' | 'failed') {
  return button.querySelector(`[data-glyph="${state}"]`)!;
}

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
  it('renders a small ghost icon button named by its English copy label', async () => {
    mockClipboard();
    const screen = await renderWithDS(<CopyButton value="ws_8f3a21c9" />);
    const button = screen.getByRole('button', { name: 'Copy' });
    await expect.element(button).toHaveAttribute('data-slot', 'icon-button');
    await expect.element(button).toHaveAttribute('data-variant', 'ghost');
    await expect.element(button).toHaveAttribute('data-tone', 'neutral');
    await expect.element(button).toHaveAttribute('data-size', 'sm');
    await expect.element(button).toHaveAttribute('data-status', 'idle');
    expect(button.element().getBoundingClientRect().width).toBe(32);
    await expect.element(page.getByRole('status')).toBeEmptyDOMElement();
  });

  it('keeps the check in the label colour on a solid button', async () => {
    mockClipboard();
    const screen = await renderWithDS(<CopyButton value="ws_8f3a21c9" variant="solid" />);
    const button = screen.getByRole('button', { name: 'Copy' });
    await button.click();
    await expect.element(button).toHaveAttribute('data-status', 'copied');
    expect(getComputedStyle(glyph(button.element(), 'copied')).color).toBe(
      roleStyle('text-on-primary-solid').color,
    );
  });

  it('cross-fades without scaling when motion is reduced', async () => {
    mockClipboard();
    const screen = await renderWithDS(<CopyButton value="ws_8f3a21c9" />, {
      provider: { motion: 'reduced' },
    });
    const button = screen.getByRole('button', { name: 'Copy' });
    await expect.element(button).toBeVisible();
    const checkGlyph = glyph(button.element(), 'copied');
    expect(getComputedStyle(checkGlyph).scale).not.toBe('0.5');
    expect(getComputedStyle(checkGlyph).transitionProperty).toBe('opacity');
    await button.click();
    await expect.poll(() => getComputedStyle(checkGlyph).opacity).toBe('1');
    expect(getComputedStyle(glyph(button.element(), 'idle')).scale).not.toBe('0.5');
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
    expect(getComputedStyle(glyph(button.element(), 'copied')).color).toBe(
      roleStyle('text-success').color,
    );
    await expect.element(button).not.toHaveAttribute('data-pending');
  });

  it('copies a synchronous function value without going pending', async () => {
    const { writeText, write } = mockClipboard();
    const value = vi.fn(() => 'DOC-2041');
    const screen = await renderWithDS(<CopyButton value={value} aria-label="Copy project" />);
    const button = screen.getByRole('button', { name: 'Copy project' });
    await button.click();
    await expect.element(button).toHaveAttribute('data-status', 'copied');
    await expect.element(button).not.toHaveAttribute('data-pending');
    expect(value).toHaveBeenCalledOnce();
    expect(writeText).toHaveBeenCalledWith('DOC-2041');
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

  it('does not treat an error thrown by onCopy as a failed copy', async () => {
    mockClipboard();
    const onCopyError = vi.fn();
    let outcome: Promise<unknown> = Promise.resolve();

    function CopyProject() {
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
            outcome = copy('DOC-2041').catch((error: Error) => error.message);
          }}
        >
          Copy project
        </button>
      );
    }

    const screen = await renderWithDS(<CopyProject />);
    const button = screen.getByRole('button', { name: 'Copy project' });
    await button.click();
    expect(await outcome).toBe('Analytics offline');
    await expect.element(button).toHaveAttribute('data-status', 'copied');
    expect(onCopyError).not.toHaveBeenCalled();
  });

  it('returns to idle after the timeout', async () => {
    mockClipboard();
    const screen = await renderWithDS(<CopyButton value="DOC-2041" timeout={150} />);
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
    await expect.element(button).toHaveAttribute('data-slot', 'button');
    await expect.element(button).toHaveAttribute('data-variant', 'soft');
    await expect.element(button).toHaveAttribute('data-tone', 'neutral');
    await expect.element(button).toHaveAttribute('data-size', 'sm');
    expect(button.element().getBoundingClientRect().height).toBe(32);

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

    finish('https://app.example.com/s/photos-2026');
    await expect.element(button).not.toHaveAttribute('data-pending');
    await expect.element(button).toHaveAttribute('data-status', 'copied');
    expect(onCopy).toHaveBeenCalledWith('https://app.example.com/s/photos-2026');

    const item = write.mock.calls[0][0][0];
    const blob = await item.getType('text/plain');
    expect(await blob.text()).toBe('https://app.example.com/s/photos-2026');
  });

  it('falls back to writeText when a clipboard item cannot be written or is unsupported', async () => {
    const rejecting = mockClipboard();
    rejecting.write.mockRejectedValue(new DOMException('Unsupported', 'NotAllowedError'));
    const first = await renderWithDS(
      <CopyButton value={async () => 'DOC-2041'} aria-label="Copy project number" />,
    );
    const number = first.getByRole('button', { name: 'Copy project number' });
    await number.click();
    await expect.element(number).toHaveAttribute('data-status', 'copied');
    expect(rejecting.writeText).toHaveBeenCalledWith('DOC-2041');
    await first.unmount();
    vi.restoreAllMocks();

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
        <CopyButton value={async () => 'DOC-2041'} aria-label="Copy project" />
      </>,
    );
    await screen.getByRole('button', { name: 'Copy expired link' }).click();
    await expect.poll(() => onCopyError.mock.calls.length).toBe(1);
    expect(onCopyError.mock.calls[0][0]).toEqual(new Error('Link expired'));

    const project = screen.getByRole('button', { name: 'Copy project' });
    await project.click();
    await expect.element(project).toHaveAttribute('data-status', 'copied');
    expect(write).not.toHaveBeenCalled();
    expect(writeText).toHaveBeenCalledWith('DOC-2041');
  });

  it('reports a failure when the Clipboard API is unavailable or the write is rejected', async () => {
    const error = new DOMException('Write permission denied', 'NotAllowedError');
    const causes = [
      () => {
        vi.spyOn(navigator, 'clipboard', 'get').mockReturnValue(undefined as unknown as Clipboard);
      },
      () => {
        mockClipboard().writeText.mockRejectedValue(error);
      },
    ];
    for (const cause of causes) {
      cause();
      const onCopy = vi.fn();
      const onCopyError = vi.fn();
      const screen = await renderWithDS(
        <CopyButton value="ws_8f3a21c9" onCopy={onCopy} onCopyError={onCopyError}>
          Copy ID
        </CopyButton>,
      );
      await screen.getByRole('button', { name: 'Copy ID' }).click();
      await expect.element(page.getByRole('status')).toHaveTextContent('Couldn’t copy');
      const failed = screen.getByRole('button', { name: 'Couldn’t copy' });
      await expect.element(failed).toHaveAttribute('data-status', 'failed');
      await expect.element(failed).toHaveAttribute('data-tone', 'error');
      await failed.unhover();
      await expect
        .poll(() => getComputedStyle(failed.element()).backgroundColor)
        .toBe(roleStyle('bg-error-soft').backgroundColor);
      expect(onCopyError).toHaveBeenCalledOnce();
      expect(onCopy).not.toHaveBeenCalled();
      await screen.unmount();
      vi.restoreAllMocks();
    }
  });
  it('takes its text from DSProvider labels, and the labels prop wins', async () => {
    const { writeText } = mockClipboard();
    writeText.mockRejectedValueOnce(new DOMException('Write permission denied', 'NotAllowedError'));
    const screen = await renderWithDS(
      <>
        <CopyButton
          value="TR-5521"
          labels={{ copy: 'Kimliği kopyala', copyFailed: 'Kopyalanamadı' }}
        />
        <CopyButton value="TR-5522" />
        <CopyButton
          value="https://app.example.com/invite/7Q4M"
          labels={{ copied: 'Panoya kopyalandı' }}
        >
          Davet bağlantısını kopyala
        </CopyButton>
      </>,
      {
        provider: {
          labels: {
            copyButton: { copy: 'Kopyala', copied: 'Kopyalandı', copyFailed: 'Kopyalama hatası' },
          },
        },
      },
    );
    const own = screen.getByRole('button', { name: 'Kimliği kopyala' });
    await own.click();
    await expect.element(own).toHaveAttribute('data-status', 'failed');
    await expect
      .element(page.getByRole('status').filter({ hasText: 'Kopyalanamadı' }))
      .toBeInTheDocument();

    await screen.getByRole('button', { name: 'Kopyala', exact: true }).click();
    await expect
      .element(page.getByRole('status').filter({ hasText: 'Kopyalandı' }))
      .toBeInTheDocument();

    await screen.getByRole('button', { name: 'Davet bağlantısını kopyala' }).click();
    await expect.element(screen.getByRole('button', { name: 'Panoya kopyalandı' })).toBeVisible();
    await expect
      .element(page.getByRole('status').filter({ hasText: 'Panoya kopyalandı' }))
      .toBeInTheDocument();
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
          <Dialog aria-label="Share album">
            <CopyButton value="https://app.example.com/s/photos" aria-label="Copy share link" />
          </Dialog>
        </Modal>
      </ModalOverlay>,
    );
    await page.getByRole('button', { name: 'Copy share link' }).click();
    const status = page.getByRole('status');
    await expect.element(status).toHaveTextContent('Copied');
    expect(status.element().closest('[aria-hidden="true"], [inert]')).toBeNull();
  });

  it('fits an attached button group and follows its variant and size', async () => {
    mockClipboard();
    const screen = await renderWithDS(
      <ButtonGroup aria-label="Project" buttonVariant="soft" size="md">
        <Button>Open project</Button>
        <CopyButton value="DOC-2041" aria-label="Copy project number" />
      </ButtonGroup>,
    );
    const button = screen.getByRole('button', { name: 'Copy project number' });
    await expect.element(button).toHaveAttribute('data-variant', 'soft');
    await expect.element(button).toHaveAttribute('data-size', 'md');
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
          {(['ghost', 'outline', 'soft', 'solid'] as const).map((variant) => (
            <CopyButton key={variant} value="ws_8f3a21c9" variant={variant} />
          ))}
          <CopyButton value="https://app.example.com/invite/7Q4M">Copy invite link</CopyButton>
          <CopyButton value="ws_8f3a21c9" variant="outline" size="md">
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
