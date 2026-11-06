import { ListBoxItem } from '@/registry/ds/ui/list-box';
import { Select } from '@/registry/ds/ui/select';

export default function SelectSizes() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Select key={size} label={`Rows per page, ${size}`} size={size} defaultValue="25">
          <ListBoxItem id="10">10</ListBoxItem>
          <ListBoxItem id="25">25</ListBoxItem>
          <ListBoxItem id="50">50</ListBoxItem>
          <ListBoxItem id="100">100</ListBoxItem>
        </Select>
      ))}
    </div>
  );
}
