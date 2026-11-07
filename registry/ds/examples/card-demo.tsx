'use client';

import { useLocale } from 'react-aria-components';
import { ShareIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/registry/ds/ui/card';

export default function CardDemo() {
  const { locale } = useLocale();
  const progress = new Intl.NumberFormat(locale, { style: 'percent' }).format(12 / 18);
  const due = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
    new Date(2026, 10, 14),
  );

  return (
    <Card className="w-full max-w-sm">
      <CardHeader
        title="Website redesign"
        description={`Due ${due}`}
        action={
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        }
      />
      <CardContent className="flex flex-col gap-1">
        <span className="text-2xl font-semibold tracking-tight tabular-digits">{progress}</span>
        <span className="text-on-surface-variant">12 of 18 tasks done</span>
      </CardContent>
      <CardFooter>
        <Button variant="outline" startIcon={<ShareIcon />}>
          Share
        </Button>
        <Button>Open</Button>
      </CardFooter>
    </Card>
  );
}
