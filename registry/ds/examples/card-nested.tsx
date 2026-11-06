'use client';

import { Card, CardContent, CardHeader, useSurfaceLevel } from '@/registry/ds/ui/card';

function SurfaceName() {
  return (
    <span className="font-mono text-label-sm text-on-surface-variant">{useSurfaceLevel()}</span>
  );
}

const categories = [
  {
    name: 'Software',
    amount: '4,210 USD',
    change: '+8% vs September',
    largest: 'Largest: annual design licence renewal',
  },
  {
    name: 'Travel',
    amount: '2,980 USD',
    change: '−14% vs September',
    largest: 'Largest: flights for the Lisbon offsite',
  },
];

export default function CardNested() {
  return (
    <Card variant="elevated" padding="lg" className="w-full max-w-xl">
      <CardHeader title="Team spending, October" description="Across 4 cost centres">
        <SurfaceName />
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {categories.map((category) => (
          <Card key={category.name} variant="elevated">
            <CardHeader title={category.name} description={category.change}>
              <SurfaceName />
            </CardHeader>
            <CardContent className="text-title-lg tabular-digits">{category.amount}</CardContent>
            <Card variant="outlined" padding="sm">
              <CardContent className="flex flex-col gap-1">
                {category.largest}
                <SurfaceName />
              </CardContent>
            </Card>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
