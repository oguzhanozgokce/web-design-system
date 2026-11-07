import { ToggleButton } from '@/registry/ds/ui/toggle-button';
import { RichTooltip, TooltipTrigger } from '@/registry/ds/ui/tooltip';

export default function TooltipRich() {
  return (
    <TooltipTrigger>
      <ToggleButton variant="soft" defaultSelected>
        Auto-save
      </ToggleButton>
      <RichTooltip title="Auto-save" placement="bottom" showArrow>
        Saves your changes every few seconds. Turn it off to save only when you choose.
      </RichTooltip>
    </TooltipTrigger>
  );
}
