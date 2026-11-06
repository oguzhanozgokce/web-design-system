import { ToggleButton } from '@/registry/ds/ui/toggle-button';
import { RichTooltip, TooltipTrigger } from '@/registry/ds/ui/tooltip';

export default function TooltipRich() {
  return (
    <TooltipTrigger>
      <ToggleButton variant="outlined" defaultSelected>
        Auto-reconcile
      </ToggleButton>
      <RichTooltip title="Auto-reconcile" placement="bottom" showArrow>
        Matches each bank transaction to an open invoice with the same amount and reference.
        Anything it cannot match waits in Review.
      </RichTooltip>
    </TooltipTrigger>
  );
}
