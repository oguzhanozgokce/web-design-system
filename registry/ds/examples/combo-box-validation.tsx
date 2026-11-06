import { Button } from '@/registry/ds/ui/button';
import { ComboBox } from '@/registry/ds/ui/combo-box';
import { ListBoxItem } from '@/registry/ds/ui/list-box';

const countries = [
  { id: 'AR', name: 'Argentina' },
  { id: 'EG', name: 'Egypt' },
  { id: 'FR', name: 'France' },
  { id: 'ID', name: 'Indonesia' },
  { id: 'MX', name: 'Mexico' },
  { id: 'VN', name: 'Vietnam' },
];

export default function ComboBoxValidation() {
  return (
    <form
      className="flex w-full max-w-xs flex-col items-start gap-4"
      onSubmit={(event) => event.preventDefault()}
    >
      <ComboBox
        name="country"
        label="Country"
        description="Where you live now."
        errorMessage="Choose a country from the list."
        defaultItems={countries}
        isRequired
        className="w-full"
      >
        {(country) => <ListBoxItem>{country.name}</ListBoxItem>}
      </ComboBox>
      <Button type="submit">Continue</Button>
    </form>
  );
}
