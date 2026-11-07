import { ActivityBars } from '@/registry/ds/ui/activity-bars';

const states = [
  { label: 'Playing', className: 'text-primary', isActive: true },
  { label: 'Speaking', className: 'text-success', isActive: true },
  { label: 'Recording', className: 'text-error', isActive: true },
  { label: 'Paused', className: 'text-on-surface-variant', isActive: false },
];

export default function ActivityBarsColors() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
      {states.map((state) => (
        <span
          key={state.label}
          className={`flex items-center gap-2 text-sm font-medium ${state.className}`}
        >
          <ActivityBars size="sm" isActive={state.isActive} />
          {state.label}
        </span>
      ))}
    </div>
  );
}
