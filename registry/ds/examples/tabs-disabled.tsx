import { Tab, TabList, TabPanel, Tabs } from '@/registry/ds/ui/tabs';

export default function TabsDisabled() {
  return (
    <Tabs disabledKeys={['settings']} className="w-full max-w-xl">
      <TabList aria-label="Project">
        <Tab id="overview">Overview</Tab>
        <Tab id="members">Members</Tab>
        <Tab id="settings">Settings</Tab>
      </TabList>
      <TabPanel id="overview" className="text-sm text-on-surface-variant">
        You can view this project. Only owners can open its settings.
      </TabPanel>
      <TabPanel id="members" className="text-sm text-on-surface-variant">
        Five people have access to this project.
      </TabPanel>
      <TabPanel id="settings" className="text-sm text-on-surface-variant">
        Rename, archive or delete the project.
      </TabPanel>
    </Tabs>
  );
}
