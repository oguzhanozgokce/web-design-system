'use client';

import { useEffect, useState } from 'react';
import type { Key, SortDescriptor } from 'react-aria-components';
import type { DataTableFilterValues } from '@/registry/ds/lib/data-table';
import { DataTable, type DataTableColumn } from '@/registry/ds/ui/data-table';

interface Visit {
  id: string;
  page: string;
  source: string;
  visits: number;
}

const sources = ['Search', 'Direct', 'Social', 'Email'];

const allVisits: Visit[] = Array.from({ length: 57 }, (_, index) => ({
  id: `page-${index + 1}`,
  page: `/guides/${['start', 'install', 'theming', 'motion', 'forms', 'tables'][index % 6]}-${index + 1}`,
  source: sources[index % sources.length],
  visits: (((index + 5) * 7919) % 20000) + 120,
}));

interface Query {
  page: number;
  sort: SortDescriptor | null;
  search: string;
  filters: DataTableFilterValues;
}

function fetchVisits(query: Query, pageSize: number) {
  return new Promise<{ rows: Visit[]; total: number }>((resolve) => {
    setTimeout(() => {
      let rows = allVisits.filter((visit) =>
        visit.page.toLowerCase().includes(query.search.trim().toLowerCase()),
      );
      const source = query.filters.source;
      if (source != null) rows = rows.filter((visit) => visit.source === source);
      if (query.sort) {
        const key = query.sort.column as keyof Visit;
        rows = [...rows].sort((a, b) =>
          typeof a[key] === 'number'
            ? (a[key] as number) - (b[key] as number)
            : String(a[key]).localeCompare(String(b[key])),
        );
        if (query.sort.direction === 'descending') rows.reverse();
      }
      const start = (query.page - 1) * pageSize;
      resolve({ rows: rows.slice(start, start + pageSize), total: rows.length });
    }, 500);
  });
}

const columns: DataTableColumn<Visit>[] = [
  { id: 'page', header: 'Page', isRowHeader: true, allowsSorting: true },
  { id: 'source', header: 'Source', chip: true },
  { id: 'visits', header: 'Visits', type: 'number', allowsSorting: true },
];

const pageSize = 6;

export default function DataTableServer() {
  const [query, setQuery] = useState<Query>({
    page: 1,
    sort: { column: 'visits', direction: 'descending' },
    search: '',
    filters: {},
  });
  const [result, setResult] = useState<{ rows: Visit[]; total: number } | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<Key> | 'all'>(new Set());

  function update(patch: Partial<Query>) {
    setLoading(true);
    setQuery((current) => ({ ...current, ...patch }));
  }

  useEffect(() => {
    let isCurrent = true;
    fetchVisits(query, pageSize).then((next) => {
      if (!isCurrent) return;
      setResult(next);
      setLoading(false);
    });
    return () => {
      isCurrent = false;
    };
  }, [query]);

  return (
    <DataTable
      aria-label="Visits"
      processing="server"
      data={result?.rows ?? []}
      totalCount={result?.total ?? 0}
      columns={columns}
      getRowId={(visit) => visit.id}
      isLoading={isLoading}
      pageSize={pageSize}
      page={query.page}
      onPageChange={(page) => update({ page })}
      sortDescriptor={query.sort}
      onSortChange={(sort) => update({ sort, page: 1 })}
      searchValue={query.search}
      onSearchChange={(search) => update({ search, page: 1 })}
      filters={[
        {
          id: 'source',
          label: 'Source',
          allLabel: 'All sources',
          options: sources.map((source) => ({ id: source, label: source })),
        },
      ]}
      filterValues={query.filters}
      onFilterChange={(filters) => update({ filters, page: 1 })}
      selectionMode="multiple"
      selectedKeys={selected}
      onSelectionChange={setSelected}
      labels={{ resultCount: '{count} pages' }}
    />
  );
}
