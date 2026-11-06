import { Button } from '@/registry/ds/ui/button';
import { Sheet, SheetBody, SheetHeader, SheetTrigger } from '@/registry/ds/ui/sheet';

const sides = [
  {
    side: 'start',
    label: 'Start',
    title: 'Workspaces',
    body: 'Switch between the Acme Retail, Acme Wholesale and Personal ledgers.',
  },
  {
    side: 'end',
    label: 'End',
    title: 'Order filters',
    body: 'Narrow the order list by status, channel and fulfilment date.',
  },
  {
    side: 'top',
    label: 'Top',
    title: 'Scheduled maintenance',
    body: 'Payouts pause on Sunday between 02:00 and 03:00 UTC while we upgrade the ledger.',
  },
  {
    side: 'bottom',
    label: 'Bottom',
    title: 'Share report',
    body: 'Send the October revenue report to your accountant or copy a read-only link.',
  },
] as const;

export default function SheetSides() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {sides.map(({ side, label, title, body }) => (
        <SheetTrigger key={side}>
          <Button variant="outlined">{label}</Button>
          <Sheet side={side}>
            <SheetHeader title={title} />
            <SheetBody>
              <p className="text-on-surface-variant">{body}</p>
            </SheetBody>
          </Sheet>
        </SheetTrigger>
      ))}
    </div>
  );
}
