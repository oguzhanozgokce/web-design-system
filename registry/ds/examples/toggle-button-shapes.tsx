import { ToggleButton } from '@/registry/ds/ui/toggle-button';

export default function ToggleButtonShapes() {
  return (
    <div className="grid grid-cols-[auto_auto_auto] items-center gap-3">
      {(['round', 'square'] as const).map((shape) => (
        <div key={shape} className="contents">
          <span className="text-label-lg text-on-surface-variant">{shape}</span>
          <ToggleButton shape={shape}>Archived</ToggleButton>
          <ToggleButton shape={shape} defaultSelected>
            Drafts
          </ToggleButton>
        </div>
      ))}
    </div>
  );
}
