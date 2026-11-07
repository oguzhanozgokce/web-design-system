import { TuneIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Sheet, SheetBody, SheetFooter, SheetHeader, SheetTrigger } from '@/registry/ds/ui/sheet';

const settings = [
  { label: 'Layout', value: 'Grid' },
  { label: 'Sort by', value: 'Date added' },
  { label: 'Group by', value: 'Month' },
  { label: 'Show captions', value: 'On' },
];

export default function SheetDetached() {
  return (
    <SheetTrigger>
      <Button variant="outline" startIcon={<TuneIcon />}>
        View options
      </Button>
      <Sheet detached size="sm">
        <SheetHeader title="View options" description="Applies to every album in Photos." />
        <SheetBody>
          <dl className="flex flex-col divide-y divide-outline-subtle">
            {settings.map((setting) => (
              <div key={setting.label} className="flex items-baseline justify-between gap-4 py-3">
                <dt>{setting.label}</dt>
                <dd className="text-on-surface">{setting.value}</dd>
              </div>
            ))}
          </dl>
        </SheetBody>
        <SheetFooter>
          <Button variant="soft" slot="close">
            Reset
          </Button>
          <Button slot="close">Done</Button>
        </SheetFooter>
      </Sheet>
    </SheetTrigger>
  );
}
