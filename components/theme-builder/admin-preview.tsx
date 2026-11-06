'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { useLocale } from 'react-aria-components';
import { AddIcon, ArrowForwardIcon, TrendingDownIcon } from '@/registry/ds/lib/icons';
import { cn } from '@/registry/ds/lib/utils';
import { Banner } from '@/registry/ds/ui/banner';
import { Button } from '@/registry/ds/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/registry/ds/ui/card';
import { Checkbox } from '@/registry/ds/ui/checkbox';
import { FilterChip } from '@/registry/ds/ui/chip';
import { LinearProgress } from '@/registry/ds/ui/progress';
import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';
import { Switch } from '@/registry/ds/ui/switch';
import { Tab, TabList, TabPanel, Tabs } from '@/registry/ds/ui/tabs';
import { TextField } from '@/registry/ds/ui/text-field';

type InvoiceStatus = 'overdue' | 'due' | 'paid' | 'draft';

interface Invoice {
  id: string;
  customer: string;
  amount: number;
  due: Date;
  status: InvoiceStatus;
}

const invoices: Invoice[] = [
  {
    id: 'INV-2051',
    customer: 'Harbor Logistics',
    amount: 4820,
    due: new Date(2026, 9, 28),
    status: 'overdue',
  },
  {
    id: 'INV-2053',
    customer: 'Kestrel Foods',
    amount: 1260,
    due: new Date(2026, 10, 1),
    status: 'overdue',
  },
  {
    id: 'INV-2055',
    customer: 'Pine & Co.',
    amount: 980,
    due: new Date(2026, 10, 3),
    status: 'overdue',
  },
  {
    id: 'INV-2058',
    customer: 'Atlas Studio',
    amount: 3150,
    due: new Date(2026, 10, 12),
    status: 'due',
  },
  {
    id: 'INV-2060',
    customer: 'Lumen Clinics',
    amount: 7400,
    due: new Date(2026, 10, 2),
    status: 'paid',
  },
  {
    id: 'INV-2061',
    customer: 'Brightwater Hotels',
    amount: 2275,
    due: new Date(2026, 10, 20),
    status: 'draft',
  },
];

const customers = [
  { name: 'Harbor Logistics', contact: 'Deniz Aksoy', open: 4820 },
  { name: 'Atlas Studio', contact: 'Mira Jansen', open: 3150 },
  { name: 'Kestrel Foods', contact: 'Tomás Rivera', open: 1260 },
];

const statusOrder: InvoiceStatus[] = ['overdue', 'due', 'paid', 'draft'];

const statusLabels: Record<InvoiceStatus, string> = {
  overdue: 'Overdue',
  due: 'Due',
  paid: 'Paid',
  draft: 'Draft',
};

const statusTones: Record<InvoiceStatus, string> = {
  overdue: 'bg-error-container text-on-error-container',
  due: 'bg-secondary-container text-on-secondary-container',
  paid: 'bg-success-container text-on-success-container',
  draft: 'bg-surface-container-highest text-on-surface-variant',
};

function useFormatters() {
  const { locale } = useLocale();
  return useMemo(
    () => ({
      money: new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }),
      day: new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }),
      days: new Intl.NumberFormat(locale, { style: 'unit', unit: 'day', unitDisplay: 'long' }),
    }),
    [locale],
  );
}

