import { ToggleButton, ToggleButtonGroup } from '@/registry/ds/ui/toggle-button';

export default function ToggleButtonGroupFullWidth() {
  return (
    <div className="w-full max-w-sm">
      <ToggleButtonGroup
        aria-label="Theme"
        fullWidth
        disallowEmptySelection
        defaultSelectedKeys={['system']}
      >
        <ToggleButton id="light">Light</ToggleButton>
        <ToggleButton id="dark">Dark</ToggleButton>
        <ToggleButton id="system">System</ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
}
