import { Pagination } from '@/registry/ds/ui/pagination';

export default function PaginationCompact() {
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="w-full max-w-xs rounded-container border border-outline-subtle bg-surface-raised p-3">
        <Pagination aria-label="Team, narrow card" size="sm" defaultPage={5} pageCount={24} />
      </div>
      <div className="w-full max-w-2xl rounded-container border border-outline-subtle bg-surface-raised p-3">
        <Pagination aria-label="Team, wide card" size="sm" defaultPage={5} pageCount={24} />
      </div>
    </div>
  );
}
