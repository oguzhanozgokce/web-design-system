import { Tab, TabList, TabPanel, Tabs } from '@/registry/ds/ui/tabs';

const categories = [
  { id: 'all', label: 'All spending', total: '€48,210' },
  { id: 'payroll', label: 'Payroll', total: '€31,400' },
  { id: 'rent', label: 'Rent', total: '€6,000' },
  { id: 'software', label: 'Software', total: '€2,184' },
  { id: 'travel', label: 'Travel', total: '€1,920' },
  { id: 'marketing', label: 'Marketing', total: '€3,350' },
  { id: 'equipment', label: 'Equipment', total: '€1,780' },
  { id: 'insurance', label: 'Insurance', total: '€640' },
  { id: 'taxes', label: 'Taxes', total: '€936' },
];

export default function TabsScrollable() {
  return (
    <Tabs variant="secondary" className="w-full max-w-sm">
      <TabList aria-label="Spending categories" items={categories}>
        {(category) => <Tab id={category.id}>{category.label}</Tab>}
      </TabList>
      {categories.map((category) => (
        <TabPanel
          key={category.id}
          id={category.id}
          className="text-body-md text-on-surface-variant"
        >
          {category.label}: {category.total} in October.
        </TabPanel>
      ))}
    </Tabs>
  );
}
