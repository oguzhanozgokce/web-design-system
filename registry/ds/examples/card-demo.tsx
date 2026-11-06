'use client';

import { useLocale } from 'react-aria-components';
import { DownloadIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/registry/ds/ui/card';

export default function CardDemo() {
  const { locale } = useLocale();
  const amount = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(4820);
  const due = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
    new Date(2026, 10, 14),
  );

  return (
    <Card className="w-full max-w-sm">
      <CardHeader
        title="Invoice INV-2048"
        description={`Harbor Logistics · due ${due}`}
        action={
          <Button variant="text" size="sm">
            View
          </Button>
        }
      />
      <CardContent className="flex flex-col gap-1">
        <span className="text-headline-sm tabular-digits">{amount}</span>
        <span className="text-on-surface-variant">3 line items · net 30</span>
      </CardContent>
      <CardFooter>
        <Button variant="outlined" startIcon={<DownloadIcon />}>
          PDF
        </Button>
        <Button>Send reminder</Button>
      </CardFooter>
    </Card>
  );
}
