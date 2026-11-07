'use client';

import { useMemo } from 'react';
import { useLocale } from 'react-aria-components';
import { Cell, Column, Row, Table, TableBody, TableHeader } from '@/registry/ds/ui/table';

const months = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];

const pages = [
  { id: 'home', page: 'Home', visits: [8120, 8436, 9012, 9540, 10210, 10875] },
  { id: 'pricing', page: 'Pricing', visits: [2210, 2380, 2295, 2541, 2702, 2930] },
  { id: 'docs', page: 'Documentation', visits: [5402, 5820, 6115, 6490, 6732, 7108] },
  { id: 'blog', page: 'Blog', visits: [3012, 2875, 3320, 3104, 3488, 3615] },
  { id: 'changelog', page: 'Changelog', visits: [940, 1012, 1180, 1096, 1260, 1342] },
  { id: 'status', page: 'Status', visits: [410, 395, 452, 610, 388, 402] },
  { id: 'careers', page: 'Careers', visits: [720, 698, 754, 812, 790, 836] },
  { id: 'contact', page: 'Contact', visits: [530, 556, 541, 602, 588, 615] },
];

export default function TableSticky() {
  const { locale } = useLocale();
  const number = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const month = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric', timeZone: 'UTC' }),
    [locale],
  );

  return (
    <div className="w-full max-w-md rounded-container border border-outline-subtle bg-surface-raised p-2">
      <Table
        aria-label="Visits per page"
        selectionMode="multiple"
        stickyHeader
        stickyRowHeader
        containerClassName="max-h-80"
      >
        <TableHeader>
          <Column isRowHeader>Page</Column>
          {months.map((value) => (
            <Column key={value} id={value} align="end">
              {month.format(new Date(`${value}-01`))}
            </Column>
          ))}
        </TableHeader>
        <TableBody items={pages}>
          {(item) => (
            <Row id={item.id}>
              <Cell className="font-medium whitespace-nowrap">{item.page}</Cell>
              {item.visits.map((visits, index) => (
                <Cell key={months[index]} align="end" className="tabular-digits">
                  {number.format(visits)}
                </Cell>
              ))}
            </Row>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
