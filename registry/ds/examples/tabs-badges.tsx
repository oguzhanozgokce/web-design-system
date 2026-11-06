import { InboxIcon, NotificationsIcon, SendIcon } from '@/registry/ds/lib/icons';
import { Tab, TabList, TabPanel, Tabs } from '@/registry/ds/ui/tabs';

export default function TabsBadges() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-8">
      <Tabs variant="secondary">
        <TabList aria-label="Notifications">
          <Tab id="all">All</Tab>
          <Tab id="unread" badge={12}>
            Unread
          </Tab>
          <Tab id="requests" badge={128}>
            Requests
          </Tab>
          <Tab id="updates" badge>
            Updates
          </Tab>
        </TabList>
        <TabPanel id="all" className="text-body-md text-on-surface-variant">
          Everything from the last 30 days.
        </TabPanel>
        <TabPanel id="unread" className="text-body-md text-on-surface-variant">
          12 notifications you have not opened.
        </TabPanel>
        <TabPanel id="requests" className="text-body-md text-on-surface-variant">
          128 requests are waiting for a reply.
        </TabPanel>
        <TabPanel id="updates" className="text-body-md text-on-surface-variant">
          A new version is ready to install.
        </TabPanel>
      </Tabs>
      <Tabs fullWidth>
        <TabList aria-label="Messages">
          <Tab id="inbox" icon={<InboxIcon />} badge={4}>
            Inbox
          </Tab>
          <Tab id="mentions" icon={<NotificationsIcon />} badge>
            Mentions
          </Tab>
          <Tab id="sent" icon={<SendIcon />}>
            Sent
          </Tab>
        </TabList>
        <TabPanel id="inbox" className="text-body-md text-on-surface-variant">
          Four unread messages.
        </TabPanel>
        <TabPanel id="mentions" className="text-body-md text-on-surface-variant">
          Someone mentioned you in a comment.
        </TabPanel>
        <TabPanel id="sent" className="text-body-md text-on-surface-variant">
          Nothing sent today.
        </TabPanel>
      </Tabs>
    </div>
  );
}
