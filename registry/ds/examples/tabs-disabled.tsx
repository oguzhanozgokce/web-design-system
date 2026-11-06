import { Tab, TabList, TabPanel, Tabs } from '@/registry/ds/ui/tabs';

export default function TabsDisabled() {
  return (
    <Tabs variant="secondary" disabledKeys={['payouts']} className="w-full max-w-xl">
      <TabList aria-label="Balance">
        <Tab id="balance">Balance</Tab>
        <Tab id="statements">Statements</Tab>
        <Tab id="payouts">Payouts</Tab>
      </TabList>
      <TabPanel id="balance" className="text-body-md text-on-surface-variant">
        €12,480.00 available. Payouts open after you verify your bank account.
      </TabPanel>
      <TabPanel id="statements" className="text-body-md text-on-surface-variant">
        Monthly statements are ready on the first working day of each month.
      </TabPanel>
      <TabPanel id="payouts" className="text-body-md text-on-surface-variant">
        No payouts yet.
      </TabPanel>
    </Tabs>
  );
}
