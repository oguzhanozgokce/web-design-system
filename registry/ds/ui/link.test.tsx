import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { Link } from '@/registry/ds/ui/link';

describe('Link', () => {
  it('renders an inline link with its label', async () => {
    const screen = await renderWithDS(
      <p>
        Payouts settle in two business days. <Link href="/settings/payouts">Change schedule</Link>
      </p>,
    );
    const link = screen.getByRole('link', { name: 'Change schedule' });
    await expect.element(link).toHaveAttribute('href', '/settings/payouts');
    await expect.element(link).toHaveAttribute('data-variant', 'inline');
    await expect.element(link).not.toHaveAttribute('target');
    expect(getComputedStyle(link.element()).textDecorationLine).toBe('underline');
  });

  it('thickens the underline on hover', async () => {
    const screen = await renderWithDS(<Link href="/invoices">Invoices</Link>);
    const link = screen.getByRole('link', { name: 'Invoices' });
    expect(getComputedStyle(link.element()).textDecorationThickness).toBe('1px');
    await link.hover();
    await expect.element(link).toHaveAttribute('data-hovered', 'true');
    await expect.poll(() => getComputedStyle(link.element()).textDecorationThickness).toBe('2px');
  });

  it('shows a standalone link with a trailing arrow', async () => {
    const screen = await renderWithDS(
      <Link href="/invoices" variant="standalone" showArrow>
        View all invoices
      </Link>,
    );
    const link = screen.getByRole('link', { name: 'View all invoices' });
    await expect.element(link).toHaveAttribute('data-variant', 'standalone');
    expect(link.element().querySelector('[data-slot="arrow"] svg')).not.toBeNull();
  });

  it('opens external links in a new tab and says so', async () => {
    const screen = await renderWithDS(
      <Link href="https://developer.mozilla.org/docs/Web/API/Clipboard_API" isExternal rel="help">
        Clipboard API reference
      </Link>,
    );
    const link = screen.getByRole('link', {
      name: 'Clipboard API reference (opens in a new tab)',
    });
    await expect.element(link).toHaveAttribute('target', '_blank');
    await expect.element(link).toHaveAttribute('rel', 'help noreferrer noopener');
    await expect.element(link).toHaveAttribute('data-external', 'true');
    expect(link.element().querySelector('[data-slot="external-icon"] svg')).not.toBeNull();
  });

  it('nudges the arrow forward on hover, mirrored in RTL', async () => {
    for (const [locale, direction] of [
      ['en', 1],
      ['ar', -1],
    ] as const) {
      const screen = await renderWithDS(
        <Link href="/invoices" variant="standalone" showArrow>
          View all invoices
        </Link>,
        { locale },
      );
      const link = screen.getByRole('link', { name: 'View all invoices' });
      const icon = link.element().querySelector('[data-slot="arrow"] svg')!;
      expect(getComputedStyle(icon).scale).toBe(direction === 1 ? 'none' : '-1 1');
      expect(getComputedStyle(icon).translate).toBe('none');
      await link.hover();
      await expect
        .poll(() => Math.sign(parseFloat(getComputedStyle(icon).translate)))
        .toBe(direction);
      await screen.unmount();
    }
  });

  it('keeps the arrow still when motion is reduced', async () => {
    const screen = await renderWithDS(
      <Link href="/invoices" variant="standalone" showArrow>
        View all invoices
      </Link>,
      { provider: { motion: 'reduced' } },
    );
    const link = screen.getByRole('link', { name: 'View all invoices' });
    await link.hover();
    await expect.element(link).toHaveAttribute('data-hovered', 'true');
    const icon = link.element().querySelector('[data-slot="arrow"] svg')!;
    expect(getComputedStyle(icon).translate).toBe('none');
  });

  it('shows only the external glyph when both glyphs are asked for', async () => {
    const screen = await renderWithDS(
      <Link href="https://example.com/status" variant="standalone" isExternal showArrow>
        Status page
      </Link>,
    );
    const link = screen.getByRole('link', { name: 'Status page (opens in a new tab)' });
    expect(link.element().querySelector('[data-slot="arrow"]')).toBeNull();
    expect(link.element().querySelector('[data-slot="external-icon"]')).not.toBeNull();
  });

  it('passes target and rel through on internal links', async () => {
    const screen = await renderWithDS(
      <Link href="/statements/2026-10.pdf" target="_self" rel="nofollow" download>
        October statement
      </Link>,
    );
    const link = screen.getByRole('link', { name: 'October statement' });
    await expect.element(link).toHaveAttribute('target', '_self');
    await expect.element(link).toHaveAttribute('rel', 'nofollow');
    await expect.element(link).toHaveAttribute('download');
  });

  it('says the new tab in English by default', async () => {
    const screen = await renderWithDS(
      <Link href="https://example.com/status" isExternal>
        Status page
      </Link>,
    );
    await expect
      .element(screen.getByRole('link', { name: 'Status page (opens in a new tab)' }))
      .toBeInTheDocument();
  });

  it('takes the new-tab notice from labels, then DSProvider, then the English default', async () => {
    const screen = await renderWithDS(
      <>
        <Link href="https://example.com/yardim" isExternal>
          Yardım merkezi
        </Link>
        <Link
          href="https://example.com/durum"
          isExternal
          labels={{ opensInNewTab: '(yeni pencerede açılır)' }}
        >
          Durum sayfası
        </Link>
      </>,
      { provider: { labels: { link: { opensInNewTab: '(yeni sekmede açılır)' } } } },
    );
    await expect
      .element(screen.getByRole('link', { name: 'Yardım merkezi (yeni sekmede açılır)' }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole('link', { name: 'Durum sayfası (yeni pencerede açılır)' }))
      .toBeInTheDocument();
  });

  it('navigates through the DSProvider router', async () => {
    const navigate = vi.fn();
    const screen = await renderWithDS(<Link href="/members">Members</Link>, {
      provider: { navigate },
    });
    await screen.getByRole('link', { name: 'Members' }).click();
    expect(navigate).toHaveBeenCalledWith('/members', undefined);
  });

  it('activates with the keyboard', async () => {
    const onPress = vi.fn();
    const screen = await renderWithDS(<Link onPress={onPress}>Resend invite</Link>);
    await userEvent.keyboard('{Tab}');
    await expect
      .element(screen.getByRole('link', { name: 'Resend invite' }))
      .toHaveAttribute('data-focus-visible', 'true');
    await userEvent.keyboard('{Enter}');
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('does not navigate or fire when disabled', async () => {
    const onPress = vi.fn();
    const screen = await renderWithDS(
      <Link href="/statements/2026-10.pdf" isDisabled onPress={onPress}>
        Download statement
      </Link>,
    );
    const link = screen.getByRole('link', { name: 'Download statement' });
    await expect.element(link).toHaveAttribute('aria-disabled', 'true');
    await expect.element(link).not.toHaveAttribute('href');
    await link.click({ force: true });
    expect(onPress).not.toHaveBeenCalled();
  });

  it('leaves no anchor attributes on a disabled link', async () => {
    const screen = await renderWithDS(
      <Link
        href="https://example.com/statements/2026-10.pdf"
        isExternal
        isDisabled
        download="statement.pdf"
        rel="nofollow"
        referrerPolicy="no-referrer"
      >
        Download statement
      </Link>,
    );
    const link = screen.getByRole('link', { name: /Download statement/ });
    const element = link.element();
    expect(element.tagName).toBe('SPAN');
    for (const attribute of ['href', 'target', 'rel', 'download', 'referrerpolicy', 'tabindex']) {
      expect(element.hasAttribute(attribute), attribute).toBe(false);
    }
  });

  it('reveals the standalone underline only on hover', async () => {
    const screen = await renderWithDS(
      <Link href="/invoices" variant="standalone">
        View all invoices
      </Link>,
    );
    const link = screen.getByRole('link', { name: 'View all invoices' });
    const style = getComputedStyle(link.element());
    expect(style.textDecorationLine).toBe('underline');
    expect(style.textDecorationColor).toBe('rgba(0, 0, 0, 0)');
    await link.hover();
    await expect.poll(() => style.textDecorationColor).toBe(style.color);
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-4 p-4">
          <p className="text-body-md">
            Refunds return to the original card. <Link href="/help/refunds">Refund policy</Link>
          </p>
          <p className="text-body-md">
            See the{' '}
            <Link href="https://example.com/status" isExternal>
              status page
            </Link>{' '}
            for incidents.
          </p>
          <Link href="/invoices" variant="standalone" showArrow>
            View all invoices
          </Link>
          <Link href="https://example.com/docs" variant="standalone" isExternal>
            API docs
          </Link>
          <Link href="/export" variant="standalone" isDisabled>
            Export ledger
          </Link>
        </div>,
        options,
      );
      await expect.element(screen.getByRole('link', { name: 'View all invoices' })).toBeVisible();
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