function StatusPill({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={cn(
        'inline-flex min-w-16 shrink-0 justify-center rounded-full px-2 py-0.5 text-label-md',
        statusTones[status],
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

function InvoiceList({ items }: { items: Invoice[] }) {
  const format = useFormatters();

  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-body-md text-on-surface-variant">
        No invoices match these filters.
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-outline-variant">
      {items.map((invoice) => (
        <li key={invoice.id} className="flex items-center gap-3 py-2.5">
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-body-md text-on-surface">{invoice.customer}</span>
            <span className="truncate text-body-sm text-on-surface-variant">
              {invoice.id} · due {format.day.format(invoice.due)}
            </span>
          </span>
          <span className="text-body-md text-on-surface tabular-digits">
            {format.money.format(invoice.amount)}
          </span>
          <StatusPill status={invoice.status} />
        </li>
      ))}
    </ul>
  );
}

function Metric({ label, value, children }: { label: string; value: string; children: ReactNode }) {
  return (
    <Card variant="filled" className="gap-2">
      <p className="text-label-lg text-on-surface-variant">{label}</p>
      <p className="text-headline-sm text-on-surface tabular-digits">{value}</p>
      {children}
    </Card>
  );
}

function OverviewPanel() {
  const format = useFormatters();
  const [overdueOnly, setOverdueOnly] = useState(false);
  const recent = overdueOnly
    ? invoices.filter((invoice) => invoice.status === 'overdue')
    : invoices.slice(0, 4);

  return (
    <TabPanel id="overview" className="flex flex-col gap-4 p-4 @2xl:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col">
          <h3 className="text-title-lg text-on-surface">November overview</h3>
          <p className="text-body-sm text-on-surface-variant">Updated 4 minutes ago</p>
        </div>
        <SegmentedControl aria-label="Report period" size="sm" defaultSelectedKeys={['month']}>
          <SegmentedControlItem id="week">Week</SegmentedControlItem>
          <SegmentedControlItem id="month">Month</SegmentedControlItem>
          <SegmentedControlItem id="quarter">Quarter</SegmentedControlItem>
        </SegmentedControl>
      </div>

      <Banner
        tone="warning"
        title="3 invoices are overdue"
        description="Harbor Logistics, Kestrel Foods and Pine & Co. have not paid yet. Reminders go out tomorrow at 09:00."
        actions={<Button variant="text">Send reminders now</Button>}
      />

      <div className="grid gap-3 @xl:grid-cols-3">
        <Metric label="Collected" value={format.money.format(48210)}>
          <LinearProgress
            label={`Target ${format.money.format(67000)}`}
            value={72}
            showValueLabel
          />
        </Metric>
        <Metric label="Outstanding" value={format.money.format(12940)}>
          <p className="text-body-sm text-on-surface-variant">12 open invoices, 3 overdue</p>
        </Metric>
        <Metric label="Average days to pay" value={format.days.format(18)}>
          <p className="flex items-center gap-1 text-body-sm text-success [&_svg]:size-4">
            <TrendingDownIcon className="rtl:-scale-x-100" />3 days faster than October
          </p>
        </Metric>
      </div>

      <div className="grid items-start gap-4 @3xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card variant="outlined">
          <CardHeader
            action={
              <FilterChip size="sm" isSelected={overdueOnly} onChange={setOverdueOnly}>
                Overdue only
              </FilterChip>
            }
          >
            <CardTitle level={4}>Recent invoices</CardTitle>
            <CardDescription>Sorted by due date</CardDescription>
          </CardHeader>
          <CardContent>
            <InvoiceList items={recent} />
          </CardContent>
          <CardFooter>
            <Button
              variant="tonal"
              size="sm"
              endIcon={<ArrowForwardIcon className="rtl:-scale-x-100" />}
            >
              All invoices
            </Button>
          </CardFooter>
        </Card>

        <Card variant="filled">
          <CardHeader>
            <CardTitle level={4}>Payment reminders</CardTitle>
            <CardDescription>Applies to every new invoice.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Switch defaultSelected description="Three days before the due date, then weekly.">
              Email customers
            </Switch>
            <Checkbox defaultSelected>Attach the invoice PDF</Checkbox>
            <TextField
              label="Reply-to address"
              type="email"
              defaultValue="billing@northwind.example"
            />
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="text">Discard</Button>
            <Button>Save</Button>
          </CardFooter>
        </Card>
      </div>
    </TabPanel>
  );
}

function InvoicesPanel() {
  const [statuses, setStatuses] = useState<Set<InvoiceStatus>>(() => new Set(['overdue', 'due']));
  const visible = invoices.filter((invoice) => statuses.has(invoice.status));

  function toggle(status: InvoiceStatus, isSelected: boolean) {
    setStatuses((current) => {
      const next = new Set(current);
      if (isSelected) next.add(status);
      else next.delete(status);
      return next;
    });
  }

  return (
    <TabPanel id="invoices" className="flex flex-col gap-4 p-4 @2xl:p-6">
      <div role="group" aria-label="Status" className="flex flex-wrap gap-2">
        {statusOrder.map((status) => (
          <FilterChip
            key={status}
            size="sm"
            isSelected={statuses.has(status)}
            onChange={(isSelected) => toggle(status, isSelected)}
          >
            {statusLabels[status]}
          </FilterChip>
        ))}
      </div>
      <InvoiceList items={visible} />
    </TabPanel>
  );
}

function CustomersPanel() {
  const format = useFormatters();

  return (
    <TabPanel id="customers" className="flex flex-col gap-4 p-4 @2xl:p-6">
      <ul className="flex flex-col divide-y divide-outline-variant">
        {customers.map((customer) => (
          <li key={customer.name} className="flex items-center gap-3 py-2.5">
            <span
              aria-hidden
              className="grid size-9 shrink-0 place-items-center rounded-full bg-tertiary-container text-label-lg text-on-tertiary-container"
            >
              {customer.name.slice(0, 1)}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-body-md text-on-surface">{customer.name}</span>
              <span className="truncate text-body-sm text-on-surface-variant">
                {customer.contact}
              </span>
            </span>
            <span className="text-body-md text-on-surface tabular-digits">
              {format.money.format(customer.open)}
            </span>
          </li>
        ))}
      </ul>
      <Button variant="outlined" startIcon={<AddIcon />} className="self-start">
        Invite a customer
      </Button>
    </TabPanel>
  );
}

export function AdminPreview() {
  return (
    <div data-slot="admin-preview" className="@container flex flex-col">
      <div className="flex items-center gap-3 border-b border-outline-variant bg-surface-container px-4 py-3">
        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-title-md text-on-primary"
        >
          N
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-title-sm text-on-surface">Northwind Billing</span>
          <span className="truncate text-body-sm text-on-surface-variant">
            Acme Freight workspace
          </span>
        </span>
        <Button size="sm" startIcon={<AddIcon />}>
          New invoice
        </Button>
      </div>
      <Tabs defaultSelectedKey="overview" className="gap-0">
        <TabList aria-label="Billing">
          <Tab id="overview">Overview</Tab>
          <Tab id="invoices" badge={3}>
            Invoices
          </Tab>
          <Tab id="customers">Customers</Tab>
        </TabList>
        <OverviewPanel />
        <InvoicesPanel />
        <CustomersPanel />
      </Tabs>
    </div>
  );
}
