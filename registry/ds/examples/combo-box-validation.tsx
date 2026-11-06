import { Button } from '@/registry/ds/ui/button';
import { ComboBox } from '@/registry/ds/ui/combo-box';
import { ListBoxItem } from '@/registry/ds/ui/list-box';

const vatRates = [
  { id: 'tr-20', name: 'Standard 20%', country: 'Türkiye' },
  { id: 'tr-10', name: 'Reduced 10%', country: 'Türkiye' },
  { id: 'de-19', name: 'Standard 19%', country: 'Germany' },
  { id: 'de-7', name: 'Reduced 7%', country: 'Germany' },
];

export default function ComboBoxValidation() {
  return (
    <form
      className="flex w-full max-w-xs flex-col items-start gap-4"
      onSubmit={(event) => event.preventDefault()}
    >
      <ComboBox
        name="vatRate"
        label="VAT rate"
        description="Applied to every line on this invoice."
        errorMessage="Choose a VAT rate from the list."
        defaultItems={vatRates}
        isRequired
        className="w-full"
      >
        {(rate) => (
          <ListBoxItem description={rate.country} keywords={[rate.country]}>
            {rate.name}
          </ListBoxItem>
        )}
      </ComboBox>
      <Button type="submit">Issue invoice</Button>
    </form>
  );
}
