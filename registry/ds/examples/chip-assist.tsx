import { CalendarIcon, DownloadIcon, ShareIcon } from '@/registry/ds/lib/icons';
import { AssistChip } from '@/registry/ds/ui/chip';

export default function ChipAssist() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <AssistChip startIcon={<CalendarIcon />}>Add to calendar</AssistChip>
      <AssistChip startIcon={<ShareIcon />}>Share</AssistChip>
      <AssistChip variant="elevated" startIcon={<DownloadIcon />}>
        Download
      </AssistChip>
    </div>
  );
}
