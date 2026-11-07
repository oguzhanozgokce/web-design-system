'use client';

import { Card, CardContent, CardHeader } from '@/registry/ds/ui/card';

const folders = [
  { name: 'Photos', size: '24.6 GB', items: '8,412 items', largest: 'Largest: Summer album' },
  { name: 'Videos', size: '18.2 GB', items: '312 items', largest: 'Largest: Birthday.mp4' },
];

export default function CardNested() {
  return (
    <Card variant="elevated" padding="lg" className="w-full max-w-xl">
      <CardHeader title="Storage" description="48 GB of 100 GB used" />
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {folders.map((folder) => (
          <Card key={folder.name} variant="soft">
            <CardHeader title={folder.name} description={folder.items} />
            <CardContent className="text-2xl font-semibold tabular-digits">
              {folder.size}
            </CardContent>
            <Card variant="outline" padding="sm">
              <CardContent className="text-sm text-on-surface-variant">
                {folder.largest}
              </CardContent>
            </Card>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
