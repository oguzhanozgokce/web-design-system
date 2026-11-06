import { SearchIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { EmptyState } from '@/registry/ds/ui/empty-state';

export default function EmptyStateSearch() {
  return (
    <EmptyState
      icon={<SearchIcon />}
      title="No results for “beach photos”"
      description="Search looks at file names, tags and descriptions."
      primaryAction={<Button>Clear search</Button>}
    >
      <p className="mt-1">Check the spelling, or try a shorter search.</p>
    </EmptyState>
  );
}
