'use client';

import { Link } from 'react-aria-components';
import { ChatIcon, HomeIcon, InboxIcon, NotificationsIcon } from '@/registry/ds/lib/icons';
import { cn } from '@/registry/ds/lib/utils';
import { Badge, BadgeAnchor } from '@/registry/ds/ui/badge';

const destinations = [
  { href: '#home', label: 'Home', icon: HomeIcon, badge: null },
  { href: '#inbox', label: 'Inbox', icon: InboxIcon, badge: <Badge count={3} /> },
  { href: '#chat', label: 'Chat', icon: ChatIcon, badge: <Badge /> },
  { href: '#alerts', label: 'Alerts', icon: NotificationsIcon, badge: <Badge count={120} /> },
];

export default function BadgeAnchorExample() {
  return (
    <nav
      aria-label="Main"
      className="flex w-full max-w-md justify-around rounded-lg bg-surface-container px-2 py-3"
    >
      {destinations.map(({ href, label, icon: Icon, badge }, index) => (
        <Link
          key={href}
          href={href}
          aria-current={index === 0 ? 'page' : undefined}
          className="group/destination flex flex-col-reverse items-center gap-1 rounded-md px-1 text-label-md text-on-surface-variant no-underline focus-ring data-[current]:text-on-surface"
        >
          <span>{label}</span>
          <span
            className={cn(
              'inline-flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-150 ease-standard',
              index === 0
                ? 'bg-secondary-container text-on-secondary-container'
                : 'group-data-[hovered]/destination:bg-on-surface/8 group-data-[pressed]/destination:bg-on-surface/10',
            )}
          >
            <BadgeAnchor badge={badge}>
              <Icon className="size-6" />
            </BadgeAnchor>
          </span>
        </Link>
      ))}
    </nav>
  );
}
