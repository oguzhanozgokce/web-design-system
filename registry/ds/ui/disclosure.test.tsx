import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { LockIcon, NotificationsIcon } from '@/registry/ds/lib/icons';
import {
  Accordion,
  Disclosure,
  DisclosurePanel,
  DisclosureTrigger,
  type AccordionVariant,
} from '@/registry/ds/ui/disclosure';

function part(container: HTMLElement, selector: string) {
  const element = container.querySelector<HTMLElement>(selector);
  if (!element) throw new Error(`Nothing matches ${selector}`);
  return element;
}

function BillingAccordion(props: {
  variant?: AccordionVariant;
  allowsMultipleExpanded?: boolean;
  defaultExpandedKeys?: Key[];
  onExpandedChange?: (keys: Set<Key>) => void;
  isDisabled?: boolean;
}) {
  return (
    <Accordion {...props}>
      <Disclosure id="refunds">
        <DisclosureTrigger>Refunds</DisclosureTrigger>
        <DisclosurePanel>Refunds settle in five to ten business days.</DisclosurePanel>
      </Disclosure>
      <Disclosure id="payouts">
        <DisclosureTrigger>Payouts</DisclosureTrigger>
        <DisclosurePanel>Payouts run every Monday at 09:00.</DisclosurePanel>
      </Disclosure>
      <Disclosure id="invoices" isDisabled>
        <DisclosureTrigger>Invoices</DisclosureTrigger>
        <DisclosurePanel>Invoices are emailed on the first of the month.</DisclosurePanel>
      </Disclosure>
    </Accordion>
  );
}

