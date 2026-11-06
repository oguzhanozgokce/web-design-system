import { Tab, TabList, TabPanel, Tabs } from '@/registry/ds/ui/tabs';

export default function TabsDemo() {
  return (
    <Tabs className="w-full max-w-xl">
      <TabList aria-label="Northwind Traders">
        <Tab id="overview">Overview</Tab>
        <Tab id="invoices">Invoices</Tab>
        <Tab id="payments">Payments</Tab>
        <Tab id="notes">Notes</Tab>
      </TabList>
      <TabPanel id="overview" className="text-body-md text-on-surface-variant">
        Northwind Traders has three open invoices totalling €4,280. The next one is due on 14
        November.
      </TabPanel>
      <TabPanel id="invoices" className="text-body-md text-on-surface-variant">
        INV-2048, INV-2051 and INV-2056 are open. INV-2031 was paid on 2 October.
      </TabPanel>
      <TabPanel id="payments" className="text-body-md text-on-surface-variant">
        The last payment of €1,150.00 arrived by bank transfer on 2 October.
      </TabPanel>
      <TabPanel id="notes" className="text-body-md text-on-surface-variant">
        Send reminders to accounts@northwind.example, not to the buyer.
      </TabPanel>
    </Tabs>
  );
}
