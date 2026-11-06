import { Tab, TabList, TabPanel, Tabs } from '@/registry/ds/ui/tabs';

const transactions = [
  { id: 't1', name: 'Northwind Traders', amount: '+€1,150.00', kind: 'income' },
  { id: 't2', name: 'Office rent, November', amount: '−€2,000.00', kind: 'expense' },
  { id: 't3', name: 'Contoso Ltd', amount: '+€640.00', kind: 'income' },
  { id: 't4', name: 'Figma subscription', amount: '−€45.00', kind: 'expense' },
] as const;

const filters = [
  { id: 'all', label: 'All' },
  { id: 'income', label: 'Income' },
  { id: 'expense', label: 'Expenses' },
] as const;

export default function TabsPill() {
  return (
    <div className="w-full max-w-sm rounded-lg bg-surface-container-low p-4 text-on-surface">
      <Tabs variant="pill" className="gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-title-md">Transactions</h3>
          <TabList aria-label="Filter transactions" items={filters}>
            {(filter) => <Tab id={filter.id}>{filter.label}</Tab>}
          </TabList>
        </div>
        {filters.map((filter) => (
          <TabPanel key={filter.id} id={filter.id}>
            <ul className="flex flex-col">
              {transactions
                .filter((item) => filter.id === 'all' || item.kind === filter.id)
                .map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-4 py-2 text-body-md"
                  >
                    <span>{item.name}</span>
                    <span className="text-on-surface-variant tabular-digits">{item.amount}</span>
                  </li>
                ))}
            </ul>
          </TabPanel>
        ))}
      </Tabs>
    </div>
  );
}
