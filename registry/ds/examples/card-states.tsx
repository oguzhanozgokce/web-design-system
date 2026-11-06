import { CardHeader, SelectableCard, SelectableCardGroup } from '@/registry/ds/ui/card';

export default function CardStates() {
  return (
    <SelectableCardGroup
      label="Data region"
      description="Where your files and backups are stored. This cannot be changed later."
      isRequired
      isInvalid
      errorMessage="Choose a region to continue."
      orientation="horizontal"
      className="w-full"
    >
      <SelectableCard value="europe">
        <CardHeader title="Europe" description="Frankfurt" />
      </SelectableCard>
      <SelectableCard value="us">
        <CardHeader title="United States" description="Virginia" />
      </SelectableCard>
      <SelectableCard value="asia" isDisabled>
        <CardHeader title="Asia Pacific" description="Coming soon" />
      </SelectableCard>
    </SelectableCardGroup>
  );
}
