import { Tab, TabList, TabPanel, Tabs, type TabsVariant } from '@/registry/ds/ui/tabs';

const variants: { variant: TabsVariant; label: string }[] = [
  { variant: 'primary', label: 'Primary' },
  { variant: 'secondary', label: 'Secondary' },
  { variant: 'pill', label: 'Pill' },
];

export default function TabsVariants() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-8">
      {variants.map(({ variant, label }) => (
        <section key={variant} className="flex flex-col gap-2">
          <h3 className="text-label-lg text-on-surface-variant">{label}</h3>
          <Tabs variant={variant}>
            <TabList aria-label={`Project, ${label.toLowerCase()} tabs`}>
              <Tab id="activity">Activity</Tab>
              <Tab id="files">Files</Tab>
              <Tab id="members">Members</Tab>
            </TabList>
            <TabPanel id="activity" className="text-body-md text-on-surface-variant">
              Ayşe Demir approved the Q3 payroll run.
            </TabPanel>
            <TabPanel id="files" className="text-body-md text-on-surface-variant">
              12 files, 48 MB in total.
            </TabPanel>
            <TabPanel id="members" className="text-body-md text-on-surface-variant">
              Five people can edit this project.
            </TabPanel>
          </Tabs>
        </section>
      ))}
    </div>
  );
}
