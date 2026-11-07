import { useState } from 'react';
import {
  CookieConsent,
  defaultCookieConsentLabels,
  type CookieConsentCategory,
  type CookieConsentValue,
} from '@/registry/ds/ui/cookie-consent';
import { Button } from '@/registry/ds/ui/button';
import { DSProvider } from '@/registry/ds/ui/ds-provider';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';

const categories: CookieConsentCategory[] = [
  { id: 'essential', label: 'Essential', description: 'Keeps the site working.', isRequired: true },
  { id: 'analytics', label: 'Usage analytics', description: 'Optional visit insights.' },
];

it('edits a controlled draft without applying it, then saves only when confirmed', async () => {
  const confirm = vi.fn();
  function Example() {
    const [value, setValue] = useState<CookieConsentValue>({ analytics: false });
    return (
      <CookieConsent
        title="Your privacy"
        categories={categories}
        value={value}
        onChange={setValue}
        onConfirm={confirm}
      />
    );
  }
  const screen = await renderWithDS(<Example />, { provider: { motion: 'disabled' } });
  await screen.getByRole('button', { name: 'Preferences' }).click();
  await expect
    .element(screen.getByRole('switch', { name: 'Essential', exact: true }))
    .toBeChecked();
  await screen.getByText('Usage analytics', { exact: true }).click();
  await screen.getByRole('button', { name: 'Back', exact: true }).click();
  expect(confirm).not.toHaveBeenCalled();
  await screen.getByRole('button', { name: 'Preferences' }).click();
  await expect
    .element(screen.getByRole('switch', { name: 'Usage analytics', exact: true }))
    .toBeChecked();
  await screen.getByRole('button', { name: 'Save choices' }).click();
  expect(confirm).toHaveBeenCalledWith({
    action: 'save-preferences',
    value: { essential: true, analytics: true },
  });
  await expect
    .element(screen.getByRole('region', { name: 'Your privacy' }))
    .not.toBeInTheDocument();
});

it('wires both first-layer decisions directly to confirmation without opening preferences', async () => {
  for (const [label, action] of [
    ['Accept all', 'accept-all'],
    ['Reject optional', 'reject-all'],
  ]) {
    const confirm = vi.fn();
    const screen = await renderWithDS(
      <CookieConsent title="Cookie choices" categories={categories} onConfirm={confirm} />,
      { provider: { motion: 'disabled' } },
    );
    await screen.getByRole('button', { name: label }).click();
    expect(confirm).toHaveBeenCalledOnce();
    expect(confirm.mock.calls[0][0].action).toBe(action);
    await screen.unmount();
  }
});

it('blocks competing actions during a save and keeps the notice open for a failed save and retry', async () => {
  const pending = Promise.withResolvers<void>();
  const confirm = vi
    .fn()
    .mockImplementationOnce(() => pending.promise)
    .mockResolvedValue(undefined);
  const onOpenChange = vi.fn();
  const screen = await renderWithDS(
    <CookieConsent
      title="Cookie choices"
      categories={categories}
      onConfirm={confirm}
      onOpenChange={onOpenChange}
    />,
    { provider: { motion: 'disabled' } },
  );
  await screen.getByRole('button', { name: 'Accept all' }).click();
  await expect.element(screen.getByRole('button', { name: 'Reject optional' })).toBeDisabled();
  await expect.element(screen.getByRole('button', { name: 'Preferences' })).toBeDisabled();
  expect(onOpenChange).not.toHaveBeenCalled();
  pending.reject(new Error('Save unavailable'));
  await expect
    .element(screen.getByRole('alert'))
    .toHaveTextContent(defaultCookieConsentLabels.error);
  await expect.element(screen.getByRole('region', { name: 'Cookie choices' })).toBeVisible();
  await screen.getByRole('button', { name: 'Accept all' }).click();
  expect(confirm).toHaveBeenCalledTimes(2);
  expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
});

it('does not report a late close after the consumer removes the notice during a save', async () => {
  const pending = Promise.withResolvers<void>();
  const onOpenChange = vi.fn();
  function Example() {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button onPress={() => setOpen(false)}>Hide notice</Button>
        <CookieConsent
          title="Cookies"
          isOpen={open}
          onOpenChange={onOpenChange}
          onConfirm={() => pending.promise}
        />
      </>
    );
  }
  const screen = await renderWithDS(<Example />, { provider: { motion: 'disabled' } });
  await screen.getByRole('button', { name: 'Accept all' }).click();
  await screen.getByRole('button', { name: 'Hide notice' }).click();
  pending.resolve();
  await pending.promise;
  expect(onOpenChange).not.toHaveBeenCalled();
});

