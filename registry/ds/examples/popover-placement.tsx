import { Button } from '@/registry/ds/ui/button';
import { Popover, PopoverDialog, PopoverTrigger } from '@/registry/ds/ui/popover';

const placements = [
  { placement: 'top', label: 'Top' },
  { placement: 'bottom', label: 'Bottom' },
  { placement: 'start', label: 'Start' },
  { placement: 'end', label: 'End' },
] as const;

export default function PopoverPlacement() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {placements.map(({ placement, label }) => (
        <PopoverTrigger key={placement}>
          <Button variant="outline">{label}</Button>
          <Popover placement={placement} showArrow>
            <PopoverDialog>
              <p className="max-w-48">Your changes are saved and synced every few minutes.</p>
            </PopoverDialog>
          </Popover>
        </PopoverTrigger>
      ))}
    </div>
  );
}
