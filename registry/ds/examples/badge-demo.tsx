'use client';

import { Link } from 'react-aria-components';
import { ChatIcon, InboxIcon, NotificationsIcon, TodayIcon } from '@/registry/ds/lib/icons';
import { Badge } from '@/registry/ds/ui/badge';

const destinations = [
  { href: '#inbox', label: 'Inbox', icon: InboxIcon, badge: <Badge count={12} /> },
  {
    href: '#tasks',
    label: 'Tasks',
    icon: TodayIcon,
    badge: <Badge count={4} variant="soft" tone="warning" label="{count} due today" />,
  },
  { href: '#messages', label: 'Messages', icon: ChatIcon, badge: <Badge /> },
  {
    href: '#notifications',
    label: 'Notifications',
    icon: NotificationsIcon,
    badge: <Badge count={128} variant="soft" tone="neutral" />,
  },
];

export default function BadgeDemo() {
  return (
    <nav
      aria-label="Main"
      className="w-full max-w-64 rounded-container border border-outline-subtle bg-surface-raised p-1.5"
    >
      <ul className="flex flex-col">
        {destinations.map(({ href, label, icon: Icon, badge }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex h-10 cursor-pointer items-center gap-3 rounded-item px-3 text-sm font-medium text-on-surface no-underline focus-ring-inset transition-colors duration-100 ease-out data-[hovered]:bg-neutral-soft data-[pressed]:bg-neutral-soft-hover"
            >
              <Icon className="size-5 shrink-0 text-on-surface-variant" />
              <span className="flex-1 truncate">{label}</span>
              {badge}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
