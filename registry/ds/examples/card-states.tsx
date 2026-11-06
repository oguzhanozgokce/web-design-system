import { CardHeader, SelectableCard, SelectableCardGroup } from '@/registry/ds/ui/card';

export default function CardStates() {
  return (
    <SelectableCardGroup
      label="Data region"
      description="Where your ledgers and backups are stored. This cannot be changed later."
      isRequired
      isInvalid
      errorMessage="Choose a region to continue."
      orientation="horizontal"
      className="w-full"
    >
      <SelectableCard value="eu">
        <CardHeader title="Frankfurt" description="EU, GDPR" />
      </SelectableCard>
      <SelectableCard value="us">
        <CardHeader title="Virginia" description="United States" />
      </SelectableCard>
      <SelectableCard value="tr" isDisabled>
        <CardHeader title="Istanbul" description="Available in Q1 2027" />
      </SelectableCard>
    </SelectableCardGroup>
  );
}
