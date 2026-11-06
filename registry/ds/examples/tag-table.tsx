'use client';

import { useLocale } from 'react-aria-components';
import { Tag, type TagTone } from '@/registry/ds/ui/tag';

const invoices: { id: string; customer: string; amount: number; status: string; tone: TagTone }[] =
  [
    { id: 'INV-2041', customer: 'Acme Logistics', amount: 1240, status: 'Paid', tone: 'success' },
    {
      id: 'INV-2042',
      customer: 'Northwind Foods',
      amount: 980.5,
      status: 'Overdue',
      tone: 'error',
    },
    { id: 'INV-2043', customer: 'Globex Studio', amount: 3400, status: 'Pending', tone: 'warning' },
    { id: 'INV-2044', customer: 'Initech', amount: 610, status: 'Draft', tone: 'neutral' },
  ];

export default function TagTable() {
  const { locale } = useLocale();
  const currency = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' });

  return (
    <div className="w-full max-w-xl overflow-x-auto rounded-md border border-outline-variant">
      <table className="w-full text-start text-body-md text-on-surface">
        <caption className="sr-only">Recent invoices</caption>
        <thead className="bg-surface-container-low text-label-lg text-on-surface-variant">
          <tr>
            <th scope="col" className="px-4 py-2 text-start font-medium">
              Invoice
            </th>
            <th scope="col" className="px-4 py-2 text-end font-medium">
              Amount
            </th>
            <th scope="col" className="px-4 py-2 text-start font-medium">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="border-t border-outline-variant">
              <td className="px-4 py-2.5">
                <div className="text-label-lg whitespace-nowrap">{invoice.id}</div>
                <div className="text-body-sm text-on-surface-variant">{invoice.customer}</div>
              </td>
              <td className="px-4 py-2.5 text-end whitespace-nowrap tabular-digits">
                {currency.format(invoice.amount)}
              </td>
              <td className="px-4 py-2.5">
                <Tag tone={invoice.tone} dot>
                  {invoice.status}
                </Tag>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
