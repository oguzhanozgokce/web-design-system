import { Cell, Column, Row, Table, TableBody, TableHeader } from '@/registry/ds/ui/table';
import { StatusTag } from '@/registry/ds/ui/status-tag';

const syncs = [
  { id: 'photos', folder: 'Photos', items: '2,481', status: 'completed' },
  { id: 'documents', folder: 'Documents', items: '312', status: 'processing' },
  { id: 'music', folder: 'Music', items: '1,045', status: 'paused' },
];

export default function TableDensity() {
  return (
    <div className="grid w-full max-w-3xl gap-4 md:grid-cols-2">
      {(['md', 'sm'] as const).map((density) => (
        <div
          key={density}
          className="rounded-container border border-outline-subtle bg-surface-raised p-2"
        >
          <Table aria-label={density === 'md' ? 'Sync, normal' : 'Sync, compact'} density={density}>
            <TableHeader>
              <Column isRowHeader>Folder</Column>
              <Column align="end">Items</Column>
              <Column>Status</Column>
            </TableHeader>
            <TableBody>
              {syncs.map((sync) => (
                <Row key={sync.id} id={sync.id}>
                  <Cell className="font-medium">{sync.folder}</Cell>
                  <Cell align="end" className="tabular-digits">
                    {sync.items}
                  </Cell>
                  <Cell>
                    <StatusTag status={sync.status} size={density} />
                  </Cell>
                </Row>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}
