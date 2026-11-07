import { SearchIcon } from '@/registry/ds/lib/icons';
import { EmptyState } from '@/registry/ds/ui/empty-state';
import { Column, Table, TableBody, TableHeader } from '@/registry/ds/ui/table';

export default function TableEmpty() {
  return (
    <div className="w-full max-w-2xl rounded-container border border-outline-subtle bg-surface-raised p-2">
      <Table aria-label="Shared projects">
        <TableHeader>
          <Column isRowHeader>Project</Column>
          <Column>Owner</Column>
          <Column>Updated</Column>
        </TableHeader>
        <TableBody
          renderEmptyState={() => (
            <EmptyState
              size="sm"
              headingLevel={3}
              icon={<SearchIcon />}
              title="No shared projects"
              description="Projects people share with you show up here."
            />
          )}
        >
          {[]}
        </TableBody>
      </Table>
    </div>
  );
}
