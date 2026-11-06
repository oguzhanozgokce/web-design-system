import { Button } from '@/registry/ds/ui/button';
import { Sheet, SheetBody, SheetHeader, SheetTrigger } from '@/registry/ds/ui/sheet';

const sides = [
  {
    side: 'start',
    label: 'Start',
    title: 'Navigation',
    body: 'Move between the main sections of the app.',
  },
  {
    side: 'end',
    label: 'End',
    title: 'Filters',
    body: 'Narrow the list by type, owner and date.',
  },
  {
    side: 'top',
    label: 'Top',
    title: 'Scheduled maintenance',
    body: 'The service is unavailable on Sunday between 02:00 and 03:00 UTC.',
  },
  {
    side: 'bottom',
    label: 'Bottom',
    title: 'Share',
    body: 'Copy a link, or invite people by email.',
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
