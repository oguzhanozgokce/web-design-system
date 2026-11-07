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

function SettingsAccordion(props: {
  variant?: AccordionVariant;
  allowsMultipleExpanded?: boolean;
  defaultExpandedKeys?: Key[];
  onExpandedChange?: (keys: Set<Key>) => void;
  isDisabled?: boolean;
}) {
  return (
    <Accordion {...props}>
      <Disclosure id="sharing">
        <DisclosureTrigger>Sharing</DisclosureTrigger>
        <DisclosurePanel>Invite people by email or with a link.</DisclosurePanel>
      </Disclosure>
      <Disclosure id="uploads">
        <DisclosureTrigger>Uploads</DisclosureTrigger>
        <DisclosurePanel>Uploads run every Monday at 09:00.</DisclosurePanel>
      </Disclosure>
      <Disclosure id="projects" isDisabled>
        <DisclosureTrigger>Projects</DisclosureTrigger>
        <DisclosurePanel>Projects are archived after a year without changes.</DisclosurePanel>
      </Disclosure>
    </Accordion>
  );
}

describe('Disclosure', () => {
  it('renders a heading with a trigger button that controls the panel', async () => {
    const screen = await renderWithDS(
      <Disclosure>
        <DisclosureTrigger>Link sharing</DisclosureTrigger>
        <DisclosurePanel>Invite people by email or with a link.</DisclosurePanel>
      </Disclosure>,
    );
    const heading = screen.getByRole('heading', { level: 3, name: 'Link sharing' });
    await expect.element(heading).toBeInTheDocument();
    const trigger = screen.getByRole('button', { name: 'Link sharing' });
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
    const panelId = trigger.element().getAttribute('aria-controls');
    const panel = document.getElementById(panelId ?? '');
    expect(panel).not.toBeNull();
    expect(panel?.getAttribute('aria-labelledby')).toBe(trigger.element().id);
    await expect.element(screen.getByText(/^Invite people/)).not.toBeVisible();
    const root = part(screen.container, '[data-slot="disclosure"]');
    await expect.element(root).toHaveAttribute('data-variant', 'surface');
    const style = getComputedStyle(root);
    expect(style.borderTopLeftRadius).toBe('20px');
    expect(style.borderTopWidth).toBe('1px');
    expect(getComputedStyle(trigger.element()).minHeight).toBe('48px');
    expect(getComputedStyle(trigger.element()).fontSize).toBe('14px');
  });

  it('turns the chevron half a turn while expanded', async () => {
    const screen = await renderWithDS(
      <Disclosure>
        <DisclosureTrigger>Link sharing</DisclosureTrigger>
        <DisclosurePanel>Invite people by email or with a link.</DisclosurePanel>
      </Disclosure>,
      { provider: { motion: 'disabled' } },
    );
    const indicator = part(screen.container, '[data-slot="disclosure-indicator"]');
    expect(getComputedStyle(indicator).rotate).toBe('none');
    await screen.getByRole('button', { name: 'Link sharing' }).click();
    expect(getComputedStyle(indicator).rotate).toBe('-180deg');
  });

  it('expands and collapses on press and calls onExpandedChange', async () => {
    const onExpandedChange = vi.fn();
    const screen = await renderWithDS(
      <Disclosure onExpandedChange={onExpandedChange}>
        <DisclosureTrigger>Link sharing</DisclosureTrigger>
        <DisclosurePanel>Invite people by email or with a link.</DisclosurePanel>
      </Disclosure>,
    );
    const trigger = screen.getByRole('button', { name: 'Link sharing' });

    await trigger.click();
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect.element(screen.getByText(/^Invite people/)).toBeVisible();
    expect(onExpandedChange).toHaveBeenLastCalledWith(true);

    await trigger.click();
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect.element(screen.getByText(/^Invite people/)).not.toBeVisible();
    expect(onExpandedChange).toHaveBeenLastCalledWith(false);
  });

  it('toggles with Enter and Space', async () => {
    const screen = await renderWithDS(
      <Disclosure>
        <DisclosureTrigger>Link sharing</DisclosureTrigger>
        <DisclosurePanel>Invite people by email or with a link.</DisclosurePanel>
      </Disclosure>,
    );
    const trigger = screen.getByRole('button', { name: 'Link sharing' });

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
            <DisclosureTrigger>Link sharing</DisclosureTrigger>
            <DisclosurePanel>Invite people by email or with a link.</DisclosurePanel>
          </Disclosure>
        </>
      );
    }
    const screen = await renderWithDS(<Controlled />);
    const trigger = screen.getByRole('button', { name: 'Link sharing' });
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
          description="Upload alerts and the weekly summary"
        >
          Notifications
        </DisclosureTrigger>
        <DisclosurePanel>Choose which emails you receive.</DisclosurePanel>
      </Disclosure>,
    );
    const trigger = screen.getByRole('button', {
      name: 'Notifications Upload alerts and the weekly summary',
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
    expect(getComputedStyle(trigger.element()).opacity).toBe('0.5');
    expect(getComputedStyle(trigger.element()).cursor).toBe('not-allowed');
    await trigger.click({ force: true });
    expect(onExpandedChange).not.toHaveBeenCalled();
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('collapses instantly when motion is reduced or disabled', async () => {
    for (const motion of ['reduced', 'disabled'] as const) {
      const screen = await renderWithDS(
        <Disclosure defaultExpanded>
          <DisclosureTrigger>Link sharing</DisclosureTrigger>
          <DisclosurePanel>Invite people by email or with a link.</DisclosurePanel>
        </Disclosure>,
        { provider: { motion } },
      );
      const panel = part(screen.container, '[data-slot="disclosure-panel"]');
      const indicator = part(screen.container, '[data-slot="disclosure-indicator"]');
      expect(getComputedStyle(panel).transitionDuration).toBe('0s');
      expect(getComputedStyle(indicator).transitionDuration).toBe('0s');
      await screen.getByRole('button', { name: 'Link sharing' }).click();
      expect(panel.hasAttribute('hidden')).toBe(true);
      await screen.unmount();
    }
  });

  it('rounds the trigger to its container so the focus ring keeps the corners', async () => {
    const screen = await renderWithDS(
      <div className="flex flex-col gap-4">
        <Disclosure>
          <DisclosureTrigger>Storage location</DisclosureTrigger>
          <DisclosurePanel>Files are stored in the region you chose.</DisclosurePanel>
        </Disclosure>
        <Disclosure variant="plain">
          <DisclosureTrigger>Retention</DisclosureTrigger>
          <DisclosurePanel>Deleted files stay in the trash for 30 days.</DisclosurePanel>
        </Disclosure>
      </div>,
    );
    const [surface, plain] = screen.container.querySelectorAll<HTMLElement>(
      '[data-slot="disclosure-trigger"]',
    );
    expect(getComputedStyle(surface).borderTopLeftRadius).toBe('19px');
    expect(getComputedStyle(surface).borderBottomRightRadius).toBe('19px');
    expect(getComputedStyle(plain).borderTopRightRadius).toBe('12px');
    expect(getComputedStyle(plain).borderBottomLeftRadius).toBe('12px');

    await screen.getByRole('button', { name: 'Storage location' }).click();
    await expect.element(surface).toHaveAttribute('aria-expanded', 'true');
    expect(getComputedStyle(surface).borderTopLeftRadius).toBe('19px');
    expect(getComputedStyle(surface).borderBottomLeftRadius).toBe('0px');
  });

  it('leaves room above the panel content for a focus ring', async () => {
    const screen = await renderWithDS(
      <Disclosure defaultExpanded>
        <DisclosureTrigger>Upload folder</DisclosureTrigger>
        <DisclosurePanel>
          <button type="button" className="focus-ring">
            Open the folder
          </button>
        </DisclosurePanel>
      </Disclosure>,
    );
    await userEvent.keyboard('{Tab}{Tab}');
    const inner = screen.getByRole('button', { name: 'Open the folder' });
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
        <DisclosureTrigger>Link sharing</DisclosureTrigger>
        <DisclosurePanel>Invite people by email or with a link.</DisclosurePanel>
      </Disclosure>,
    );
    const panel = part(screen.container, '[data-slot="disclosure-panel"]');
    expect(getComputedStyle(panel).transitionProperty).toContain('height');
    await screen.getByRole('button', { name: 'Link sharing' }).click();
    await expect.poll(() => panel.style.getPropertyValue('--disclosure-panel-height')).toBe('auto');
    await expect.element(screen.getByText(/^Invite people/)).toBeVisible();
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
    const screen = await renderWithDS(<SettingsAccordion />);
    const sharing = screen.getByRole('button', { name: 'Sharing' });
    const uploads = screen.getByRole('button', { name: 'Uploads' });

    await sharing.click();
    await expect.element(sharing).toHaveAttribute('aria-expanded', 'true');
    await uploads.click();
    await expect.element(uploads).toHaveAttribute('aria-expanded', 'true');
    await expect.element(sharing).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps several items open with allowsMultipleExpanded', async () => {
    const onExpandedChange = vi.fn();
    const screen = await renderWithDS(
      <SettingsAccordion allowsMultipleExpanded onExpandedChange={onExpandedChange} />,
    );
    const sharing = screen.getByRole('button', { name: 'Sharing' });
    const uploads = screen.getByRole('button', { name: 'Uploads' });

    await sharing.click();
    await uploads.click();
    await expect.element(sharing).toHaveAttribute('aria-expanded', 'true');
    await expect.element(uploads).toHaveAttribute('aria-expanded', 'true');
    expect([...onExpandedChange.mock.lastCall![0]].sort()).toEqual(['sharing', 'uploads']);
  });

  it('opens defaultExpandedKeys and supports controlled expandedKeys', async () => {
    function Controlled() {
      const [keys, setKeys] = useState<Set<Key>>(new Set(['uploads']));
      return (
        <>
          <button type="button" onClick={() => setKeys(new Set(['sharing', 'uploads']))}>
            Expand all
          </button>
          <Accordion allowsMultipleExpanded expandedKeys={keys} onExpandedChange={setKeys}>
            <Disclosure id="sharing">
              <DisclosureTrigger>Sharing</DisclosureTrigger>
              <DisclosurePanel>Invite people by email or with a link.</DisclosurePanel>
            </Disclosure>
            <Disclosure id="uploads">
              <DisclosureTrigger>Uploads</DisclosureTrigger>
              <DisclosurePanel>Uploads run every Monday at 09:00.</DisclosurePanel>
            </Disclosure>
          </Accordion>
        </>
      );
    }
    const screen = await renderWithDS(<Controlled />);
    const sharing = screen.getByRole('button', { name: 'Sharing' });
    const uploads = screen.getByRole('button', { name: 'Uploads' });
    await expect.element(uploads).toHaveAttribute('aria-expanded', 'true');
    await expect.element(sharing).toHaveAttribute('aria-expanded', 'false');

    await screen.getByRole('button', { name: 'Expand all' }).click();
    await expect.element(sharing).toHaveAttribute('aria-expanded', 'true');
    await expect.element(uploads).toHaveAttribute('aria-expanded', 'true');

    await uploads.click();
    await expect.element(uploads).toHaveAttribute('aria-expanded', 'false');
  });

  it('moves focus between triggers with Tab and skips disabled items', async () => {
    const screen = await renderWithDS(
      <>
        <SettingsAccordion />
        <button type="button">Contact support</button>
      </>,
    );
    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('button', { name: 'Sharing' })).toHaveFocus();
    await userEvent.keyboard('{Tab}');
    const uploads = screen.getByRole('button', { name: 'Uploads' });
    await expect.element(uploads).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect.element(uploads).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('button', { name: 'Contact support' })).toHaveFocus();
  });

  it('rounds the first and last triggers of a surface accordion only', async () => {
    const screen = await renderWithDS(<SettingsAccordion variant="surface" />);
    const [first, middle, last] = screen.container.querySelectorAll<HTMLElement>(
      '[data-slot="disclosure-trigger"]',
    );
    expect(getComputedStyle(first).borderTopLeftRadius).toBe('19px');
    expect(getComputedStyle(first).borderBottomLeftRadius).toBe('0px');
    expect(getComputedStyle(middle).borderTopLeftRadius).toBe('0px');
    expect(getComputedStyle(middle).borderBottomLeftRadius).toBe('0px');
    expect(getComputedStyle(last).borderTopLeftRadius).toBe('0px');
    expect(getComputedStyle(last).borderBottomLeftRadius).toBe('19px');
  });

  it('insets the separators of a surface accordion and runs them full width when plain', async () => {
    const screen = await renderWithDS(
      <div className="flex w-80 flex-col gap-4">
        <SettingsAccordion variant="surface" />
        <SettingsAccordion variant="plain" />
      </div>,
    );
    const items = [...screen.container.querySelectorAll<HTMLElement>('[data-slot="disclosure"]')];
    const separator = getComputedStyle(items[0], '::after');
    expect(separator.height).toBe('1px');
    expect(separator.insetInlineStart).toBe('16px');
    expect(getComputedStyle(items[2], '::after').display).toBe('none');
    expect(getComputedStyle(items[3]).borderBottomWidth).toBe('1px');
    expect(getComputedStyle(items[5]).borderBottomWidth).toBe('0px');
  });

  it('marks the accordion and passes its size to every item', async () => {
    const sized = await renderWithDS(
      <Accordion variant="separated" size="lg">
        <Disclosure id="sharing">
          <DisclosureTrigger>Sharing</DisclosureTrigger>
          <DisclosurePanel>Invite people by email or with a link.</DisclosurePanel>
        </Disclosure>
        <Disclosure id="uploads" variant="plain" size="sm">
          <DisclosureTrigger>Uploads</DisclosureTrigger>
          <DisclosurePanel>Uploads run every Monday at 09:00.</DisclosurePanel>
        </Disclosure>
      </Accordion>,
    );
    const accordion = part(sized.container, '[data-slot="accordion"]');
    expect(accordion.getAttribute('data-variant')).toBe('separated');
    expect(accordion.getAttribute('data-size')).toBe('lg');
    const [sharing, uploads] = sized.container.querySelectorAll('[data-slot="disclosure"]');
    expect(sharing.getAttribute('data-variant')).toBe('surface');
    expect(sharing.getAttribute('data-size')).toBe('lg');
    expect(uploads.getAttribute('data-variant')).toBe('plain');
    expect(uploads.getAttribute('data-size')).toBe('sm');
  });

  it('skips disabled items and disables every item when the group is disabled', async () => {
    const first = await renderWithDS(<SettingsAccordion />);
    await expect.element(first.getByRole('button', { name: 'Projects' })).toBeDisabled();
    await expect.element(first.getByRole('button', { name: 'Sharing' })).toBeEnabled();
    await first.unmount();

    const second = await renderWithDS(<SettingsAccordion isDisabled />);
    await expect.element(second.getByRole('button', { name: 'Sharing' })).toBeDisabled();
    await expect.element(second.getByRole('button', { name: 'Uploads' })).toBeDisabled();
  });

  it('sets the item look from the accordion variant', async () => {
    for (const [variant, item] of [
      ['plain', 'plain'],
      ['surface', 'plain'],
      ['separated', 'surface'],
    ] as const) {
      const screen = await renderWithDS(<SettingsAccordion variant={variant} />);
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
        <Disclosure id="sharing">
          <DisclosureTrigger>Sharing</DisclosureTrigger>
          <DisclosurePanel>Plan and projects.</DisclosurePanel>
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
          {(['plain', 'surface'] as const).map((variant) => (
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
          {(['plain', 'surface', 'separated'] as const).map((variant) => (
            <SettingsAccordion key={variant} variant={variant} defaultExpandedKeys={['sharing']} />
          ))}
          <Disclosure isDisabled>
            <DisclosureTrigger description="Needs an identity provider">
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
