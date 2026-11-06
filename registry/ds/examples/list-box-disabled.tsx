import { ListBox, ListBoxItem } from '@/registry/ds/ui/list-box';

export default function ListBoxDisabled() {
  return (
    <ListBox
      aria-label="Plan"
      selectionMode="single"
      defaultSelectedKeys={['team']}
      disabledKeys={['enterprise']}
      variant="outlined"
      className="w-full max-w-xs"
    >
      <ListBoxItem id="starter" description="Up to 3 ledgers">
        Starter
      </ListBoxItem>
      <ListBoxItem id="team" description="Unlimited ledgers, 10 members">
        Team
      </ListBoxItem>
      <ListBoxItem id="enterprise" description="Contact sales to enable">
        Enterprise
      </ListBoxItem>
    </ListBox>
  );
}
