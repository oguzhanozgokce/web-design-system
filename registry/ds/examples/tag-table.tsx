import { Tag, type TagTone } from '@/registry/ds/ui/tag';

const members: { name: string; email: string; role: string; status: string; tone: TagTone }[] = [
  {
    name: 'Amara Okafor',
    email: 'amara@example.com',
    role: 'Owner',
    status: 'Active',
    tone: 'success',
  },
  {
    name: 'Kenji Watanabe',
    email: 'kenji@example.com',
    role: 'Editor',
    status: 'Pending',
    tone: 'warning',
  },
  {
    name: 'Sofia Rossi',
    email: 'sofia@example.com',
    role: 'Editor',
    status: 'Blocked',
    tone: 'error',
  },
  {
    name: 'Mateo García',
    email: 'mateo@example.com',
    role: 'Viewer',
    status: 'Inactive',
    tone: 'neutral',
  },
];

export default function TagTable() {
  return (
    <div className="w-full max-w-xl overflow-x-auto rounded-container border border-outline-subtle bg-surface-raised">
      <table className="w-full text-start text-sm text-on-surface">
        <caption className="sr-only">Members</caption>
        <thead className="bg-neutral-soft text-sm font-medium text-on-surface-variant">
          <tr>
            <th scope="col" className="px-3 py-2 text-start font-medium sm:px-4">
              Member
            </th>
            <th scope="col" className="px-3 py-2 text-start font-medium sm:px-4">
              Role
            </th>
            <th scope="col" className="px-3 py-2 text-start font-medium sm:px-4">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.email} className="border-t border-outline-subtle">
              <td className="w-full max-w-0 px-3 py-2.5 sm:px-4">
                <div className="truncate text-sm font-medium">{member.name}</div>
                <div className="truncate text-xs text-on-surface-variant">{member.email}</div>
              </td>
              <td className="px-3 py-2.5 whitespace-nowrap text-on-surface-variant sm:px-4">
                {member.role}
              </td>
              <td className="px-3 py-2.5 sm:px-4">
                <Tag tone={member.tone} dot>
                  {member.status}
                </Tag>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
