'use client';

import { useState } from 'react';
import { Pagination } from '@/registry/ds/ui/pagination';

export default function PaginationDemo() {
  const [page, setPage] = useState(4);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-3">
      <Pagination page={page} onPageChange={setPage} pageCount={12} />
      <p className="text-xs text-on-surface-variant tabular-digits">Page {page} of 12</p>
    </div>
  );
}