describe('Disclosure', () => {
  it('renders a heading with a trigger button that controls the panel', async () => {
    const screen = await renderWithDS(
      <Disclosure>
        <DisclosureTrigger>Refund policy</DisclosureTrigger>
        <DisclosurePanel>Refunds settle in five to ten business days.</DisclosurePanel>
      </Disclosure>,
    );
    const heading = screen.getByRole('heading', { level: 3, name: 'Refund policy' });
    await expect.element(heading).toBeInTheDocument();
    const trigger = screen.getByRole('button', { name: 'Refund policy' });
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
    const panelId = trigger.element().getAttribute('aria-controls');
    const panel = document.getElementById(panelId ?? '');
    expect(panel).not.toBeNull();
    expect(panel?.getAttribute('aria-labelledby')).toBe(trigger.element().id);
    await expect.element(screen.getByText(/^Refunds settle/)).not.toBeVisible();
    await expect
      .element(part(screen.container, '[data-slot="disclosure"]'))
      .toHaveAttribute('data-variant', 'outlined');
  });

  it('expands and collapses on press and calls onExpandedChange', async () => {
    const onExpandedChange = vi.fn();
    const screen = await renderWithDS(
      <Disclosure onExpandedChange={onExpandedChange}>
        <DisclosureTrigger>Refund policy</DisclosureTrigger>
        <DisclosurePanel>Refunds settle in five to ten business days.</DisclosurePanel>
      </Disclosure>,
    );
    const trigger = screen.getByRole('button', { name: 'Refund policy' });

    await trigger.click();
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect.element(screen.getByText(/^Refunds settle/)).toBeVisible();
    expect(onExpandedChange).toHaveBeenLastCalledWith(true);

    await trigger.click();
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect.element(screen.getByText(/^Refunds settle/)).not.toBeVisible();
    expect(onExpandedChange).toHaveBeenLastCalledWith(false);
  });

  it('toggles with Enter and Space', async () => {
    const screen = await renderWithDS(
      <Disclosure>
        <DisclosureTrigger>Refund policy</DisclosureTrigger>
        <DisclosurePanel>Refunds settle in five to ten business days.</DisclosurePanel>
      </Disclosure>,
    );
    const trigger = screen.getByRole('button', { name: 'Refund policy' });

    await userEvent.keyboard('{Tab}');
    await expect.element(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard(' ');
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('supports a controlled isExpanded', async () => {
    function Controlled() {
      const [expanded, setExpanded] = useState(true);
      return (
        <>
          <p>{expanded ? 'open' : 'closed'}</p>
          <Disclosure isExpanded={expanded} onExpandedChange={setExpanded}>
            <DisclosureTrigger>Refund policy</DisclosureTrigger>
            <DisclosurePanel>Refunds settle in five to ten business days.</DisclosurePanel>
          </Disclosure>
        </>
      );
    }
    const screen = await renderWithDS(<Controlled />);
    const trigger = screen.getByRole('button', { name: 'Refund policy' });
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
    await trigger.click();
    await expect.element(screen.getByText('closed')).toBeInTheDocument();
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('names the trigger by its title and description inside a heading', async () => {
    const screen = await renderWithDS(
      <Disclosure>
        <DisclosureTrigger
          level={2}
          startIcon={<NotificationsIcon />}
          description="Payout alerts and the weekly summary"
        >
          Notifications
        </DisclosureTrigger>
        <DisclosurePanel>Choose which emails you receive.</DisclosurePanel>
      </Disclosure>,
    );
    const trigger = screen.getByRole('button', {
      name: 'Notifications Payout alerts and the weekly summary',
      exact: true,
    });
    await expect.element(trigger).toBeInTheDocument();
    await expect
      .element(screen.getByRole('heading', { level: 2, name: /^Notifications/ }))
      .toBeInTheDocument();
    await expect
      .element(part(screen.container, '[data-slot="disclosure-start-icon"]'))
      .toHaveAttribute('aria-hidden', 'true');
  });

  it('does not toggle when disabled', async () => {
    const onExpandedChange = vi.fn();
    const screen = await renderWithDS(
      <Disclosure isDisabled onExpandedChange={onExpandedChange}>
        <DisclosureTrigger>Single sign-on</DisclosureTrigger>
        <DisclosurePanel>Connect your identity provider.</DisclosurePanel>
      </Disclosure>,
    );
    const trigger = screen.getByRole('button', { name: 'Single sign-on' });
    await expect.element(trigger).toBeDisabled();
    await trigger.click({ force: true });
    expect(onExpandedChange).not.toHaveBeenCalled();
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('collapses instantly when motion is reduced or disabled', async () => {
    for (const motion of ['reduced', 'disabled'] as const) {
      const screen = await renderWithDS(
        <Disclosure defaultExpanded>
          <DisclosureTrigger>Refund policy</DisclosureTrigger>
          <DisclosurePanel>Refunds settle in five to ten business days.</DisclosurePanel>
        </Disclosure>,
        { provider: { motion } },
      );
      const panel = part(screen.container, '[data-slot="disclosure-panel"]');
      const indicator = part(screen.container, '[data-slot="disclosure-indicator"]');
      expect(getComputedStyle(panel).transitionDuration).toBe('0s');
      expect(getComputedStyle(indicator).transitionDuration).toBe('0s');
      await screen.getByRole('button', { name: 'Refund policy' }).click();
      expect(panel.hasAttribute('hidden')).toBe(true);
      await screen.unmount();
    }
  });

  it('rounds the trigger to its container so the focus ring keeps the corners', async () => {
    const screen = await renderWithDS(
      <div className="flex flex-col gap-4">
        <Disclosure variant="outlined">
          <DisclosureTrigger>Billing address</DisclosureTrigger>
          <DisclosurePanel>14 Harbour Street, Leeds</DisclosurePanel>
        </Disclosure>
        <Disclosure variant="filled">
          <DisclosureTrigger>Payment terms</DisclosureTrigger>
          <DisclosurePanel>Invoices are due 30 days after issue.</DisclosurePanel>
        </Disclosure>
      </div>,
    );
    const [outlined, filled] = screen.container.querySelectorAll<HTMLElement>(
      '[data-slot="disclosure-trigger"]',
    );
    expect(getComputedStyle(outlined).borderTopLeftRadius).toBe('11px');
    expect(getComputedStyle(outlined).borderBottomRightRadius).toBe('11px');
    expect(getComputedStyle(filled).borderTopRightRadius).toBe('12px');
    expect(getComputedStyle(filled).borderBottomLeftRadius).toBe('12px');

    await screen.getByRole('button', { name: 'Billing address' }).click();
    await expect.element(outlined).toHaveAttribute('aria-expanded', 'true');
    expect(getComputedStyle(outlined).borderTopLeftRadius).toBe('11px');
    expect(getComputedStyle(outlined).borderBottomLeftRadius).toBe('0px');
  });

  it('leaves room above the panel content for a focus ring', async () => {
    const screen = await renderWithDS(
      <Disclosure defaultExpanded>
        <DisclosureTrigger>Payout ledger</DisclosureTrigger>
        <DisclosurePanel>
          <button type="button" className="focus-ring">
            Open the ledger
          </button>
        </DisclosurePanel>
      </Disclosure>,
    );
    await userEvent.keyboard('{Tab}{Tab}');
    const inner = screen.getByRole('button', { name: 'Open the ledger' });
    await expect.element(inner).toHaveFocus();
    const panel = part(screen.container, '[data-slot="disclosure-panel"]');
    const style = getComputedStyle(inner.element());
    const ringTop =
      inner.element().getBoundingClientRect().top -
      parseFloat(style.outlineOffset) -
      parseFloat(style.outlineWidth);
    const clip = getComputedStyle(panel).clipPath.match(/^inset\((-?[\d.]+)px/);
    const clipTop = panel.getBoundingClientRect().top + parseFloat(clip?.[1] ?? '0');
    expect(getComputedStyle(panel).overflowY).toBe('visible');
    expect(ringTop).toBeGreaterThanOrEqual(clipTop);
  });

  it('animates the panel height with motion enabled', async () => {
    const screen = await renderWithDS(
      <Disclosure>
        <DisclosureTrigger>Refund policy</DisclosureTrigger>
        <DisclosurePanel>Refunds settle in five to ten business days.</DisclosurePanel>
      </Disclosure>,
    );
    const panel = part(screen.container, '[data-slot="disclosure-panel"]');
    expect(getComputedStyle(panel).transitionProperty).toContain('height');
    await screen.getByRole('button', { name: 'Refund policy' }).click();
    await expect.poll(() => panel.style.getPropertyValue('--disclosure-panel-height')).toBe('auto');
    await expect.element(screen.getByText(/^Refunds settle/)).toBeVisible();
  });

  it('places the chevron at the inline end in RTL', async () => {
    const screen = await renderWithDS(
      <Disclosure>
        <DisclosureTrigger>سياسة الاسترداد</DisclosureTrigger>
        <DisclosurePanel>تتم تسوية المبالغ المستردة خلال خمسة إلى عشرة أيام عمل.</DisclosurePanel>
      </Disclosure>,
      { locale: 'ar' },
    );
    const title = part(screen.container, '[data-slot="disclosure-title"]');
    const indicator = part(screen.container, '[data-slot="disclosure-indicator"]');
    expect(indicator.getBoundingClientRect().right).toBeLessThan(
      title.getBoundingClientRect().left + 1,
    );
  });
});

describe('Accordion', () => {
  it('keeps one item open at a time by default', async () => {
    const screen = await renderWithDS(<BillingAccordion />);
    const refunds = screen.getByRole('button', { name: 'Refunds' });
    const payouts = screen.getByRole('button', { name: 'Payouts' });

    await refunds.click();
    await expect.element(refunds).toHaveAttribute('aria-expanded', 'true');
    await payouts.click();
    await expect.element(payouts).toHaveAttribute('aria-expanded', 'true');
    await expect.element(refunds).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps several items open with allowsMultipleExpanded', async () => {
    const onExpandedChange = vi.fn();
    const screen = await renderWithDS(
      <BillingAccordion allowsMultipleExpanded onExpandedChange={onExpandedChange} />,
    );
    const refunds = screen.getByRole('button', { name: 'Refunds' });
    const payouts = screen.getByRole('button', { name: 'Payouts' });

    await refunds.click();
    await payouts.click();
    await expect.element(refunds).toHaveAttribute('aria-expanded', 'true');
    await expect.element(payouts).toHaveAttribute('aria-expanded', 'true');
    expect([...onExpandedChange.mock.lastCall![0]].sort()).toEqual(['payouts', 'refunds']);
  });

  it('opens defaultExpandedKeys and supports controlled expandedKeys', async () => {
    function Controlled() {
      const [keys, setKeys] = useState<Set<Key>>(new Set(['payouts']));
      return (
        <>
          <button type="button" onClick={() => setKeys(new Set(['refunds', 'payouts']))}>
            Expand all
          </button>
          <Accordion allowsMultipleExpanded expandedKeys={keys} onExpandedChange={setKeys}>
            <Disclosure id="refunds">
              <DisclosureTrigger>Refunds</DisclosureTrigger>
              <DisclosurePanel>Refunds settle in five to ten business days.</DisclosurePanel>
            </Disclosure>
            <Disclosure id="payouts">
              <DisclosureTrigger>Payouts</DisclosureTrigger>
              <DisclosurePanel>Payouts run every Monday at 09:00.</DisclosurePanel>
            </Disclosure>
          </Accordion>
        </>
      );
    }
    const screen = await renderWithDS(<Controlled />);
    const refunds = screen.getByRole('button', { name: 'Refunds' });
    const payouts = screen.getByRole('button', { name: 'Payouts' });
    await expect.element(payouts).toHaveAttribute('aria-expanded', 'true');
    await expect.element(refunds).toHaveAttribute('aria-expanded', 'false');

    await screen.getByRole('button', { name: 'Expand all' }).click();
    await expect.element(refunds).toHaveAttribute('aria-expanded', 'true');
    await expect.element(payouts).toHaveAttribute('aria-expanded', 'true');

    await payouts.click();
    await expect.element(payouts).toHaveAttribute('aria-expanded', 'false');
  });

  it('moves focus between triggers with Tab and skips disabled items', async () => {
    const screen = await renderWithDS(
      <>
        <BillingAccordion />
        <button type="button">Contact support</button>
      </>,
    );
    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('button', { name: 'Refunds' })).toHaveFocus();
    await userEvent.keyboard('{Tab}');
    const payouts = screen.getByRole('button', { name: 'Payouts' });
    await expect.element(payouts).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect.element(payouts).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('button', { name: 'Contact support' })).toHaveFocus();
  });

  it('rounds the first and last triggers of an outlined accordion only', async () => {
    const screen = await renderWithDS(<BillingAccordion variant="outlined" />);
    const [first, middle, last] = screen.container.querySelectorAll<HTMLElement>(
      '[data-slot="disclosure-trigger"]',
    );
    expect(getComputedStyle(first).borderTopLeftRadius).toBe('11px');
    expect(getComputedStyle(first).borderBottomLeftRadius).toBe('0px');
    expect(getComputedStyle(middle).borderTopLeftRadius).toBe('0px');
    expect(getComputedStyle(middle).borderBottomLeftRadius).toBe('0px');
    expect(getComputedStyle(last).borderTopLeftRadius).toBe('0px');
    expect(getComputedStyle(last).borderBottomLeftRadius).toBe('11px');
  });

  it('marks the accordion and passes its size to every item', async () => {
    const sized = await renderWithDS(
      <Accordion variant="separated" size="lg">
        <Disclosure id="refunds">
          <DisclosureTrigger>Refunds</DisclosureTrigger>
          <DisclosurePanel>Refunds settle in five to ten business days.</DisclosurePanel>
        </Disclosure>
        <Disclosure id="payouts" variant="outlined" size="sm">
          <DisclosureTrigger>Payouts</DisclosureTrigger>
          <DisclosurePanel>Payouts run every Monday at 09:00.</DisclosurePanel>
        </Disclosure>
      </Accordion>,
    );
    const accordion = part(sized.container, '[data-slot="accordion"]');
    expect(accordion.getAttribute('data-variant')).toBe('separated');
    expect(accordion.getAttribute('data-size')).toBe('lg');
    const [refunds, payouts] = sized.container.querySelectorAll('[data-slot="disclosure"]');
    expect(refunds.getAttribute('data-variant')).toBe('filled');
    expect(refunds.getAttribute('data-size')).toBe('lg');
    expect(payouts.getAttribute('data-variant')).toBe('outlined');
    expect(payouts.getAttribute('data-size')).toBe('sm');
  });

  it('skips disabled items and disables every item when the group is disabled', async () => {
    const first = await renderWithDS(<BillingAccordion />);
    await expect.element(first.getByRole('button', { name: 'Invoices' })).toBeDisabled();
    await expect.element(first.getByRole('button', { name: 'Refunds' })).toBeEnabled();
    await first.unmount();

    const second = await renderWithDS(<BillingAccordion isDisabled />);
    await expect.element(second.getByRole('button', { name: 'Refunds' })).toBeDisabled();
    await expect.element(second.getByRole('button', { name: 'Payouts' })).toBeDisabled();
  });

  it('sets the item look from the accordion variant', async () => {
    for (const [variant, item] of [
      ['plain', 'plain'],
      ['outlined', 'plain'],
      ['separated', 'filled'],
    ] as const) {
      const screen = await renderWithDS(<BillingAccordion variant={variant} />);
      const items = screen.container.querySelectorAll('[data-slot="disclosure"]');
      expect(items).toHaveLength(3);
      for (const element of items) expect(element.getAttribute('data-variant')).toBe(item);
      await screen.unmount();
    }
  });

  it('keeps a nested disclosure independent of the accordion', async () => {
    const screen = await renderWithDS(
      <Accordion defaultExpandedKeys={['security']}>
        <Disclosure id="security">
          <DisclosureTrigger>Security</DisclosureTrigger>
          <DisclosurePanel>
            <Disclosure variant="plain" size="sm">
              <DisclosureTrigger level={4}>Advanced</DisclosureTrigger>
              <DisclosurePanel>Session length and IP allow list.</DisclosurePanel>
            </Disclosure>
          </DisclosurePanel>
        </Disclosure>
        <Disclosure id="billing">
          <DisclosureTrigger>Billing</DisclosureTrigger>
          <DisclosurePanel>Plan and invoices.</DisclosurePanel>
        </Disclosure>
      </Accordion>,
    );
    const security = screen.getByRole('button', { name: 'Security' });
    const advanced = screen.getByRole('button', { name: 'Advanced' });

    await advanced.click();
    await expect.element(advanced).toHaveAttribute('aria-expanded', 'true');
    await expect.element(security).toHaveAttribute('aria-expanded', 'true');
    await expect
      .element(part(screen.container, '[data-slot="disclosure"] [data-slot="disclosure"]'))
      .toHaveAttribute('data-variant', 'plain');
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-6 p-4">
          {(['plain', 'outlined', 'filled'] as const).map((variant) => (
            <Disclosure key={variant} variant={variant} defaultExpanded>
              <DisclosureTrigger
                startIcon={<LockIcon />}
                description="Two-step sign-in and session length"
              >
                Security {variant}
              </DisclosureTrigger>
              <DisclosurePanel>Members sign out after 30 minutes without activity.</DisclosurePanel>
            </Disclosure>
          ))}
          {(['plain', 'outlined', 'separated'] as const).map((variant) => (
            <BillingAccordion key={variant} variant={variant} defaultExpandedKeys={['refunds']} />
          ))}
          <Disclosure isDisabled variant="filled">
            <DisclosureTrigger description="Available on the Business plan">
              Single sign-on
            </DisclosureTrigger>
            <DisclosurePanel>Connect your identity provider.</DisclosurePanel>
          </Disclosure>
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
