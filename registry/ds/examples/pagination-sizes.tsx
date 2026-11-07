import { Pagination } from '@/registry/ds/ui/pagination';

export default function PaginationSizes() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <Pagination aria-label="Photos, small" size="sm" defaultPage={2} pageCount={8} />
      <Pagination aria-label="Photos, medium" defaultPage={2} pageCount={8} />
    </div>
  );
}
