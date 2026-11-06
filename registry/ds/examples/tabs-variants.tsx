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
            <TabList aria-label={`Library, ${label.toLowerCase()} tabs`}>
              <Tab id="photos">Photos</Tab>
              <Tab id="videos">Videos</Tab>
              <Tab id="music">Music</Tab>
            </TabList>
            <TabPanel id="photos" className="text-body-md text-on-surface-variant">
              248 photos, newest first.
            </TabPanel>
            <TabPanel id="videos" className="text-body-md text-on-surface-variant">
              12 videos, 1.4 GB in total.
            </TabPanel>
            <TabPanel id="music" className="text-body-md text-on-surface-variant">
              86 songs in 4 playlists.
            </TabPanel>
          </Tabs>
        </section>
      ))}
    </div>
  );
}
