import { useState } from 'react';
import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { FlagIcon } from '@/registry/ds/lib/icons';
import { Banner, type BannerTone } from '@/registry/ds/ui/banner';
import { Button } from '@/registry/ds/ui/button';

const tones: BannerTone[] = ['info', 'success', 'warning', 'error', 'neutral'];

describe('Banner', () => {
  it('renders a polite status with the tone, title, description and default glyph', async () => {
    const screen = await renderWithDS(
      <>
        <Banner
          tone="warning"
          title="Storage almost full"
          description="Free up space before 1 December to keep syncing."
        />
        <span data-testid="reference" className="bg-warning-soft text-on-warning-soft" />
      </>,
    );
    const status = screen.getByRole('status');
    await expect
      .element(status)
      .toHaveTextContent(
        'Warning: Storage almost fullFree up space before 1 December to keep syncing.',
      );
    const banner = screen.container.querySelector<HTMLElement>('[data-slot="banner"]')!;
    expect(banner.getAttribute('data-tone')).toBe('warning');
    expect(banner.getAttribute('data-variant')).toBe('soft');
    expect(banner.getAttribute('data-layout')).toBe('inline');
    const reference = getComputedStyle(screen.getByTestId('reference').element());
    expect(getComputedStyle(banner).backgroundColor).toBe(reference.backgroundColor);
    expect(getComputedStyle(banner).color).toBe(reference.color);
    const icon = banner.querySelector('[data-slot="icon"]')!;
    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(icon.querySelector('svg')).not.toBeNull();
  });

  it('becomes an alert only for announced errors', async () => {
    const screen = await renderWithDS(
      <>
        <Banner tone="error" announce title="Message failed" />
        <Banner tone="info" announce title="Export started" />
        <Banner tone="error" title="Two projects are overdue" />
      </>,
    );
    await expect.element(screen.getByRole('alert')).toHaveTextContent('Error: Message failed');
    const statuses = screen.getByRole('status').elements();
    expect(statuses.map((element) => element.textContent)).toEqual([
      'Information: Export started',
      'Error: Two projects are overdue',
    ]);
  });

  it('leaves the tone label out for neutral banners and honours custom or hidden icons', async () => {
    const screen = await renderWithDS(
      <>
        <Banner tone="neutral" title="Read-only workspace" icon={<FlagIcon data-testid="flag" />} />
        <Banner tone="success" title="Saved" icon={null} data-testid="plain" />
      </>,
    );
    await expect
      .element(screen.getByRole('status').first())
      .toHaveTextContent('Read-only workspace');
    await expect.element(screen.getByTestId('flag')).toBeInTheDocument();
    expect(screen.getByTestId('plain').element().querySelector('[data-slot="icon"]')).toBeNull();
  });

  it('draws the surface variant on the raised surface with only the icon in the tone', async () => {
    const screen = await renderWithDS(
      <>
        <Banner variant="surface" tone="error" title="Sync failed" data-testid="banner" />
        <span data-testid="raised" className="bg-surface-raised text-error" />
      </>,
      { dark: true },
    );
    const banner = screen.getByTestId('banner').element();
    const raised = getComputedStyle(screen.getByTestId('raised').element());
    expect(banner.getAttribute('data-variant')).toBe('surface');
    expect(getComputedStyle(banner).backgroundColor).toBe(raised.backgroundColor);
    expect(getComputedStyle(banner).borderTopWidth).toBe('1px');
    const icon = banner.querySelector('[data-slot="icon"]')!;
    expect(getComputedStyle(icon).color).toBe(raised.color);
    expect(getComputedStyle(banner).color).not.toBe(raised.color);
  });

  it('gives actions small ghost buttons that a caller can override', async () => {
    const onRetry = vi.fn();
    const screen = await renderWithDS(
      <Banner
        tone="error"
        title="Team sync paused"
        actions={
          <>
            <Button onPress={onRetry}>Retry</Button>
            <Button variant="solid">Reconnect</Button>
          </>
        }
      />,
    );
    const retry = screen.getByRole('button', { name: 'Retry' });
    await expect.element(retry).toHaveAttribute('data-variant', 'ghost');
    await expect.element(retry).toHaveAttribute('data-size', 'sm');
    expect(retry.element().getBoundingClientRect().height).toBe(32);
    expect(getComputedStyle(retry.element()).color).toBe(
      getComputedStyle(screen.container.querySelector('[data-slot="banner"]')!).color,
    );
    await expect
      .element(screen.getByRole('button', { name: 'Reconnect' }))
      .toHaveAttribute('data-variant', 'solid');
    await retry.click();
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('lines wrapped ghost actions up with each other and with the title', async () => {
    for (const locale of ['en', 'ar']) {
      const screen = await renderWithDS(
        <div className="w-64">
          <Banner
            tone="warning"
            title="Your shared folder is almost full"
            actions={
              <>
                <Button>Review storage</Button>
                <Button>Remind me later</Button>
              </>
            }
          />
        </div>,
        { locale },
      );
      const edge = (element: Element) => {
        const rect = element.getBoundingClientRect();
        return locale === 'ar' ? rect.right : rect.left;
      };
      const [first, second] = ['Review storage', 'Remind me later'].map((name) =>
        screen.getByRole('button', { name }).element(),
      );
      const title = screen.container.querySelector('[data-slot="title"]')!;
      expect(second.getBoundingClientRect().top).toBeGreaterThan(first.getBoundingClientRect().top);
      expect(edge(second)).toBeCloseTo(edge(first), 0);
      expect(edge(first.querySelector('[data-slot="label"]')!)).toBeCloseTo(edge(title), 0);
      await screen.unmount();
    }
  });

  it('dismisses itself and moves focus to the next focusable element', async () => {
    const onDismiss = vi.fn();
    const onOpenChange = vi.fn();
    const screen = await renderWithDS(
      <div>
        <Banner
          isDismissable
          onDismiss={onDismiss}
          onOpenChange={onOpenChange}
          title="New: recurring projects"
        />
        <Button>Create project</Button>
      </div>,
    );
    const dismiss = screen.getByRole('button', { name: 'Dismiss' });
    await userEvent.keyboard('{Tab}');
    await expect.element(dismiss).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    expect(onDismiss).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    await expect.element(screen.getByRole('button', { name: 'Create project' })).toHaveFocus();
    await expect.element(screen.getByRole('status')).not.toBeInTheDocument();
  });

  it('stays visible and keeps focus on Dismiss while a controlled isOpen stays true', async () => {
    function Controlled() {
      const [isOpen, setOpen] = useState(true);
      const [count, setCount] = useState(0);
      return (
        <>
          <Banner
            isDismissable
            isOpen={isOpen}
            onOpenChange={() => setCount((value) => value + 1)}
            title="Storage at 92%"
          />
          <Banner defaultOpen={false} title="Hidden notice" />
          <p>Dismissed {count}</p>
          <Button onPress={() => setOpen((value) => !value)}>Toggle</Button>
        </>
      );
    }
    const screen = await renderWithDS(<Controlled />);
    await expect.element(screen.getByText('Hidden notice')).not.toBeInTheDocument();
    const dismiss = screen.getByRole('button', { name: 'Dismiss' });
    await userEvent.keyboard('{Tab}');
    await expect.element(dismiss).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByText('Dismissed 1')).toBeInTheDocument();
    await expect.element(screen.getByRole('status')).toBeInTheDocument();
    await expect.element(dismiss).toHaveFocus();

    const toggle = screen.getByRole('button', { name: 'Toggle' });
    await toggle.click();
    await expect.element(screen.getByRole('status')).not.toBeInTheDocument();
    await expect.element(toggle).toHaveFocus();
    await toggle.click();
    await expect
      .element(screen.getByRole('status'))
      .toHaveTextContent('Information: Storage at 92%');
  });

  it('moves focus to a control that is enabled by the banner closing', async () => {
    function Announcement() {
      const [isOpen, setOpen] = useState(true);
      return (
        <>
          <Banner
            isDismissable
            isOpen={isOpen}
            onOpenChange={setOpen}
            title="New: recurring projects"
          />
          <Button isDisabled={isOpen} onPress={() => setOpen(true)}>
            Show again
          </Button>
          <Button>Create project</Button>
        </>
      );
    }
    for (const motion of ['system', 'disabled'] as const) {
      const screen = await renderWithDS(<Announcement />, { provider: { motion } });
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: 'Dismiss' })).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      await expect.element(screen.getByRole('button', { name: 'Show again' })).toHaveFocus();
      await expect.element(screen.getByRole('status')).not.toBeInTheDocument();
      await screen.unmount();
    }
  });

  it('moves focus to the previous focusable element when nothing follows', async () => {
    const screen = await renderWithDS(
      <div>
        <Button>Export folder</Button>
        <Banner isDismissable tone="success" title="Export ready" />
      </div>,
    );
    await screen.getByRole('button', { name: 'Dismiss' }).click();
    await expect.element(screen.getByRole('button', { name: 'Export folder' })).toHaveFocus();
    await expect.element(screen.getByRole('status')).not.toBeInTheDocument();
  });

  it('fades out as inert, and leaves at once when motion is disabled', async () => {
    const animated = await renderWithDS(
      <Banner isDismissable title="Upload sent" data-testid="animated" />,
    );
    await animated.getByRole('button', { name: 'Dismiss' }).click();
    const exiting = animated.getByTestId('animated').element();
    expect(exiting.hasAttribute('data-exiting')).toBe(true);
    expect(exiting.hasAttribute('inert')).toBe(true);
    await expect.element(animated.getByTestId('animated')).not.toBeInTheDocument();
    await animated.unmount();

    const instant = await renderWithDS(
      <Banner isDismissable title="Upload sent" data-testid="instant" />,
      { provider: { motion: 'disabled' } },
    );
    await instant.getByRole('button', { name: 'Dismiss' }).click();
    expect(document.querySelector('[data-testid="instant"]')).toBeNull();
  });

  it('takes its dismiss and tone labels from labels, then DSProvider', async () => {
    const screen = await renderWithDS(
      <>
        <Banner tone="error" isDismissable title="Kaydedilemedi" />
        <Banner
          tone="warning"
          isDismissable
          title="Depolama dolmak üzere"
          labels={{ dismiss: 'Gizle', warning: 'Dikkat:' }}
        />
      </>,
      { provider: { labels: { banner: { dismiss: 'Kapat', error: 'Hata:' } } } },
    );
    await expect.element(screen.getByRole('button', { name: 'Kapat' })).toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Gizle' })).toBeInTheDocument();
    const statuses = screen.getByRole('status').elements();
    expect(statuses.map((element) => element.textContent)).toEqual([
      'Hata: Kaydedilemedi',
      'Dikkat: Depolama dolmak üzere',
    ]);
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-3 p-4">
          {tones.map((tone) =>
            (['soft', 'surface'] as const).map((variant) => (
              <Banner
                key={`${tone}-${variant}`}
                tone={tone}
                variant={variant}
                isDismissable
                title={`${tone} ${variant}`}
                description="Projects sync every 15 minutes."
                actions={<Button>Review</Button>}
              />
            )),
          )}
          <Banner
            layout="page"
            tone="info"
            isDismissable
            description="Scheduled maintenance on Sunday from 02:00 to 04:00 UTC."
            actions={<Button>Status page</Button>}
          />
          <Banner layout="page" variant="surface" tone="warning" title="Maintenance this weekend" />
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
