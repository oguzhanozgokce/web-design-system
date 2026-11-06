import { InboxIcon, MailIcon, NotificationsIcon } from '@/registry/ds/lib/icons';
import { Tab, TabList, TabPanel, Tabs } from '@/registry/ds/ui/tabs';

export default function TabsBadges() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-8">
      <Tabs variant="secondary">
        <TabList aria-label="Orders">
          <Tab id="all">All</Tab>
          <Tab id="unpaid" badge={12}>
            Unpaid
          </Tab>
          <Tab id="pending" badge={128}>
            Pending
          </Tab>
          <Tab id="disputes" badge>
            Disputes
          </Tab>
        </TabList>
        <TabPanel id="all" className="text-body-md text-on-surface-variant">
          1,204 orders this quarter.
        </TabPanel>
        <TabPanel id="unpaid" className="text-body-md text-on-surface-variant">
          12 orders are waiting for payment.
        </TabPanel>
        <TabPanel id="pending" className="text-body-md text-on-surface-variant">
          128 orders are waiting to ship.
        </TabPanel>
        <TabPanel id="disputes" className="text-body-md text-on-surface-variant">
          A customer replied to dispute DSP-311.
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
          <Tab id="sent" icon={<MailIcon />}>
            Sent
          </Tab>
        </TabList>
        <TabPanel id="inbox" className="text-body-md text-on-surface-variant">
          Four unread messages.
        </TabPanel>
        <TabPanel id="mentions" className="text-body-md text-on-surface-variant">
          Deniz mentioned you on invoice INV-2056.
        </TabPanel>
        <TabPanel id="sent" className="text-body-md text-on-surface-variant">
          Nothing sent today.
        </TabPanel>
      </Tabs>
    </div>
  );
}
