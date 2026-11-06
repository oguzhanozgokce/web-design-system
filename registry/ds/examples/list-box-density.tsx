import { FlagIcon, ScheduleIcon, VerifiedIcon } from '@/registry/ds/lib/icons';
import { ListBox, ListBoxItem } from '@/registry/ds/ui/list-box';

function StatusList({ density }: { density: 'sm' | 'md' }) {
  return (
    <ListBox
      aria-label={`Status, density ${density}`}
      selectionMode="single"
      defaultSelectedKeys={['review']}
      density={density}
      variant="outlined"
      className="w-full"
    >
      <ListBoxItem id="draft" startIcon={<ScheduleIcon />}>
        Draft
      </ListBoxItem>
      <ListBoxItem id="review" startIcon={<FlagIcon />}>
        In review
      </ListBoxItem>
      <ListBoxItem id="done" startIcon={<VerifiedIcon />}>
        Done
      </ListBoxItem>
    </ListBox>
  );
}

export default function ListBoxDensity() {
  return (
    <div className="grid w-full max-w-lg grid-cols-1 items-start gap-4 sm:grid-cols-2">
      <StatusList density="sm" />
      <StatusList density="md" />
    </div>
  );
}
