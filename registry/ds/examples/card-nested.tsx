'use client';

import { Card, CardContent, CardHeader, useSurfaceLevel } from '@/registry/ds/ui/card';

function SurfaceName() {
  return (
    <span className="font-mono text-label-sm text-on-surface-variant">{useSurfaceLevel()}</span>
  );
}

const folders = [
  {
    name: 'Photos',
    size: '24.6 GB',
    items: '8,412 items',
    largest: 'Largest: Summer album',
  },
  {
    name: 'Videos',
    size: '18.2 GB',
    items: '312 items',
    largest: 'Largest: Birthday.mp4',
  },
];

export default function CardNested() {
  return (
    <Card variant="elevated" padding="lg" className="w-full max-w-xl">
      <CardHeader title="Storage" description="48 GB of 100 GB used">
        <SurfaceName />
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {folders.map((folder) => (
          <Card key={folder.name} variant="elevated">
            <CardHeader title={folder.name} description={folder.items}>
              <SurfaceName />
            </CardHeader>
            <CardContent className="text-title-lg tabular-digits">{folder.size}</CardContent>
            <Card variant="outlined" padding="sm">
              <CardContent className="flex flex-col gap-1">
                {folder.largest}
                <SurfaceName />
              </CardContent>
            </Card>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
