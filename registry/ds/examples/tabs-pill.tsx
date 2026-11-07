import { Tab, TabList, TabPanel, Tabs } from '@/registry/ds/ui/tabs';

const files = [
  { id: 'f1', name: 'Beach.jpg', size: '2.4 MB', kind: 'image' },
  { id: 'f2', name: 'Meeting notes.pdf', size: '180 KB', kind: 'document' },
  { id: 'f3', name: 'Mountains.jpg', size: '3.1 MB', kind: 'image' },
  { id: 'f4', name: 'Reading list.docx', size: '24 KB', kind: 'document' },
] as const;

const filters = [
  { id: 'all', label: 'All' },
  { id: 'image', label: 'Images' },
  { id: 'document', label: 'Documents' },
] as const;

export default function TabsPill() {
  return (
    <div className="w-full max-w-sm rounded-container border border-outline-subtle bg-surface-raised p-4 text-on-surface">
      <Tabs variant="pill" size="sm" className="gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Recent files</h3>
          <TabList aria-label="Filter files" items={filters}>
            {(filter) => <Tab id={filter.id}>{filter.label}</Tab>}
          </TabList>
        </div>
        {filters.map((filter) => (
          <TabPanel key={filter.id} id={filter.id}>
            <ul className="flex flex-col">
              {files
                .filter((file) => filter.id === 'all' || file.kind === filter.id)
                .map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between gap-4 py-2 text-sm"
                  >
                    <span>{file.name}</span>
                    <span className="text-on-surface-variant tabular-digits">{file.size}</span>
                  </li>
                ))}
            </ul>
          </TabPanel>
        ))}
      </Tabs>
    </div>
  );
}
