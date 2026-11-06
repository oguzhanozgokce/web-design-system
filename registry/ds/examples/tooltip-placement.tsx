import { Button } from '@/registry/ds/ui/button';
import { Tooltip, TooltipTrigger } from '@/registry/ds/ui/tooltip';

const placements = [
  { placement: 'top', label: 'Top' },
  { placement: 'bottom', label: 'Bottom' },
  { placement: 'start', label: 'Start' },
  { placement: 'end', label: 'End' },
] as const;

export default function TooltipPlacement() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {placements.map(({ placement, label }) => (
        <TooltipTrigger key={placement} delay={0}>
          <Button variant="outlined">{label}</Button>
          <Tooltip placement={placement} showArrow>
            Synced 2 minutes ago
          </Tooltip>
        </TooltipTrigger>
      ))}
    </div>
  );
}
