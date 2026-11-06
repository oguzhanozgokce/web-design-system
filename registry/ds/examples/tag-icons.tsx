import { LockIcon, ScheduleIcon, VerifiedIcon, WarningIcon } from '@/registry/ds/lib/icons';
import { Tag } from '@/registry/ds/ui/tag';

export default function TagIcons() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Tag tone="success" icon={<VerifiedIcon />}>
        Verified
      </Tag>
      <Tag tone="info" icon={<ScheduleIcon />}>
        Scheduled
      </Tag>
      <Tag tone="warning" icon={<WarningIcon />}>
        Card expiring
      </Tag>
      <Tag icon={<LockIcon />}>Private</Tag>
      <Tag tone="primary" variant="outlined" dot="pulse">
        Syncing
      </Tag>
    </div>
  );
}
