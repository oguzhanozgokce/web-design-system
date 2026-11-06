'use client';

import { useState } from 'react';
import { useLocale } from 'react-aria-components';
import { Checkbox } from '@/registry/ds/ui/checkbox';

const invoices = [
  { id: 'INV-2041', customer: 'Northwind Traders', amount: 1240 },
  { id: 'INV-2042', customer: 'Lumen Studio', amount: 380.5 },
  { id: 'INV-2043', customer: 'Atlas Freight', amount: 9015.75 },
];

export default function CheckboxIndeterminate() {
  const { locale } = useLocale();
  const [selected, setSelected] = useState<string[]>(['INV-2042']);
  const currency = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' });
  const allSelected = selected.length === invoices.length;

  return (
    <table className="w-full max-w-lg text-start text-body-md">
      <thead className="text-label-lg text-on-surface-variant">
        <tr className="border-b border-outline-variant">
          <th className="w-12 py-3 ps-3 text-start">
            <Checkbox
              aria-label="Select all invoices"
              isSelected={allSelected}
              isIndeterminate={selected.length > 0 && !allSelected}
              onChange={(isSelected) =>
                setSelected(isSelected ? invoices.map((invoice) => invoice.id) : [])
              }
            />
          </th>
          <th className="py-3 pe-3 text-start font-medium">Invoice</th>
          <th className="py-3 pe-3 text-start font-medium">Customer</th>
          <th className="py-3 pe-3 text-end font-medium">Amount</th>
        </tr>
      </thead>
      <tbody>
        {invoices.map((invoice) => (
          <tr key={invoice.id} className="border-b border-outline-variant last:border-0">
            <td className="py-3 ps-3">
              <Checkbox
                aria-label={`Select ${invoice.id}`}
                isSelected={selected.includes(invoice.id)}
                onChange={(isSelected) =>
                  setSelected((current) =>
                    isSelected
                      ? [...current, invoice.id]
                      : current.filter((id) => id !== invoice.id),
                  )
                }
              />
            </td>
            <td className="py-3 pe-3 whitespace-nowrap tabular-digits">{invoice.id}</td>
            <td className="py-3 pe-3">{invoice.customer}</td>
            <td className="py-3 pe-3 text-end whitespace-nowrap tabular-digits">
              {currency.format(invoice.amount)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
