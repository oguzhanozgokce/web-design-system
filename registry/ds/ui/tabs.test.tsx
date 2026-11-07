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
  it('renders a labelled tab list with one selected tab, its panel and one indicator', async () => {
    const screen = await renderWithDS(<FolderTabs />);
    await expect.element(screen.getByRole('tablist', { name: 'Folder' })).toBeVisible();
    const overview = screen.getByRole('tab', { name: 'Overview' });
    await expect.element(overview).toHaveAttribute('aria-selected', 'true');
    await expect.element(screen.getByRole('tabpanel')).toHaveTextContent('Overview panel');
    await expect.element(screen.getByRole('tabpanel')).toHaveAccessibleName('Overview');
    expect(indicatorOwner(screen.container)).toBe(overview.element());
    const tabs = screen.container.querySelector('[data-slot="tabs"]');
    expect(tabs).toHaveAttribute('data-variant', 'underline');
    expect(tabs).toHaveAttribute('data-size', 'md');
  });

  it('selects on press, reports the key and moves the indicator', async () => {
    const onSelectionChange = vi.fn();
    const screen = await renderWithDS(<FolderTabs onSelectionChange={onSelectionChange} />);
    const messages = screen.getByRole('tab', { name: 'Messages' });
    await messages.click();
    await expect.element(messages).toHaveAttribute('aria-selected', 'true');
    expect(onSelectionChange).toHaveBeenLastCalledWith('messages');
    await expect.element(screen.getByRole('tabpanel')).toHaveTextContent('Messages panel');
    expect(indicatorOwner(screen.container)).toBe(messages.element());
  });

  it('slides the indicator from the previous tab over 250ms on the fluid curve', async () => {
    const screen = await renderWithDS(<FolderTabs />);
    await screen.getByRole('tab', { name: 'Notes' }).click();
    const indicator = screen.container.querySelector<HTMLElement>('[data-slot="indicator"]')!;
    const style = getComputedStyle(indicator);
    expect(style.transitionProperty).toBe('width, height, translate');
    expect(style.transitionDuration).toBe('0.25s');
    expect(style.transitionTimingFunction).toBe('cubic-bezier(0.32, 0.72, 0, 1)');
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
    const screen = await renderWithDS(
      <StrictMode>
        <FolderTabs />
      </StrictMode>,
    );
    const notes = screen.getByRole('tab', { name: 'Notes' });
    await notes.click();
    await expect
      .poll(() => {
        const indicator = notes.element().querySelector('[data-slot="indicator"]');
        if (!indicator) return Infinity;
        const tab = notes.element().getBoundingClientRect();
        return Math.abs(indicator.getBoundingClientRect().left - tab.left);
      })
      .toBeLessThan(1);
    const indicator = notes.element().querySelector<HTMLElement>('[data-slot="indicator"]')!;
    expect(indicator.style.translate).toBe('');
  });

  it('jumps without a transition when motion is reduced', async () => {
    const screen = await renderWithDS(<FolderTabs />, still);
    await screen.getByRole('tab', { name: 'Notes' }).click();
    const indicator = screen.container.querySelector<HTMLElement>('[data-slot="indicator"]')!;
    expect(getComputedStyle(indicator).transitionProperty).toBe('none');
    expect(indicator.getAnimations()).toHaveLength(0);
  });

  it('moves with arrow keys, Home and End', async () => {
    const screen = await renderWithDS(<FolderTabs />);
    screen.getByRole('tab', { name: 'Overview' }).element().focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect
      .element(screen.getByRole('tab', { name: 'Projects' }))
      .toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{End}');
    await expect
      .element(screen.getByRole('tab', { name: 'Notes' }))
      .toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Home}');
    await expect
      .element(screen.getByRole('tab', { name: 'Overview' }))
      .toHaveAttribute('aria-selected', 'true');
  });

  it('mirrors the arrow keys in RTL layouts', async () => {
    const screen = await renderWithDS(<FolderTabs />, { locale: 'ar' });
    screen.getByRole('tab', { name: 'Overview' }).element().focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect
      .element(screen.getByRole('tab', { name: 'Projects' }))
      .toHaveAttribute('aria-selected', 'true');
  });

  it('places the indicator under the selected tab in RTL layouts', async () => {
    const screen = await renderWithDS(<FolderTabs />, {
      locale: 'ar',
      ...still,
    });
    const projects = screen.getByRole('tab', { name: 'Projects' });
    await projects.click();
    const indicator = screen.container.querySelector<HTMLElement>('[data-slot="indicator"]')!;
    const tabRect = projects.element().getBoundingClientRect();
    const indicatorRect = indicator.getBoundingClientRect();
    expect(indicatorRect.left).toBeCloseTo(tabRect.left, 0);
    expect(indicatorRect.right).toBeCloseTo(tabRect.right, 0);
    expect(indicatorRect.bottom).toBeCloseTo(tabRect.bottom, 0);
  });

  it('follows a controlled selectedKey', async () => {
    function Controlled() {
      const [selected, setSelected] = useState<Key>('notes');
      return (
        <>
          <FolderTabs selectedKey={selected} onSelectionChange={setSelected} />
          <button type="button" onClick={() => setSelected('projects')}>
            Show projects
          </button>
        </>
      );
    }
    const screen = await renderWithDS(<Controlled />);
    await expect
      .element(screen.getByRole('tab', { name: 'Notes' }))
      .toHaveAttribute('aria-selected', 'true');
    await screen.getByRole('button', { name: 'Show projects' }).click();
    await expect
      .element(screen.getByRole('tab', { name: 'Projects' }))
      .toHaveAttribute('aria-selected', 'true');
    await expect.element(screen.getByRole('tabpanel')).toHaveTextContent('Projects panel');
  });

  it('skips disabled tabs', async () => {
    const onSelectionChange = vi.fn();
    const screen = await renderWithDS(
      <FolderTabs disabledKeys={['projects']} onSelectionChange={onSelectionChange} />,
    );
    const projects = screen.getByRole('tab', { name: 'Projects' });
    await expect.element(projects).toHaveAttribute('aria-disabled', 'true');
    await projects.click({ force: true });
    await expect.element(projects).toHaveAttribute('aria-selected', 'false');

    screen.getByRole('tab', { name: 'Overview' }).element().focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect
      .element(screen.getByRole('tab', { name: 'Messages' }))
      .toHaveAttribute('aria-selected', 'true');
    expect(onSelectionChange).not.toHaveBeenCalledWith('projects');
  });

  it('keeps icons inline by default and stacks them with iconPlacement="top"', async () => {
    const screen = await renderWithDS(
      <>
        <Tabs iconPlacement="top">
          <TabList aria-label="Mail">
            <Tab id="inbox" icon={<InboxIcon />}>
              Inbox
            </Tab>
            <Tab id="sent" icon={<MailIcon />}>
              Sent
            </Tab>
          </TabList>
          <TabPanel id="inbox">Inbox</TabPanel>
          <TabPanel id="sent">Sent</TabPanel>
        </Tabs>
        <Tabs>
          <TabList aria-label="Folders">
            <Tab id="inbox" icon={<InboxIcon />}>
              Inbox
            </Tab>
          </TabList>
          <TabPanel id="inbox">Inbox</TabPanel>
        </Tabs>
      </>,
    );
    const stacked = screen.getByRole('tablist', { name: 'Mail' }).getByRole('tab').first();
    const inline = screen.getByRole('tablist', { name: 'Folders' }).getByRole('tab').first();
    await expect.element(stacked).toHaveAttribute('data-stacked', 'true');
    await expect.element(inline).not.toHaveAttribute('data-stacked');
    expect(stacked.element().getBoundingClientRect().height).toBe(56);
    expect(inline.element().getBoundingClientRect().height).toBe(40);
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
        <TabList aria-label="Klasörler">
          <Tab id="inbox" badge={12}>
            Gelen kutusu
          </Tab>
          <Tab id="drafts" badge={1280}>
            Taslaklar
          </Tab>
          <Tab id="shared" badge>
            Paylaşılanlar
          </Tab>
          <Tab id="archive" badge={0}>
            Arşiv
          </Tab>
        </TabList>
        <TabPanel id="inbox">Gelen kutusu</TabPanel>
        <TabPanel id="drafts">Taslaklar</TabPanel>
        <TabPanel id="shared">Paylaşılanlar</TabPanel>
        <TabPanel id="archive">Arşiv</TabPanel>
      </Tabs>,
      {
        locale: 'tr',
        provider: { labels: { badge: { count: '{count} yeni', dot: 'Yeni' } } },
      },
    );
    await expect.element(screen.getByRole('tab', { name: 'Gelen kutusu 12 yeni' })).toBeVisible();
    await expect.element(screen.getByRole('tab', { name: 'Taslaklar 99+ yeni' })).toBeVisible();
    await expect.element(screen.getByRole('tab', { name: 'Paylaşılanlar Yeni' })).toBeVisible();
    const archive = screen.getByRole('tab', { name: 'Arşiv', exact: true });
    await expect.element(archive).toBeVisible();
    expect(archive.element().querySelector('[data-slot="badge"]')).toBeNull();
  });

  it('formats badge digits for Arabic', async () => {
    const screen = await renderWithDS(
      <Tabs>
        <TabList aria-label="المجلدات">
          <Tab id="inbox" badge={12}>
            البريد الوارد
          </Tab>
        </TabList>
        <TabPanel id="inbox">البريد الوارد</TabPanel>
      </Tabs>,
      { locale: 'ar' },
    );
    await expect
      .element(screen.container.querySelector<HTMLElement>('[data-slot="badge-label"]'))
      .toHaveTextContent(new Intl.NumberFormat('ar').format(12));
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
    const anchored = (name: string) =>
      screen
        .getByRole('tab', { name })
        .element()
        .querySelector('[data-slot="icon"] [data-slot="badge-anchor"] [data-slot="badge"]');
    expect(anchored('Inbox 4 new')).not.toBeNull();
    expect(anchored('Sent')).not.toBeNull();
    expect(anchored('Drafts 2 new')).toBeNull();
  });

  it('waits for Enter with manual keyboard activation', async () => {
    const screen = await renderWithDS(<FolderTabs keyboardActivation="manual" />);
    screen.getByRole('tab', { name: 'Overview' }).element().focus();
    await userEvent.keyboard('{ArrowRight}');
    const projects = screen.getByRole('tab', { name: 'Projects' });
    await expect.element(projects).toHaveFocus();
    await expect.element(projects).toHaveAttribute('aria-selected', 'false');
    await userEvent.keyboard('{Enter}');
    await expect.element(projects).toHaveAttribute('aria-selected', 'true');
  });

  it('dims disabled tabs to half opacity with a not-allowed cursor', async () => {
    const screen = await renderWithDS(
      <>
        <FolderTabs isDisabled />
        <FolderTabs variant="pill" disabledKeys={['projects']} />
      </>,
    );
    const tabs = [...screen.container.querySelectorAll<HTMLElement>('[role="tab"]')];
    const disabled = tabs.filter((tab) => tab.hasAttribute('data-disabled'));
    expect(disabled).toHaveLength(5);
    for (const tab of disabled) {
      expect(getComputedStyle(tab).opacity).toBe('0.5');
      expect(getComputedStyle(tab).cursor).toBe('not-allowed');
    }
    expect(getComputedStyle(tabs[4]).opacity).toBe('1');
  });

  it('works vertically with up and down arrows and an end-edge indicator', async () => {
    const screen = await renderWithDS(<FolderTabs orientation="vertical" />, still);
    const list = screen.getByRole('tablist', { name: 'Folder' });
    await expect.element(list).toHaveAttribute('aria-orientation', 'vertical');
    screen.getByRole('tab', { name: 'Overview' }).element().focus();
    await userEvent.keyboard('{ArrowDown}');
    const projects = screen.getByRole('tab', { name: 'Projects' });
    await expect.element(projects).toHaveAttribute('aria-selected', 'true');
    const indicator = screen.container.querySelector<HTMLElement>('[data-slot="indicator"]')!;
    expect(indicator.getBoundingClientRect().right).toBeCloseTo(
      projects.element().getBoundingClientRect().right,
      0,
    );
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

  it('scrolls the right way in RTL layouts', async () => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس'];
    const screen = await renderWithDS(
      <div style={{ width: 240 }}>
        <Tabs>
          <TabList aria-label="الشهر">
            {months.map((month) => (
              <Tab key={month} id={month}>
                {month}
              </Tab>
            ))}
          </TabList>
          {months.map((month) => (
            <TabPanel key={month} id={month}>
              {month}
            </TabPanel>
          ))}
        </Tabs>
      </div>,
      { locale: 'ar', ...still },
    );
    const scroller = screen.container.querySelector<HTMLElement>('[data-slot="tab-scroller"]')!;
    await expect.element(scroller).toHaveAttribute('data-overflow-end', 'true');
    screen.getByRole('tab', { name: months[0] }).element().focus();
    await userEvent.keyboard('{End}');
    await expect.element(scroller).toHaveAttribute('data-overflow-start', 'true');
    expect(scroller.scrollLeft).toBeLessThan(0);
  });

  it('renders link tabs with their href', async () => {
    const screen = await renderWithDS(
      <Tabs variant="pill">
        <TabList aria-label="Reports">
          <Tab id="daily" href="#daily">
            Daily
          </Tab>
          <Tab id="weekly" href="#weekly">
            Weekly
          </Tab>
        </TabList>
        <TabPanel id="daily">Daily</TabPanel>
        <TabPanel id="weekly">Weekly</TabPanel>
      </Tabs>,
    );
    const daily = screen.getByRole('tab', { name: 'Daily' });
    await expect.element(daily).toHaveAttribute('href', '#daily');
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
    const end = await vi.waitUntil(() =>
      screen.container.querySelector<HTMLElement>('[data-edge="end"]'),
    );
    const view = scroller.getBoundingClientRect();
    expect(end.getBoundingClientRect().left).toBeLessThan(view.left + view.width / 2);
    await userEvent.click(end);
    await expect.poll(() => scroller.scrollLeft).toBeLessThan(-100);
    const start = await vi.waitUntil(() =>
      screen.container.querySelector<HTMLElement>('[data-edge="start"]'),
    );
    expect(start.getBoundingClientRect().right).toBeGreaterThan(view.left + view.width / 2);
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

  it('shows no scroll buttons when every tab fits', async () => {
    const screen = await renderWithDS(<FolderTabs />, still);
    await expect.element(screen.getByRole('tab', { name: 'Notes' })).toBeVisible();
    expect(screen.container.querySelector('[data-slot="tab-scroll-button"]')).toBeNull();
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
