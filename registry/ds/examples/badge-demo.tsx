'use client';

import { Link } from 'react-aria-components';
import { ChatIcon, DescriptionIcon, InboxIcon, NotificationsIcon } from '@/registry/ds/lib/icons';
import { Badge } from '@/registry/ds/ui/badge';

const destinations = [
  { href: '#inbox', label: 'Inbox', icon: InboxIcon, badge: <Badge count={12} /> },
  {
    href: '#invoices',
    label: 'Invoices',
    icon: DescriptionIcon,
    badge: <Badge count={4} tone="warning" label="{count} overdue" />,
  },
  { href: '#messages', label: 'Messages', icon: ChatIcon, badge: <Badge /> },
  {
    href: '#activity',
    label: 'Activity',
    icon: NotificationsIcon,
    badge: <Badge count={128} tone="neutral" />,
  },
];

export default function BadgeDemo() {
  return (
    <nav aria-label="Workspace" className="w-full max-w-64 rounded-lg bg-surface-container-low p-2">
      <ul className="flex flex-col">
        {destinations.map(({ href, label, icon: Icon, badge }) => (
          <li key={href}>
            <Link
              href={href}
              className="state-layer flex h-12 items-center gap-3 rounded-full px-4 text-label-lg text-on-surface-variant no-underline focus-ring"
            >
              <Icon className="size-6 shrink-0" />
              <span className="flex-1 truncate">{label}</span>
              {badge}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
