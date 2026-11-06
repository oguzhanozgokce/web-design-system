import { Avatar, type AvatarStatus } from '@/registry/ds/ui/avatar';

const members: { name: string; email: string; role: string; status: AvatarStatus }[] = [
  { name: 'Amara Okafor', email: 'amara@example.com', role: 'Owner', status: 'online' },
  { name: 'Kenji Watanabe', email: 'kenji@example.com', role: 'Editor', status: 'busy' },
  { name: 'Sofia Rossi', email: 'sofia@example.com', role: 'Viewer', status: 'offline' },
];

export default function AvatarDecorative() {
  return (
    <ul className="w-full max-w-sm divide-y divide-outline-variant rounded-lg bg-surface-container-low text-on-surface [--ds-avatar-ring:var(--surface-container-low)]">
      {members.map((member) => (
        <li key={member.email} className="flex items-center gap-3 px-4 py-3">
          <Avatar name={member.name} alt="" status={member.status} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-title-sm">{member.name}</p>
            <p className="truncate text-body-sm text-on-surface-variant">{member.email}</p>
          </div>
          <span className="text-label-md text-on-surface-variant">{member.role}</span>
        </li>
      ))}
    </ul>
  );
}
