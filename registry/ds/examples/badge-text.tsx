import { Badge } from '@/registry/ds/ui/badge';

const features = [
  { name: 'Shared folders', badge: <Badge tone="primary">New</Badge> },
  {
    name: 'Offline mode',
    badge: (
      <Badge variant="soft" tone="neutral">
        Beta
      </Badge>
    ),
  },
  { name: 'Keyboard shortcuts', badge: null },
];

export default function BadgeText() {
  return (
    <ul className="w-full max-w-sm divide-y divide-outline-subtle rounded-container border border-outline-subtle bg-surface-raised text-sm text-on-surface">
      {features.map(({ name, badge }) => (
        <li key={name} className="flex items-center gap-2 px-4 py-3">
          {name}
          {badge}
        </li>
      ))}
    </ul>
  );
}
