import { Pagination } from '@/registry/ds/ui/pagination';

export default function PaginationDisabled() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <Pagination aria-label="Visits, one page" size="sm" pageCount={1} />
      <Pagination aria-label="Visits, loading" size="sm" defaultPage={3} pageCount={6} isDisabled />
    </div>
  );
}
