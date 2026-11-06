import { ListBoxItem } from '@/registry/ds/ui/list-box';
import { Select } from '@/registry/ds/ui/select';

function Repeat({ variant }: { variant: 'outlined' | 'filled' }) {
  return (
    <Select label={`Repeat, ${variant}`} variant={variant} defaultValue="weekly" className="w-full">
      <ListBoxItem id="never">Never</ListBoxItem>
      <ListBoxItem id="daily">Daily</ListBoxItem>
      <ListBoxItem id="weekly" description="On the same day each week">
        Weekly
      </ListBoxItem>
      <ListBoxItem id="monthly">Monthly</ListBoxItem>
    </Select>
  );
}

export default function SelectVariants() {
  return (
    <div className="grid w-full max-w-lg grid-cols-1 gap-4 sm:grid-cols-2">
      <Repeat variant="outlined" />
      <Repeat variant="filled" />
    </div>
  );
}