it('uses English defaults, provider labels and local overrides without rendering unused preferences', async () => {
  const screen = await renderWithDS(
    <>
      <CookieConsent title="Default" onConfirm={() => undefined} />
      <DSProvider labels={{ cookieConsent: { acceptAll: 'Allow optional cookies' } }}>
        <CookieConsent title="Provider" onConfirm={() => undefined} />
        <CookieConsent
          title="Local"
          onConfirm={() => undefined}
          labels={{ acceptAll: 'Allow all cookies' }}
        />
      </DSProvider>
    </>,
  );
  await expect
    .element(screen.getByRole('button', { name: 'Accept all', exact: true }))
    .toBeVisible();
  await expect
    .element(screen.getByRole('button', { name: 'Allow optional cookies', exact: true }))
    .toBeVisible();
  await expect
    .element(screen.getByRole('button', { name: 'Allow all cookies', exact: true }))
    .toBeVisible();
  await expect.element(screen.getByRole('button', { name: 'Preferences' })).not.toBeInTheDocument();
});

it.each(['card', 'banner', 'compact'] as const)(
  'fits a narrow container with expanded preferences in the %s layout',
  async (layout) => {
    const screen = await renderWithDS(
      <div style={{ width: 280 }}>
        <CookieConsent
          title="Your privacy, your call."
          description="Choose the optional cookies you are comfortable with."
          layout={layout}
          categories={categories}
          onConfirm={() => undefined}
        />
      </div>,
      { provider: { motion: 'disabled' } },
    );
    await screen.getByRole('button', { name: 'Preferences' }).click();
    const notice = screen.getByRole('region', { name: 'Your privacy, your call.' }).element();
    expect(notice.scrollWidth).toBeLessThanOrEqual(280);
    await expect.element(screen.getByRole('button', { name: 'Save choices' })).toBeVisible();
  },
);

it.each(['banner', 'compact'] as const)(
  'keeps %s actions beside the copy until preferences expand',
  async (layout) => {
    const screen = await renderWithDS(
      <div style={{ width: 800 }}>
        <CookieConsent
          title="Cookies"
          description="Your choice."
          layout={layout}
          categories={categories}
          onConfirm={() => undefined}
        />
      </div>,
      { provider: { motion: 'disabled' } },
    );
    const header = screen.container.querySelector('[data-slot="cookie-consent-header"]')!;
    const actions = screen.container.querySelector('[data-slot="cookie-consent-actions"]')!;
    expect(actions.getBoundingClientRect().top).toBeLessThan(header.getBoundingClientRect().bottom);
    expect(actions.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      header.getBoundingClientRect().right,
    );
    await screen.getByRole('button', { name: 'Preferences' }).click();
    const panel = screen.container.querySelector('[data-slot="cookie-consent-preferences"]')!;
    expect(actions.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      panel.getBoundingClientRect().bottom,
    );
  },
);

it('keeps a long fixed card inside the viewport and follows the logical end edge in RTL', async () => {
  for (const locale of ['en', 'ar']) {
    const screen = await renderWithDS(
      <CookieConsent
        title="Cookies"
        placement="bottom-end"
        categories={Array.from({ length: 12 }, (_, id) => ({
          id: String(id),
          label: `Category ${id + 1}`,
          description: 'An optional preference for this website.',
        }))}
        onConfirm={() => undefined}
      />,
      { locale, provider: { motion: 'disabled' } },
    );
    await screen.getByRole('button', { name: 'Preferences' }).click();
    const notice = screen.getByRole('region', { name: 'Cookies' }).element();
    const bounds = notice.getBoundingClientRect();
    expect(bounds.width).toBeLessThanOrEqual(384);
    expect(bounds.top).toBeGreaterThanOrEqual(0);
    expect(bounds.bottom).toBeLessThanOrEqual(window.innerHeight);
    expect(bounds.right).toBeLessThanOrEqual(window.innerWidth);
    const endGap = window.innerWidth - bounds.right;
    expect(locale === 'ar' ? bounds.left <= endGap + 1 : endGap <= bounds.left + 1).toBe(true);
    expect(getComputedStyle(notice).insetInlineEnd).toBe('16px');
    await screen.unmount();
  }
});

it('removes spatial motion for reduced motion and all effects when motion is disabled', async () => {
  for (const preference of ['reduced', 'disabled'] as const) {
    const screen = await renderWithDS(
      <CookieConsent title="Cookies" categories={categories} onConfirm={() => undefined} />,
      { provider: { motion: preference } },
    );
    await screen.getByRole('button', { name: 'Preferences' }).click();
    const surface = screen.container.querySelector('[data-slot="cookie-consent-surface"]')!;
    const panel = screen.container.querySelector('[data-slot="cookie-consent-preferences"]')!;
    expect(getComputedStyle(surface).transform).toBe('none');
    expect(getComputedStyle(panel).transitionDuration).toBe('0s');
    if (preference === 'disabled') expect(getComputedStyle(surface).opacity).toBe('1');
    await screen.unmount();
  }
});

it('has no accessibility violations with preferences open in light, dark and RTL', async () => {
  for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
    const screen = await renderWithDS(
      <CookieConsent
        title="Cookie choices"
        description="Decide which optional cookies to allow."
        categories={categories}
        onConfirm={() => undefined}
      />,
      { ...options, provider: { motion: 'disabled' } },
    );
    await screen.getByRole('button', { name: 'Preferences' }).click();
    await expect
      .element(screen.getByRole('switch', { name: 'Usage analytics', exact: true }))
      .not.toBeChecked();
    await expectNoA11yViolations(screen.container);
    await screen.unmount();
  }
});
