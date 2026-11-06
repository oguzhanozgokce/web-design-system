'use client';

import { useMediaQuery } from '@/registry/ds/hooks/use-media-query';
import { CallIcon, LockIcon, NotificationsIcon, PersonIcon } from '@/registry/ds/lib/icons';
import { Tab, TabList, TabPanel, Tabs } from '@/registry/ds/ui/tabs';

const sections = [
  {
    id: 'profile',
    label: 'Profile',
    icon: <PersonIcon />,
    body: 'Your name and photo appear on invoices you send.',
  },
  {
    id: 'security',
    label: 'Security',
    icon: <LockIcon />,
    body: 'Two-step verification is on. Last sign-in from Istanbul, 2 hours ago.',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: <NotificationsIcon />,
    body: 'Email me when an invoice is paid or becomes overdue.',
  },
  {
    id: 'support',
    label: 'Support',
    icon: <CallIcon />,
    body: 'Our team answers within one working day.',
  },
];

export default function TabsVertical() {
  const wide = useMediaQuery('(min-width: 40rem)', true);

  return (
    <Tabs
      orientation={wide ? 'vertical' : 'horizontal'}
      iconPlacement="start"
      className="w-full max-w-xl"
    >
      <TabList aria-label="Account settings" items={sections}>
        {(section) => (
          <Tab id={section.id} icon={section.icon}>
            {section.label}
          </Tab>
        )}
      </TabList>
      {sections.map((section) => (
        <TabPanel key={section.id} id={section.id} className="flex flex-col gap-1">
          <h3 className="text-title-md text-on-surface">{section.label}</h3>
          <p className="text-body-md text-on-surface-variant">{section.body}</p>
        </TabPanel>
      ))}
    </Tabs>
  );
}
