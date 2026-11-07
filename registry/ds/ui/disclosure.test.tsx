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
  it('renders a heading with a trigger button on a surface by default', async () => {
    const screen = await renderWithDS(
      <Disclosure>
        <DisclosureTrigger>Link sharing</DisclosureTrigger>
        <DisclosurePanel>Invite people by email or with a link.</DisclosurePanel>
      </Disclosure>,
    );
    await expect
      .element(screen.getByRole('heading', { level: 3, name: 'Link sharing' }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole('button', { name: 'Link sharing' }))
      .toHaveAttribute('aria-expanded', 'false');
    await expect.element(screen.getByText(/^Invite people/)).not.toBeVisible();
    await expect
      .element(part(screen.container, '[data-slot="disclosure"]'))
      .toHaveAttribute('data-variant', 'surface');
  });

  it('expands and collapses on press, turns the chevron and calls onExpandedChange', async () => {
    const onExpandedChange = vi.fn();
    const screen = await renderWithDS(
      <Disclosure onExpandedChange={onExpandedChange}>
        <DisclosureTrigger>Link sharing</DisclosureTrigger>
        <DisclosurePanel>Invite people by email or with a link.</DisclosurePanel>
      </Disclosure>,
    );
    const trigger = screen.getByRole('button', { name: 'Link sharing' });
    const indicator = part(screen.container, '[data-slot="disclosure-indicator"]');
    expect(getComputedStyle(indicator).rotate).toBe('none');

    await trigger.click();
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect.element(screen.getByText(/^Invite people/)).toBeVisible();
    await expect.poll(() => getComputedStyle(indicator).rotate).toBe('-180deg');
    expect(onExpandedChange).toHaveBeenLastCalledWith(true);

    await trigger.click();
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect.element(screen.getByText(/^Invite people/)).not.toBeVisible();
    expect(onExpandedChange).toHaveBeenLastCalledWith(false);
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
        <SettingsAccordion variant="surface" />
      </div>,
    );
    const [surface, plain, first, middle, last] = screen.container.querySelectorAll<HTMLElement>(
      '[data-slot="disclosure-trigger"]',
    );
    const radius = (element: HTMLElement) => {
      const style = getComputedStyle(element);
      return [style.borderTopLeftRadius, style.borderBottomLeftRadius];
    };
    expect(getComputedStyle(surface).borderTopLeftRadius).toBe('19px');
    expect(getComputedStyle(surface).borderBottomRightRadius).toBe('19px');
    expect(getComputedStyle(plain).borderTopRightRadius).toBe('12px');
    expect(getComputedStyle(plain).borderBottomLeftRadius).toBe('12px');
    expect(radius(first)).toEqual(['19px', '0px']);
    expect(radius(middle)).toEqual(['0px', '0px']);
    expect(radius(last)).toEqual(['0px', '19px']);

    await screen.getByRole('button', { name: 'Storage location' }).click();
    await expect.element(surface).toHaveAttribute('aria-expanded', 'true');
    expect(radius(surface)).toEqual(['19px', '0px']);
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

  it('animates the panel height with motion enabled and collapses at once when reduced', async () => {
    const moving = await renderWithDS(
      <Disclosure>
        <DisclosureTrigger>Link sharing</DisclosureTrigger>
        <DisclosurePanel>Invite people by email or with a link.</DisclosurePanel>
      </Disclosure>,
    );
    const panel = part(moving.container, '[data-slot="disclosure-panel"]');
    expect(getComputedStyle(panel).transitionProperty).toContain('height');
    await moving.getByRole('button', { name: 'Link sharing' }).click();
    await expect.poll(() => panel.style.getPropertyValue('--disclosure-panel-height')).toBe('auto');
    await expect.element(moving.getByText(/^Invite people/)).toBeVisible();
    await moving.unmount();

    const still = await renderWithDS(
      <Disclosure defaultExpanded>
        <DisclosureTrigger>Link sharing</DisclosureTrigger>
        <DisclosurePanel>Invite people by email or with a link.</DisclosurePanel>
      </Disclosure>,
      { provider: { motion: 'reduced' } },
    );
    const stillPanel = part(still.container, '[data-slot="disclosure-panel"]');
    expect(getComputedStyle(stillPanel).transitionDuration).toBe('0s');
    await still.getByRole('button', { name: 'Link sharing' }).click();
    expect(stillPanel.hasAttribute('hidden')).toBe(true);
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
  it('keeps one item open at a time by default, and several with allowsMultipleExpanded', async () => {
    const single = await renderWithDS(<SettingsAccordion />);
    const sharing = single.getByRole('button', { name: 'Sharing' });
    const uploads = single.getByRole('button', { name: 'Uploads' });
    await sharing.click();
    await expect.element(sharing).toHaveAttribute('aria-expanded', 'true');
    await uploads.click();
    await expect.element(uploads).toHaveAttribute('aria-expanded', 'true');
    await expect.element(sharing).toHaveAttribute('aria-expanded', 'false');
    await single.unmount();

    const onExpandedChange = vi.fn();
    const multiple = await renderWithDS(
      <SettingsAccordion allowsMultipleExpanded onExpandedChange={onExpandedChange} />,
    );
    await multiple.getByRole('button', { name: 'Sharing' }).click();
    await multiple.getByRole('button', { name: 'Uploads' }).click();
    await expect
      .element(multiple.getByRole('button', { name: 'Sharing' }))
      .toHaveAttribute('aria-expanded', 'true');
    await expect
      .element(multiple.getByRole('button', { name: 'Uploads' }))
      .toHaveAttribute('aria-expanded', 'true');
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

  it('marks the accordion and passes its size and variant to every item', async () => {
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
    expect(sharing.getAttribute('data-size')).toBe('lg');
    expect(uploads.getAttribute('data-variant')).toBe('plain');
    expect(uploads.getAttribute('data-size')).toBe('sm');
    await sized.unmount();

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
