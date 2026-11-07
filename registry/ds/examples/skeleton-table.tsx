import { Skeleton } from '@/registry/ds/ui/skeleton';

const columns = [
  { name: 'Name', className: 'text-start' },
  { name: 'Owner', className: 'text-start' },
  { name: 'Type', className: 'hidden text-start sm:table-cell' },
  { name: 'Size', className: 'text-end' },
];

export default function SkeletonTable() {
  return (
    <div className="w-full max-w-xl overflow-x-auto rounded-container border border-outline-subtle bg-surface-raised">
      <table aria-label="Files" aria-busy="true" className="w-full text-sm">
        <thead className="text-xs font-medium text-on-surface-variant">
          <tr>
            {columns.map((column) => (
              <th
                key={column.name}
                scope="col"
                className={`px-4 py-3 font-medium ${column.className}`}
              >
                {column.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[0, 1, 2, 3].map((row) => (
            <tr key={row} className="border-t border-outline-subtle">
              <td className="px-4 py-3">
                <Skeleton shape="text" className={row % 2 ? 'max-w-24' : 'max-w-32'} />
              </td>
              <td className="px-4 py-3">
                <Skeleton shape="text" className="w-16" />
              </td>
              <td className="hidden px-4 py-3 sm:table-cell">
                <Skeleton className="h-6 w-20 rounded-control" />
              </td>
              <td className="px-4 py-3">
                <Skeleton shape="text" className="ms-auto w-14" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
