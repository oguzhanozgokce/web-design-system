import { ToggleButton, ToggleButtonGroup } from '@/registry/ds/ui/toggle-button';

export default function ToggleButtonGroupFullWidth() {
  return (
    <div className="w-full max-w-sm">
      <ToggleButtonGroup
        aria-label="Billing cycle"
        fullWidth
        disallowEmptySelection
        defaultSelectedKeys={['yearly']}
      >
        <ToggleButton id="monthly">Monthly</ToggleButton>
        <ToggleButton id="yearly">Yearly</ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
}
