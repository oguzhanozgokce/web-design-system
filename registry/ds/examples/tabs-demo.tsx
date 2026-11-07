import { Tab, TabList, TabPanel, Tabs } from '@/registry/ds/ui/tabs';

export default function TabsDemo() {
  return (
    <Tabs className="w-full max-w-xl">
      <TabList aria-label="Project">
        <Tab id="overview">Overview</Tab>
        <Tab id="activity">Activity</Tab>
        <Tab id="settings">Settings</Tab>
      </TabList>
      <TabPanel id="overview" className="text-sm text-on-surface-variant">
        A summary of the project and the people working on it.
      </TabPanel>
      <TabPanel id="activity" className="text-sm text-on-surface-variant">
        Recent changes and comments, newest first.
      </TabPanel>
      <TabPanel id="settings" className="text-sm text-on-surface-variant">
        Rename the project, change who can see it or archive it.
      </TabPanel>
    </Tabs>
  );
}
