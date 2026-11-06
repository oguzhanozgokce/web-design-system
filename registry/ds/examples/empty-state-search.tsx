import { AddIcon, SearchIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { EmptyState } from '@/registry/ds/ui/empty-state';

export default function EmptyStateSearch() {
  return (
    <EmptyState
      icon={<SearchIcon />}
      title="No customers match “acme gmbh”"
      description="Search looks at names, email addresses and VAT numbers."
      primaryAction={<Button startIcon={<AddIcon />}>Add “Acme GmbH”</Button>}
      secondaryAction={<Button>Clear search</Button>}
    >
      <p className="mt-1">Check the spelling, or search for part of the name.</p>
    </EmptyState>
  );
}
