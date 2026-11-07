import { CircularProgress } from '@/registry/ds/ui/progress';

export default function ProgressCircularValue() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8">
      <div className="flex items-center gap-3">
        <CircularProgress size="xl" value={75} showValueLabel aria-labelledby="checklist-title" />
        <div>
          <p id="checklist-title" className="text-sm font-medium text-on-surface">
            Setup checklist
          </p>
          <p className="text-xs text-on-surface-variant">6 of 8 tasks done</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <CircularProgress
          size="xl"
          tone="warning"
          value={86}
          showValueLabel
          aria-labelledby="mailbox-title"
        />
        <div>
          <p id="mailbox-title" className="text-sm font-medium text-on-surface">
            Mailbox storage
          </p>
          <p className="text-xs text-on-surface-variant">12.9 GB of 15 GB</p>
        </div>
      </div>
    </div>
  );
}
