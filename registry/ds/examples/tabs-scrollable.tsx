import { Tab, TabList, TabPanel, Tabs } from '@/registry/ds/ui/tabs';

const topics = [
  { id: 'news', label: 'News' },
  { id: 'sports', label: 'Sports' },
  { id: 'music', label: 'Music' },
  { id: 'movies', label: 'Movies' },
  { id: 'travel', label: 'Travel' },
  { id: 'food', label: 'Food' },
  { id: 'science', label: 'Science' },
  { id: 'design', label: 'Design' },
  { id: 'health', label: 'Health' },
];

export default function TabsScrollable() {
  return (
    <Tabs className="w-full max-w-sm">
      <TabList aria-label="Topics" items={topics}>
        {(topic) => <Tab id={topic.id}>{topic.label}</Tab>}
      </TabList>
      {topics.map((topic) => (
        <TabPanel key={topic.id} id={topic.id} className="text-sm text-on-surface-variant">
          New articles in {topic.label}.
        </TabPanel>
      ))}
    </Tabs>
  );
}
