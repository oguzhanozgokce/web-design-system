import { ToggleButton, ToggleButtonGroup } from '@/registry/ds/ui/toggle-button';

const views = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
];

export default function ToggleButtonAttached() {
  return (
    <div className="flex flex-col items-center gap-4">
      {(['attached', 'detached'] as const).map((variant) => (
        <ToggleButtonGroup
          key={variant}
          aria-label={`Calendar view, ${variant}`}
          variant={variant}
          defaultSelectedKeys={['week']}
          disallowEmptySelection
        >
          {views.map((view) => (
            <ToggleButton key={view.id} id={view.id}>
              {view.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      ))}
    </div>
  );
}
