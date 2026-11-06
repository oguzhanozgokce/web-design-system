import { AddIcon, DescriptionIcon, UploadIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { EmptyState } from '@/registry/ds/ui/empty-state';

export default function EmptyStateDemo() {
  return (
    <EmptyState
      icon={<DescriptionIcon />}
      title="No invoices yet"
      description="Create your first invoice, or import past invoices from a CSV export of your old tool."
      primaryAction={<Button startIcon={<AddIcon />}>New invoice</Button>}
      secondaryAction={<Button startIcon={<UploadIcon />}>Import CSV</Button>}
    />
  );
}
