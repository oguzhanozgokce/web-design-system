import { Pagination } from '@/registry/ds/ui/pagination';

export default function PaginationSiblings() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      {[0, 1, 2].map((siblingCount) => (
        <div key={siblingCount} className="flex flex-col gap-2">
          <span className="text-xs text-on-surface-variant">siblingCount={siblingCount}</span>
          <Pagination
            aria-label={`Projects, ${siblingCount} siblings`}
            size="sm"
            siblingCount={siblingCount}
            defaultPage={10}
            pageCount={20}
          />
        </div>
      ))}
    </div>
  );
}
