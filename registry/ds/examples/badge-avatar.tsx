import { Badge, BadgeAnchor } from '@/registry/ds/ui/badge';

const people = [
  {
    name: 'Ayşe Demir',
    initials: 'AD',
    badge: <Badge count={2} label="{count} unread messages" />,
  },
  { name: 'Jonas Weber', initials: 'JW', badge: <Badge tone="success" label="Online" /> },
  { name: 'Priya Natarajan', initials: 'PN', badge: null },
];

export default function BadgeAvatar() {
  return (
    <ul className="flex flex-wrap items-start justify-center gap-8">
      {people.map(({ name, initials, badge }) => (
        <li key={name} className="flex w-24 flex-col-reverse items-center gap-2 text-center">
          <span className="text-xs text-on-surface">{name}</span>
          <BadgeAnchor overlap="circular" badge={badge}>
            <span
              aria-hidden="true"
              className="grid size-12 place-items-center rounded-full bg-neutral-soft text-base font-medium text-on-surface"
            >
              {initials}
            </span>
          </BadgeAnchor>
        </li>
      ))}
    </ul>
  );
}
