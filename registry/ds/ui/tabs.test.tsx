import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { I18nProvider, type Key } from 'react-aria-components';
import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { InboxIcon, MailIcon } from '@/registry/ds/lib/icons';
import { Tab, TabList, TabPanel, Tabs, type TabsProps } from '@/registry/ds/ui/tabs';

const still = { provider: { motion: 'reduced' as const } };

const ledgers = ['Overview', 'Invoices', 'Payments', 'Notes'];

function LedgerTabs(props: Omit<TabsProps, 'children'>) {
  return (
    <Tabs {...props}>
      <TabList aria-label="Ledger">
        {ledgers.map((name) => (
          <Tab key={name} id={name.toLowerCase()}>
            {name}
          </Tab>
        ))}
      </TabList>
      {ledgers.map((name) => (
        <TabPanel key={name} id={name.toLowerCase()}>
          {name} panel
        </TabPanel>
      ))}
    </Tabs>
  );
}

function indicatorOwner(container: HTMLElement) {
  const indicators = container.querySelectorAll('[data-slot="indicator"]');
  expect(indicators).toHaveLength(1);
  return indicators[0].closest('[role="tab"]');
}

describe('Tabs', () => {
  it('renders a labelled tab list with one selected tab, its panel and one indicator', async () => {
    const screen = await renderWithDS(<LedgerTabs />);
    await expect.element(screen.getByRole('tablist', { name: 'Ledger' })).toBeVisible();
    const overview = screen.getByRole('tab', { name: 'Overview' });
    await expect.element(overview).toHaveAttribute('aria-selected', 'true');
    await expect.element(screen.getByRole('tabpanel')).toHaveTextContent('Overview panel');
    await expect.element(screen.getByRole('tabpanel')).toHaveAccessibleName('Overview');
    expect(indicatorOwner(screen.container)).toBe(overview.element());
    expect(screen.container.querySelector('[data-slot="tabs"]')).toHaveAttribute(
      'data-variant',
      'primary',
    );
  });

  it('selects on press, reports the key and moves the indicator', async () => {
    const onSelectionChange = vi.fn();
    const screen = await renderWithDS(<LedgerTabs onSelectionChange={onSelectionChange} />);
    const payments = screen.getByRole('tab', { name: 'Payments' });
    await payments.click();
    await expect.element(payments).toHaveAttribute('aria-selected', 'true');
    expect(onSelectionChange).toHaveBeenLastCalledWith('payments');
    await expect.element(screen.getByRole('tabpanel')).toHaveTextContent('Payments panel');
    expect(indicatorOwner(screen.container)).toBe(payments.element());
  });

  it('animates the indicator from the previous tab with the spatial spring', async () => {
    const screen = await renderWithDS(<LedgerTabs />);
    await screen.getByRole('tab', { name: 'Notes' }).click();
    const indicator = screen.container.querySelector<HTMLElement>('[data-slot="indicator"]')!;
    expect(getComputedStyle(indicator).transitionProperty).toBe('width, height, translate');
    expect(getComputedStyle(indicator).transitionTimingFunction).toMatch(/^linear\(/);
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
                {(['primary', 'secondary', 'pill'] as const).map((variant) => (
                  <LedgerTabs
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
    expect(instances).toHaveLength(6);
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

  it('jumps without a transition when motion is reduced', async () => {
    const screen = await renderWithDS(<LedgerTabs />, still);
    await screen.getByRole('tab', { name: 'Notes' }).click();
    const indicator = screen.container.querySelector<HTMLElement>('[data-slot="indicator"]')!;
    expect(getComputedStyle(indicator).transitionProperty).toBe('none');
    expect(indicator.getAnimations()).toHaveLength(0);
  });

  it('moves with arrow keys, Home and End', async () => {
    const screen = await renderWithDS(<LedgerTabs />);
    screen.getByRole('tab', { name: 'Overview' }).element().focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect
      .element(screen.getByRole('tab', { name: 'Invoices' }))
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
    const screen = await renderWithDS(<LedgerTabs />, { locale: 'ar' });
    screen.getByRole('tab', { name: 'Overview' }).element().focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect
      .element(screen.getByRole('tab', { name: 'Invoices' }))
      .toHaveAttribute('aria-selected', 'true');
  });

  it('places the indicator under the selected tab in RTL layouts', async () => {
    const screen = await renderWithDS(<LedgerTabs variant="secondary" />, {
      locale: 'ar',
      ...still,
    });
    const invoices = screen.getByRole('tab', { name: 'Invoices' });
    await invoices.click();
    const indicator = screen.container.querySelector<HTMLElement>('[data-slot="indicator"]')!;
    const tabRect = invoices.element().getBoundingClientRect();
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
          <LedgerTabs selectedKey={selected} onSelectionChange={setSelected} />
          <button type="button" onClick={() => setSelected('invoices')}>
            Show invoices
          </button>
        </>
      );
    }
    const screen = await renderWithDS(<Controlled />);
    await expect
      .element(screen.getByRole('tab', { name: 'Notes' }))
      .toHaveAttribute('aria-selected', 'true');
    await screen.getByRole('button', { name: 'Show invoices' }).click();
    await expect
      .element(screen.getByRole('tab', { name: 'Invoices' }))
      .toHaveAttribute('aria-selected', 'true');
    await expect.element(screen.getByRole('tabpanel')).toHaveTextContent('Invoices panel');
  });

  it('skips disabled tabs', async () => {
    const onSelectionChange = vi.fn();
    const screen = await renderWithDS(
      <LedgerTabs disabledKeys={['invoices']} onSelectionChange={onSelectionChange} />,
    );
    const invoices = screen.getByRole('tab', { name: 'Invoices' });
    await expect.element(invoices).toHaveAttribute('aria-disabled', 'true');
    await invoices.click({ force: true });
    await expect.element(invoices).toHaveAttribute('aria-selected', 'false');

    screen.getByRole('tab', { name: 'Overview' }).element().focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect
      .element(screen.getByRole('tab', { name: 'Payments' }))
      .toHaveAttribute('aria-selected', 'true');
    expect(onSelectionChange).not.toHaveBeenCalledWith('invoices');
  });

  it('stacks icons on primary tabs and keeps them inline elsewhere', async () => {
    const screen = await renderWithDS(
      <>
        <Tabs>
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
        <Tabs variant="secondary">
          <TabList aria-label="Folders">
            <Tab id="inbox" icon={<InboxIcon />}>
              Inbox
            </Tab>
          </TabList>
          <TabPanel id="inbox">Inbox</TabPanel>
        </Tabs>
      </>,
    );
    const primary = screen.getByRole('tablist', { name: 'Mail' }).getByRole('tab').first();
    const secondary = screen.getByRole('tablist', { name: 'Folders' }).getByRole('tab').first();
    await expect.element(primary).toHaveAttribute('data-stacked', 'true');
    await expect.element(secondary).not.toHaveAttribute('data-stacked');
    expect(primary.element().getBoundingClientRect().height).toBe(64);
    expect(secondary.element().getBoundingClientRect().height).toBe(48);
  });

  it('formats count badges for the locale and gives them a localised label', async () => {
    const screen = await renderWithDS(
      <Tabs variant="secondary">
        <TabList aria-label="Siparişler">
          <Tab id="unpaid" badge={12}>
            Ödenmemiş
          </Tab>
          <Tab id="pending" badge={1280}>
            Bekleyen
          </Tab>
          <Tab id="disputes" badge>
            İtirazlar
          </Tab>
          <Tab id="refunds" badge={0}>
            İadeler
          </Tab>
        </TabList>
        <TabPanel id="unpaid">Ödenmemiş</TabPanel>
        <TabPanel id="pending">Bekleyen</TabPanel>
        <TabPanel id="disputes">İtirazlar</TabPanel>
        <TabPanel id="refunds">İadeler</TabPanel>
      </Tabs>,
      { locale: 'tr' },
    );
    await expect.element(screen.getByRole('tab', { name: 'Ödenmemiş 12 yeni' })).toBeVisible();
    await expect.element(screen.getByRole('tab', { name: 'Bekleyen 99+ yeni' })).toBeVisible();
    await expect.element(screen.getByRole('tab', { name: 'İtirazlar Yeni' })).toBeVisible();
    const refunds = screen.getByRole('tab', { name: 'İadeler', exact: true });
    await expect.element(refunds).toBeVisible();
    expect(refunds.element().querySelector('[data-slot="badge"]')).toBeNull();
  });

  it('formats badge digits for Arabic', async () => {
    const screen = await renderWithDS(
      <Tabs variant="secondary">
        <TabList aria-label="الطلبات">
          <Tab id="unpaid" badge={12}>
            غير مدفوعة
          </Tab>
        </TabList>
        <TabPanel id="unpaid">غير مدفوعة</TabPanel>
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
        <Tabs>
          <TabList aria-label="Mail">
            <Tab id="inbox" icon={<InboxIcon />} badge={4}>
              Inbox
            </Tab>
          </TabList>
          <TabPanel id="inbox">Inbox</TabPanel>
        </Tabs>
        <Tabs variant="secondary">
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

  it('keeps primary tabs at 48px with iconPlacement="start"', async () => {
    const screen = await renderWithDS(
      <Tabs iconPlacement="start">
        <TabList aria-label="Mail">
          <Tab id="inbox" icon={<InboxIcon />}>
            Inbox
          </Tab>
        </TabList>
        <TabPanel id="inbox">Inbox</TabPanel>
      </Tabs>,
    );
    expect(screen.container.querySelector('[data-slot="tabs"]')).toHaveAttribute(
      'data-icon-placement',
      'start',
    );
    const inbox = screen.getByRole('tab', { name: 'Inbox' });
    await expect.element(inbox).not.toHaveAttribute('data-stacked');
    expect(inbox.element().getBoundingClientRect().height).toBe(48);
  });

  it('waits for Enter with manual keyboard activation', async () => {
    const screen = await renderWithDS(<LedgerTabs keyboardActivation="manual" />);
    screen.getByRole('tab', { name: 'Overview' }).element().focus();
    await userEvent.keyboard('{ArrowRight}');
    const invoices = screen.getByRole('tab', { name: 'Invoices' });
    await expect.element(invoices).toHaveFocus();
    await expect.element(invoices).toHaveAttribute('aria-selected', 'false');
    await userEvent.keyboard('{Enter}');
    await expect.element(invoices).toHaveAttribute('aria-selected', 'true');
  });

  it('paints the indicator of disabled tabs in the disabled colour', async () => {
    const screen = await renderWithDS(
      <>
        <LedgerTabs isDisabled />
        <LedgerTabs variant="pill" isDisabled />
        <span data-testid="text-disabled" className="bg-on-surface/38" />
        <span data-testid="container-disabled" className="bg-on-surface/12" />
      </>,
    );
    const [primary, pill] = [
      ...screen.container.querySelectorAll<HTMLElement>('[data-slot="indicator"]'),
    ];
    const background = (element: Element) => getComputedStyle(element).backgroundColor;
    expect(background(primary)).toBe(background(screen.getByTestId('text-disabled').element()));
    expect(background(pill)).toBe(background(screen.getByTestId('container-disabled').element()));
  });

  it('works vertically with up and down arrows and an end-edge indicator', async () => {
    const screen = await renderWithDS(<LedgerTabs orientation="vertical" />, still);
    const list = screen.getByRole('tablist', { name: 'Ledger' });
    await expect.element(list).toHaveAttribute('aria-orientation', 'vertical');
    screen.getByRole('tab', { name: 'Overview' }).element().focus();
    await userEvent.keyboard('{ArrowDown}');
    const invoices = screen.getByRole('tab', { name: 'Invoices' });
    await expect.element(invoices).toHaveAttribute('aria-selected', 'true');
    const indicator = screen.container.querySelector<HTMLElement>('[data-slot="indicator"]')!;
    expect(indicator.getBoundingClientRect().right).toBeCloseTo(
      invoices.element().getBoundingClientRect().right,
      0,
    );
  });

  it('scrolls overflowing tabs, fades the hidden edge and reveals the selected tab', async () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August'];
    const screen = await renderWithDS(
      <div style={{ width: 280 }}>
        <Tabs variant="secondary">
          <TabList aria-label="Month">
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
      still,
    );
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
        <Tabs variant="secondary">
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

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-6 p-4">
          {(['primary', 'secondary', 'pill'] as const).map((variant) => (
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
              <TabPanel id="inbox">Three unread messages from Northwind Traders.</TabPanel>
              <TabPanel id="sent">Sent</TabPanel>
              <TabPanel id="archive">Archive</TabPanel>
            </Tabs>
          ))}
          <LedgerTabs orientation="vertical" variant="secondary" />
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      screen.unmount();
    }
  });
});
