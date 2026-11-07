'use client';

import { useMemo, useState } from 'react';
import { useLocale, type SortDescriptor } from 'react-aria-components';
import { Cell, Column, Row, Table, TableBody, TableHeader } from '@/registry/ds/ui/table';

interface File {
  id: string;
  name: string;
  kind: string;
  size: number;
  modified: string;
}

const files: File[] = [
  { id: 'roadmap', name: 'Roadmap.pdf', kind: 'PDF', size: 2.4, modified: '2026-10-02' },
  { id: 'cover', name: 'Cover photo.jpg', kind: 'Image', size: 5.8, modified: '2026-09-18' },
  { id: 'intro', name: 'Intro.mp4', kind: 'Video', size: 128.6, modified: '2026-10-21' },
  { id: 'notes', name: 'Meeting notes.md', kind: 'Text', size: 0.1, modified: '2026-11-03' },
  { id: 'palette', name: 'Palette.sketch', kind: 'Design', size: 18.2, modified: '2026-08-29' },
];

export default function TableDemo() {
  const { locale } = useLocale();
  const [sort, setSort] = useState<SortDescriptor>({ column: 'modified', direction: 'descending' });
  const size = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'unit',
        unit: 'megabyte',
        maximumFractionDigits: 1,
      }),
    [locale],
  );
  const date = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }),
    [locale],
  );
  const rows = useMemo(() => {
    const key = sort.column as keyof File;
    const sorted = [...files].sort((a, b) =>
      typeof a[key] === 'number'
        ? (a[key] as number) - (b[key] as number)
        : String(a[key]).localeCompare(String(b[key]), locale),
    );
    return sort.direction === 'descending' ? sorted.reverse() : sorted;
  }, [sort, locale]);

  return (
    <div className="w-full max-w-2xl rounded-container border border-outline-subtle bg-surface-raised p-2">
      <Table aria-label="Files" sortDescriptor={sort} onSortChange={setSort}>
        <TableHeader>
          <Column id="name" isRowHeader allowsSorting>
            Name
          </Column>
          <Column id="kind">Type</Column>
          <Column id="size" allowsSorting align="end">
            Size
          </Column>
          <Column id="modified" allowsSorting>
            Modified
          </Column>
        </TableHeader>
        <TableBody items={rows}>
          {(file) => (
            <Row id={file.id}>
              <Cell className="font-medium">{file.name}</Cell>
              <Cell className="text-on-surface-variant">{file.kind}</Cell>
              <Cell align="end" className="whitespace-nowrap tabular-digits">
                {size.format(file.size)}
              </Cell>
              <Cell className="whitespace-nowrap text-on-surface-variant">
                {date.format(new Date(file.modified))}
              </Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
