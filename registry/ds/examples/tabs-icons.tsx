import {
  BarChartIcon,
  DashboardIcon,
  FolderIcon,
  GroupIcon,
  HistoryIcon,
  SettingsIcon,
} from '@/registry/ds/lib/icons';
import { Tab, TabList, TabPanel, Tabs } from '@/registry/ds/ui/tabs';

export default function TabsIcons() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-8">
      <Tabs fullWidth>
        <TabList aria-label="Workspace">
          <Tab id="overview" icon={<DashboardIcon />}>
            Overview
          </Tab>
          <Tab id="reports" icon={<BarChartIcon />}>
            Reports
          </Tab>
          <Tab id="team" icon={<GroupIcon />}>
            Team
          </Tab>
        </TabList>
        <TabPanel id="overview" className="text-body-md text-on-surface-variant">
          Revenue is up 8% on last month.
        </TabPanel>
        <TabPanel id="reports" className="text-body-md text-on-surface-variant">
          The October report is ready to export.
        </TabPanel>
        <TabPanel id="team" className="text-body-md text-on-surface-variant">
          Two invitations are waiting for a reply.
        </TabPanel>
      </Tabs>
      <Tabs variant="secondary">
        <TabList aria-label="Repository">
          <Tab id="files" icon={<FolderIcon />}>
            Files
          </Tab>
          <Tab id="history" icon={<HistoryIcon />}>
            History
          </Tab>
          <Tab id="settings" icon={<SettingsIcon />}>
            Settings
          </Tab>
        </TabList>
        <TabPanel id="files" className="text-body-md text-on-surface-variant">
          238 files on the main branch.
        </TabPanel>
        <TabPanel id="history" className="text-body-md text-on-surface-variant">
          Last change 12 minutes ago by Mert Kaya.
        </TabPanel>
        <TabPanel id="settings" className="text-body-md text-on-surface-variant">
          Only owners can change these settings.
        </TabPanel>
      </Tabs>
    </div>
  );
}
