import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { Link } from '@/registry/ds/ui/link';

function roleStyle(className: string) {
  const probe = document.createElement('span');
  probe.className = className;
  document.querySelector('[data-testid="ds-root"]')!.append(probe);
  const style = getComputedStyle(probe);
  const result = { color: style.color, decorationColor: style.textDecorationColor };
  probe.remove();
  return result;
}

describe('Link', () => {
  it('renders a neutral inline link with a quiet underline', async () => {
    const screen = await renderWithDS(
      <p>
        Uploads finish in the background. <Link href="/settings/uploads">Change schedule</Link>
      </p>,
    );
    const link = screen.getByRole('link', { name: 'Change schedule' });
    await expect.element(link).toHaveAttribute('href', '/settings/uploads');
    await expect.element(link).toHaveAttribute('data-variant', 'inline');
    await expect.element(link).toHaveAttribute('data-tone', 'neutral');
    await expect.element(link).not.toHaveAttribute('target');
    const style = getComputedStyle(link.element());
    expect(style.textDecorationLine).toBe('underline');
    expect(style.color).toBe(roleStyle('text-on-surface').color);
  });

  it('paints the primary tone and inherits the colour around it', async () => {
    const screen = await renderWithDS(
      <p className="text-error">
        <Link href="/a" tone="primary">
          Primary
        </Link>{' '}
        <Link href="/b" tone="inherit">
          Inherit
        </Link>
      </p>,
    );
    const primary = screen.getByRole('link', { name: 'Primary' });
    await expect.element(primary).toHaveAttribute('data-tone', 'primary');
    expect(getComputedStyle(primary.element()).color).toBe(roleStyle('text-primary').color);
    expect(getComputedStyle(screen.getByRole('link', { name: 'Inherit' }).element()).color).toBe(
      roleStyle('text-error').color,
    );
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

  it('nudges the arrow forward on hover, mirrored in RTL, and keeps it still when motion is reduced', async () => {
    for (const [locale, motion, direction] of [
      ['en', 'system', 1],
      ['ar', 'system', -1],
      ['en', 'reduced', 0],
    ] as const) {
      const screen = await renderWithDS(
        <Link href="/projects" variant="standalone" showArrow>
          View all projects
        </Link>,
        { locale, provider: { motion } },
      );
      const link = screen.getByRole('link', { name: 'View all projects' });
      const icon = link.element().querySelector('[data-slot="arrow"] svg')!;
      expect(getComputedStyle(icon).scale).toBe(locale === 'en' ? 'none' : '-1 1');
      expect(getComputedStyle(icon).translate).toBe('none');
      await link.hover();
      await expect.element(link).toHaveAttribute('data-hovered', 'true');
      await expect
        .poll(() => Math.sign(parseFloat(getComputedStyle(icon).translate) || 0))
        .toBe(direction);
      await screen.unmount();
    }
  });

  it('shows a trailing arrow, and only the external glyph when both glyphs are asked for', async () => {
    const screen = await renderWithDS(
      <>
        <Link href="/projects" variant="standalone" showArrow>
          View all projects
        </Link>
        <Link href="https://example.com/status" variant="standalone" isExternal showArrow>
          Status page
        </Link>
      </>,
    );
    const arrowed = screen.getByRole('link', { name: 'View all projects' }).element();
    expect(arrowed.querySelector('[data-slot="arrow"] svg')).not.toBeNull();
    const link = screen.getByRole('link', { name: 'Status page (opens in a new tab)' });
    expect(link.element().querySelector('[data-slot="arrow"]')).toBeNull();
    expect(link.element().querySelector('[data-slot="external-icon"]')).not.toBeNull();
  });

  it('keeps the inline external glyph apart from its label in either direction', async () => {
    const cases = [
      { locale: 'en', before: 'Read the ', label: 'documentation', after: ', then continue.' },
      { locale: 'ar', before: 'Read the ', label: 'documentation', after: ', then continue.' },
      { locale: 'ar', before: 'اقرأ ', label: 'التوثيق', after: ' ثم تابع.' },
    ];
    for (const { locale, before, label, after } of cases) {
      const screen = await renderWithDS(
        <p className="text-base">
          {before}
          <Link href="https://example.com/docs" isExternal>
            {label}
          </Link>
          {after}
        </p>,
        { locale },
      );
      const link = screen.getByRole('link', { name: new RegExp(label) }).element();
      const text = link.querySelector('[data-slot="label"]')!.getBoundingClientRect();
      const glyph = link.querySelector('[data-slot="external-icon"] svg')!.getBoundingClientRect();
      const gap = Math.max(glyph.left - text.right, text.left - glyph.right);
      expect(gap, `${locale} ${label}`).toBeGreaterThan(2);
      await screen.unmount();
    }
  });

  it('passes target and rel through on internal links', async () => {
    const screen = await renderWithDS(
      <Link href="/archive/photos-2026.zip" target="_self" rel="nofollow" download>
        Photo archive
      </Link>,
    );
    const link = screen.getByRole('link', { name: 'Photo archive' });
    await expect.element(link).toHaveAttribute('target', '_self');
    await expect.element(link).toHaveAttribute('rel', 'nofollow');
    await expect.element(link).toHaveAttribute('download');
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
    await screen.unmount();

    const english = await renderWithDS(
      <Link href="https://example.com/status" isExternal>
        Status page
      </Link>,
    );
    await expect
      .element(english.getByRole('link', { name: 'Status page (opens in a new tab)' }))
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

  it('dims a disabled link and leaves no anchor attributes on it', async () => {
    const screen = await renderWithDS(
      <Link
        href="https://example.com/archive/photos-2026.zip"
        isExternal
        isDisabled
        download="photos.zip"
        rel="nofollow"
        referrerPolicy="no-referrer"
      >
        Download archive
      </Link>,
    );
    const link = screen.getByRole('link', { name: /Download archive/ });
    await expect.element(link).toHaveAttribute('aria-disabled', 'true');
    const element = link.element();
    expect(element.tagName).toBe('SPAN');
    const style = getComputedStyle(element);
    expect(style.opacity).toBe('0.5');
    expect(style.cursor).toBe('not-allowed');
    for (const attribute of ['href', 'target', 'rel', 'download', 'referrerpolicy', 'tabindex']) {
      expect(element.hasAttribute(attribute), attribute).toBe(false);
    }
  });

  it('turns the underline to the text colour on hover, revealing it on standalone links', async () => {
    for (const variant of ['inline', 'standalone'] as const) {
      const screen = await renderWithDS(
        <Link href="/projects" variant={variant}>
          View all projects
        </Link>,
      );
      const link = screen.getByRole('link', { name: 'View all projects' });
      const style = getComputedStyle(link.element());
      expect(style.textDecorationLine).toBe('underline');
      expect(style.textDecorationColor, variant).toBe(
        variant === 'inline'
          ? roleStyle('decoration-outline-variant').decorationColor
          : 'rgba(0, 0, 0, 0)',
      );
      await link.hover();
      await expect.poll(() => style.textDecorationColor).toBe(style.color);
      await screen.unmount();
    }
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-4 p-4">
          <p className="text-sm">
            Shared albums stay private until you invite someone.{' '}
            <Link href="/help/sharing">Sharing settings</Link>
          </p>
          <p className="text-sm">
            <Link href="/help/storage" tone="primary">
              Storage plans
            </Link>{' '}
            explain what counts toward your quota.
          </p>
          <p className="text-sm">
            See the{' '}
            <Link href="https://example.com/status" isExternal>
              status page
            </Link>{' '}
            for incidents.
          </p>
          <Link href="/projects" variant="standalone" showArrow>
            View all projects
          </Link>
          <Link href="https://example.com/docs" variant="standalone" isExternal>
            API docs
          </Link>
          <Link href="/export" variant="standalone" isDisabled>
            Export folder
          </Link>
        </div>,
        options,
      );
      await expect.element(screen.getByRole('link', { name: 'View all projects' })).toBeVisible();
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
