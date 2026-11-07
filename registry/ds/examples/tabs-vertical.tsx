'use client';

import { useMediaQuery } from '@/registry/ds/hooks/use-media-query';
import { LockIcon, NotificationsIcon, PaletteIcon, PersonIcon } from '@/registry/ds/lib/icons';
import { Tab, TabList, TabPanel, Tabs } from '@/registry/ds/ui/tabs';

const sections = [
  {
    id: 'profile',
    label: 'Profile',
    icon: <PersonIcon />,
    body: 'Choose the name and photo other people see.',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: <NotificationsIcon />,
    body: 'Pick what you hear about, and whether by email or push.',
  },
  {
    id: 'privacy',
    label: 'Privacy',
    icon: <LockIcon />,
    body: 'Decide who can see your profile and your activity.',
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icon: <PaletteIcon />,
    body: 'Use a light or dark theme, or follow your device.',
  },
];

export default function TabsVertical() {
  const wide = useMediaQuery('(min-width: 40rem)', true);

  return (
    <Tabs orientation={wide ? 'vertical' : 'horizontal'} className="w-full max-w-xl">
      <TabList aria-label="Settings" items={sections}>
        {(section) => (
          <Tab id={section.id} icon={section.icon}>
            {section.label}
          </Tab>
        )}
      </TabList>
      {sections.map((section) => (
        <TabPanel key={section.id} id={section.id} className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-on-surface">{section.label}</h3>
          <p className="text-sm text-on-surface-variant">{section.body}</p>
        </TabPanel>
      ))}
    </Tabs>
  );
}
