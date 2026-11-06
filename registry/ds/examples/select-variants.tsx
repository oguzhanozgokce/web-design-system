import { ListBoxItem } from '@/registry/ds/ui/list-box';
import { Select } from '@/registry/ds/ui/select';

function BillingCycle({ variant }: { variant: 'outlined' | 'filled' }) {
  return (
    <Select
      label={variant === 'outlined' ? 'Billing cycle, outlined' : 'Billing cycle, filled'}
      variant={variant}
      defaultValue="monthly"
      className="w-full"
    >
      <ListBoxItem id="monthly">Monthly</ListBoxItem>
      <ListBoxItem id="quarterly">Quarterly</ListBoxItem>
      <ListBoxItem id="yearly" description="Save 2 months">
        Yearly
      </ListBoxItem>
    </Select>
  );
}

export default function SelectVariants() {
  return (
    <div className="grid w-full max-w-lg grid-cols-1 gap-4 sm:grid-cols-2">
      <BillingCycle variant="outlined" />
      <BillingCycle variant="filled" />
    </div>
  );
}
