import { ToggleButton } from '@/registry/ds/ui/toggle-button';

export default function ToggleButtonSizes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <ToggleButton key={size} size={size} defaultSelected={size === 'md'}>
          Size {size}
        </ToggleButton>
      ))}
    </div>
  );
}
