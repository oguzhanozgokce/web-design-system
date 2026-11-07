import { StrictMode, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { I18nProvider, type Key } from 'react-aria-components';
import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { InboxIcon, MailIcon } from '@/registry/ds/lib/icons';
import { Tab, TabList, TabPanel, Tabs, type TabsProps } from '@/registry/ds/ui/tabs';

const still = { provider: { motion: 'reduced' as const } };

const folders = ['Overview', 'Projects', 'Messages', 'Notes'];

function FolderTabs(props: Omit<TabsProps, 'children'>) {
  return (
    <Tabs {...props}>
      <TabList aria-label="Folder">
        {folders.map((name) => (
          <Tab key={name} id={name.toLowerCase()}>
            {name}
          </Tab>
        ))}
      </TabList>
      {folders.map((name) => (
        <TabPanel key={name} id={name.toLowerCase()}>
          {name} panel
        </TabPanel>
      ))}
    </Tabs>
  );
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August'];

function MonthTabs({ width, ...props }: Omit<TabsProps, 'children'> & { width?: number }) {
  return (
    <div style={width ? { width } : undefined}>
      <Tabs {...props}>
        <TabList aria-label="Month">
          {monthNames.map((month) => (
            <Tab key={month} id={month}>
              {month}
            </Tab>
          ))}
        </TabList>
        {monthNames.map((month) => (
          <TabPanel key={month} id={month}>
            {month}
          </TabPanel>
        ))}
      </Tabs>
    </div>
  );
}

function indicatorOwner(container: HTMLElement) {
  const indicators = container.querySelectorAll('[data-slot="indicator"]');
  expect(indicators).toHaveLength(1);
  return indicators[0].closest('[role="tab"]');
}

describe('Tabs', () => {
  it('selects on press, reports the key and moves the indicator', async () => {
    const onSelectionChange = vi.fn();
    const screen = await renderWithDS(<FolderTabs onSelectionChange={onSelectionChange} />);
    const tabs = screen.container.querySelector('[data-slot="tabs"]');
    expect(tabs).toHaveAttribute('data-variant', 'underline');
    expect(tabs).toHaveAttribute('data-size', 'md');
    const messages = screen.getByRole('tab', { name: 'Messages' });
    await messages.click();
    await expect.element(messages).toHaveAttribute('aria-selected', 'true');
    expect(onSelectionChange).toHaveBeenLastCalledWith('messages');
    await expect.element(screen.getByRole('tabpanel')).toHaveTextContent('Messages panel');
    expect(indicatorOwner(screen.container)).toBe(messages.element());
  });
  it('starts the indicator travel exactly on the previous tab, in both directions', async () => {
    const control: { select: (key: Key) => void } = { select: () => {} };
    function Matrix() {
      const [selected, setSelected] = useState<Key>('overview');
      useEffect(() => {
        control.select = setSelected;
      }, []);
      return (
        <>
          {(['ltr', 'rtl'] as const).map((dir) => (
            <I18nProvider key={dir} locale={dir === 'rtl' ? 'ar' : 'en'}>
              <div dir={dir}>
                {(['underline', 'pill'] as const).map((variant) => (
                  <FolderTabs
                    key={variant}
                    variant={variant}
                    selectedKey={selected}
                    onSelectionChange={setSelected}
                  />
                ))}
              </div>
            </I18nProvider>
          ))}
        </>
      );
    }
    const screen = await renderWithDS(<Matrix />);
    const instances = [...screen.container.querySelectorAll<HTMLElement>('[data-slot="tabs"]')];
    expect(instances).toHaveLength(4);
    const indicatorIn = (tabs: HTMLElement, name: string) =>
      [...tabs.querySelectorAll('[role="tab"]')]
        .find((tab) => tab.textContent === name)!
        .querySelector<HTMLElement>('[data-slot="indicator"]')!;

    const before = instances.map((tabs) => indicatorIn(tabs, 'Overview').getBoundingClientRect());
    flushSync(() => control.select('notes'));
    instances.forEach((tabs, index) => {
      const start = indicatorIn(tabs, 'Notes').getBoundingClientRect();
      expect(start.left).toBeCloseTo(before[index].left, 0);
      expect(start.width).toBeCloseTo(before[index].width, 0);
    });
  });

  it('settles the indicator on the new tab with no inline offset left behind', async () => {
    const cases = [
      { options: {}, props: {}, edges: ['left', 'right', 'bottom'] },
      { options: { locale: 'ar' }, props: {}, edges: ['left', 'right', 'bottom'] },
      { options: {}, props: { orientation: 'vertical' }, edges: ['right', 'top', 'bottom'] },
    ] as const;
    for (const { options, props, edges } of cases) {
      const screen = await renderWithDS(
        <StrictMode>
          <FolderTabs {...props} />
        </StrictMode>,
        options,
      );
      const notes = screen.getByRole('tab', { name: 'Notes' });
      await notes.click();
      await expect
        .poll(() => {
          const indicator = notes.element().querySelector('[data-slot="indicator"]');
          if (!indicator) return Infinity;
          const tab = notes.element().getBoundingClientRect();
          const rect = indicator.getBoundingClientRect();
          return Math.max(...edges.map((edge) => Math.abs(rect[edge] - tab[edge])));
        })
        .toBeLessThan(1);
      const indicator = notes.element().querySelector<HTMLElement>('[data-slot="indicator"]')!;
      expect(indicator.style.translate).toBe('');
      await screen.unmount();
    }
  });
  it('jumps without a transition when motion is reduced', async () => {
    const screen = await renderWithDS(<FolderTabs />, still);
    await screen.getByRole('tab', { name: 'Notes' }).click();
    const indicator = screen.container.querySelector<HTMLElement>('[data-slot="indicator"]')!;
    expect(getComputedStyle(indicator).transitionProperty).toBe('none');
    expect(indicator.getAnimations()).toHaveLength(0);
  });

  it('sizes underline tabs and pill tracks at 32, 40 and 48px', async () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    const screen = await renderWithDS(
      <div className="flex flex-col gap-4">
        {sizes.map((size) => (
          <FolderTabs key={`underline-${size}`} size={size} />
        ))}
        {sizes.map((size) => (
          <FolderTabs key={`pill-${size}`} variant="pill" size={size} />
        ))}
      </div>,
    );
    const instances = [...screen.container.querySelectorAll<HTMLElement>('[data-slot="tabs"]')];
    const heights = instances.map((tabs, index) =>
      index < 3
        ? tabs.querySelector('[role="tab"]')!.getBoundingClientRect().height
        : tabs.querySelector('[data-slot="tab-list-container"]')!.getBoundingClientRect().height,
    );
    expect(heights).toEqual([32, 40, 48, 32, 40, 48]);
    expect(instances[4]).toHaveAttribute('data-size', 'md');
    expect(getComputedStyle(instances[4].querySelector('[role="tab"]')!).borderRadius).toBe(
      '9999px',
    );
  });

  it('stretches the tabs equally across the row with fullWidth', async () => {
    const screen = await renderWithDS(
      <div style={{ width: 480 }}>
        <FolderTabs fullWidth />
        <FolderTabs fullWidth variant="pill" />
      </div>,
      still,
    );
    for (const tabs of screen.container.querySelectorAll<HTMLElement>('[data-slot="tabs"]')) {
      const widths = [...tabs.querySelectorAll('[role="tab"]')].map(
        (tab) => tab.getBoundingClientRect().width,
      );
      widths.forEach((width) => expect(width).toBeCloseTo(widths[0], 0));
      const row = tabs.querySelector('[data-slot="tab-list-container"]')!.getBoundingClientRect();
      expect(row.width).toBeCloseTo(480, 0);
    }
  });
  it('paints the pill indicator on the segment surface and the underline in primary', async () => {
    const screen = await renderWithDS(
      <>
        <FolderTabs />
        <FolderTabs variant="pill" />
        <span data-testid="primary" className="bg-primary" />
        <span data-testid="segment" className="bg-surface-segment" />
      </>,
      still,
    );
    const [underline, pill] = [
      ...screen.container.querySelectorAll<HTMLElement>('[data-slot="indicator"]'),
    ];
    const background = (element: Element) => getComputedStyle(element).backgroundColor;
    expect(background(underline)).toBe(background(screen.getByTestId('primary').element()));
    expect(background(pill)).toBe(background(screen.getByTestId('segment').element()));
    expect(underline.getBoundingClientRect().height).toBe(2);
  });

  it('formats count badges for the locale and labels them with the badge labels', async () => {
    const screen = await renderWithDS(
      <Tabs>
        <TabList aria-label="Folders">
          <Tab id="inbox" badge={12}>
            Inbox
          </Tab>
          <Tab id="drafts" badge={1280}>
            Drafts
          </Tab>
          <Tab id="shared" badge>
            Shared
          </Tab>
          <Tab id="archive" badge={0}>
            Archive
          </Tab>
        </TabList>
        <TabPanel id="inbox">Inbox</TabPanel>
        <TabPanel id="drafts">Drafts</TabPanel>
        <TabPanel id="shared">Shared</TabPanel>
        <TabPanel id="archive">Archive</TabPanel>
      </Tabs>,
      {
        locale: 'tr',
        provider: { labels: { badge: { count: '{count} new', dot: 'New' } } },
      },
    );
    await expect.element(screen.getByRole('tab', { name: 'Inbox 12 new' })).toBeVisible();
    await expect.element(screen.getByRole('tab', { name: 'Drafts 99+ new' })).toBeVisible();
    await expect.element(screen.getByRole('tab', { name: 'Shared New' })).toBeVisible();
    const archive = screen.getByRole('tab', { name: 'Archive', exact: true });
    await expect.element(archive).toBeVisible();
    expect(archive.element().querySelector('[data-slot="badge"]')).toBeNull();
  });

  it('pins the badge to the icon on stacked and icon-only tabs', async () => {
    const screen = await renderWithDS(
      <>
        <Tabs iconPlacement="top">
          <TabList aria-label="Mail">
            <Tab id="inbox" icon={<InboxIcon />} badge={4}>
              Inbox
            </Tab>
          </TabList>
          <TabPanel id="inbox">Inbox</TabPanel>
        </Tabs>
        <Tabs>
          <TabList aria-label="Folders">
            <Tab id="sent" icon={<MailIcon />} aria-label="Sent" badge />
            <Tab id="drafts" icon={<InboxIcon />} badge={2}>
              Drafts
            </Tab>
          </TabList>
          <TabPanel id="sent">Sent</TabPanel>
          <TabPanel id="drafts">Drafts</TabPanel>
        </Tabs>
      </>,
    );
    const stacked = screen.getByRole('tab', { name: 'Inbox 4 new' });
    const inline = screen.getByRole('tab', { name: 'Drafts 2 new' });
    await expect.element(stacked).toHaveAttribute('data-stacked', 'true');
    await expect.element(inline).not.toHaveAttribute('data-stacked');
    expect(stacked.element().getBoundingClientRect().height).toBe(56);
    expect(inline.element().getBoundingClientRect().height).toBe(40);

    const anchored = (name: string) =>
      screen
        .getByRole('tab', { name })
        .element()
        .querySelector('[data-slot="icon"] [data-slot="badge-anchor"] [data-slot="badge"]');
    expect(anchored('Inbox 4 new')).not.toBeNull();
    expect(anchored('Sent')).not.toBeNull();
    expect(anchored('Drafts 2 new')).toBeNull();
  });
  it('scrolls overflowing tabs, fades the hidden edge and reveals the selected tab', async () => {
    const screen = await renderWithDS(<MonthTabs width={280} />, still);
    const scroller = screen.container.querySelector<HTMLElement>('[data-slot="tab-scroller"]')!;
    await expect.element(scroller).toHaveAttribute('data-overflow-end', 'true');
    await expect.element(scroller).not.toHaveAttribute('data-overflow-start');
    expect(getComputedStyle(scroller).maskImage).toContain('linear-gradient');
    scroller.parentElement!.style.color = 'rgb(0 0 0 / 0.4)';
    expect(getComputedStyle(scroller).maskImage).not.toMatch(/,\s*0\.\d+\)/);
    scroller.parentElement!.style.color = '';

    screen.getByRole('tab', { name: 'January' }).element().focus();
    await userEvent.keyboard('{End}');
    const august = screen.getByRole('tab', { name: 'August' });
    await expect.element(august).toHaveAttribute('aria-selected', 'true');
    await expect.element(scroller).toHaveAttribute('data-overflow-start', 'true');
    await expect.element(scroller).not.toHaveAttribute('data-overflow-end');
    const view = scroller.getBoundingClientRect();
    const tab = august.element().getBoundingClientRect();
    expect(tab.right).toBeLessThanOrEqual(view.right + 1);
    expect(tab.left).toBeGreaterThanOrEqual(view.left - 1);
  });

  it('shows a scroll button only at an edge with hidden tabs and pages the list', async () => {
    const screen = await renderWithDS(<MonthTabs width={280} />, still);
    const scroller = screen.container.querySelector<HTMLElement>('[data-slot="tab-scroller"]')!;
    const button = (edge: string) =>
      screen.container.querySelector<HTMLElement>(
        `[data-slot="tab-scroll-button"][data-edge="${edge}"]`,
      );
    await expect.poll(() => button('end')).not.toBeNull();
    expect(button('start')).toBeNull();

    await userEvent.click(button('end')!);
    await expect.poll(() => scroller.scrollLeft).toBeGreaterThan(150);
    await expect.poll(() => button('start')).not.toBeNull();
    await expect
      .element(screen.getByRole('tab', { name: 'January' }))
      .toHaveAttribute('aria-selected', 'true');

    for (let page = 0; page < 6 && button('end'); page++) await userEvent.click(button('end')!);
    await expect.poll(() => button('end')).toBeNull();
    await userEvent.click(button('start')!);
    await expect.poll(() => button('end')).not.toBeNull();
  });

  it('leaves the scroll buttons out of the keyboard order and the accessibility tree', async () => {
    const screen = await renderWithDS(
      <>
        <MonthTabs width={280} />
        <button type="button">After</button>
      </>,
      still,
    );
    const end = await vi.waitUntil(() =>
      screen.container.querySelector<HTMLElement>('[data-slot="tab-scroll-button"]'),
    );
    expect(end.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(end.tabIndex).toBe(-1);

    screen.getByRole('tab', { name: 'January' }).element().focus();
    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('tabpanel')).toHaveFocus();
    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('button', { name: 'After' })).toHaveFocus();

    screen.getByRole('tab', { name: 'January' }).element().focus();
    await userEvent.click(end);
    await expect.element(screen.getByRole('tab', { name: 'January' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect
      .element(screen.getByRole('tab', { name: 'February' }))
      .toHaveAttribute('aria-selected', 'true');
  });

  it('mirrors the scroll buttons in RTL layouts', async () => {
    const screen = await renderWithDS(<MonthTabs width={240} />, { locale: 'ar', ...still });
    const scroller = screen.container.querySelector<HTMLElement>('[data-slot="tab-scroller"]')!;
    await expect.element(scroller).toHaveAttribute('data-overflow-end', 'true');
    const end = await vi.waitUntil(() =>
      screen.container.querySelector<HTMLElement>('[data-edge="end"]'),
    );
    const view = scroller.getBoundingClientRect();
    expect(end.getBoundingClientRect().left).toBeLessThan(view.left + view.width / 2);
    await userEvent.click(end);
    await expect.poll(() => scroller.scrollLeft).toBeLessThan(-100);
    await expect.element(scroller).toHaveAttribute('data-overflow-start', 'true');
    const start = await vi.waitUntil(() =>
      screen.container.querySelector<HTMLElement>('[data-edge="start"]'),
    );
    expect(start.getBoundingClientRect().right).toBeGreaterThan(view.left + view.width / 2);

    screen.getByRole('tab', { name: 'January' }).element().focus();
    await userEvent.keyboard('{End}');
    const august = screen.getByRole('tab', { name: 'August' });
    await expect.element(august).toHaveAttribute('aria-selected', 'true');
    await expect.element(scroller).not.toHaveAttribute('data-overflow-end');
    const tab = august.element().getBoundingClientRect();
    expect(tab.left).toBeGreaterThanOrEqual(view.left - 1);
    expect(tab.right).toBeLessThanOrEqual(view.right + 1);
  });
  it('pages a vertical list with buttons at the top and bottom', async () => {
    const screen = await renderWithDS(<MonthTabs orientation="vertical" className="h-40" />, still);
    const scroller = screen.container.querySelector<HTMLElement>('[data-slot="tab-scroller"]')!;
    const end = await vi.waitUntil(() =>
      screen.container.querySelector<HTMLElement>('[data-edge="end"]'),
    );
    expect(end.getBoundingClientRect().bottom).toBeGreaterThan(
      scroller.getBoundingClientRect().top + 80,
    );
    await userEvent.click(end);
    await expect.poll(() => scroller.scrollTop).toBeGreaterThan(40);
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-6 p-4">
          {(['underline', 'pill'] as const).map((variant) => (
            <Tabs key={variant} variant={variant} disabledKeys={['archive']}>
              <TabList aria-label={`Mail ${variant}`}>
                <Tab id="inbox" icon={<InboxIcon />} badge={3}>
                  Inbox
                </Tab>
                <Tab id="sent" badge>
                  Sent
                </Tab>
                <Tab id="archive">Archive</Tab>
              </TabList>
              <TabPanel id="inbox">Three unread messages.</TabPanel>
              <TabPanel id="sent">Sent</TabPanel>
              <TabPanel id="archive">Archive</TabPanel>
            </Tabs>
          ))}
          <MonthTabs width={240} />
          <MonthTabs width={240} variant="pill" size="sm" />
          <FolderTabs orientation="vertical" />
        </div>,
        options,
      );
      await vi.waitUntil(() => screen.container.querySelector('[data-slot="tab-scroll-button"]'));
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
