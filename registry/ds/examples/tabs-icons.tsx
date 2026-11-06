import {
  ChatIcon,
  GroupIcon,
  HistoryIcon,
  InfoIcon,
  ScheduleIcon,
  StarIcon,
} from '@/registry/ds/lib/icons';
import { Tab, TabList, TabPanel, Tabs } from '@/registry/ds/ui/tabs';

export default function TabsIcons() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-8">
      <Tabs fullWidth>
        <TabList aria-label="Files">
          <Tab id="recent" icon={<ScheduleIcon />}>
            Recent
          </Tab>
          <Tab id="starred" icon={<StarIcon />}>
            Starred
          </Tab>
          <Tab id="shared" icon={<GroupIcon />}>
            Shared
          </Tab>
        </TabList>
        <TabPanel id="recent" className="text-body-md text-on-surface-variant">
          Files you opened in the last 7 days.
        </TabPanel>
        <TabPanel id="starred" className="text-body-md text-on-surface-variant">
          Files you starred to find them quickly.
        </TabPanel>
        <TabPanel id="shared" className="text-body-md text-on-surface-variant">
          Files other people shared with you.
        </TabPanel>
      </Tabs>
      <Tabs variant="secondary">
        <TabList aria-label="File">
          <Tab id="details" icon={<InfoIcon />}>
            Details
          </Tab>
          <Tab id="comments" icon={<ChatIcon />}>
            Comments
          </Tab>
          <Tab id="history" icon={<HistoryIcon />}>
            History
          </Tab>
        </TabList>
        <TabPanel id="details" className="text-body-md text-on-surface-variant">
          Name, size and who can see this file.
        </TabPanel>
        <TabPanel id="comments" className="text-body-md text-on-surface-variant">
          No comments yet.
        </TabPanel>
        <TabPanel id="history" className="text-body-md text-on-surface-variant">
          Edited 12 minutes ago.
        </TabPanel>
      </Tabs>
    </div>
  );
}
