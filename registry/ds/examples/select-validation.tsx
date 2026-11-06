import { Button } from '@/registry/ds/ui/button';
import { ListBoxItem } from '@/registry/ds/ui/list-box';
import { Select } from '@/registry/ds/ui/select';

export default function SelectValidation() {
  return (
    <form
      className="flex w-full max-w-xs flex-col items-start gap-4"
      onSubmit={(event) => event.preventDefault()}
    >
      <Select
        name="payoutAccount"
        label="Payout account"
        description="Settlements arrive here every Friday."
        errorMessage="Choose where payouts should go."
        placeholder="Choose an account"
        isRequired
        className="w-full"
      >
        <ListBoxItem id="garanti" description="TR•• •••• 4821">
          Garanti BBVA
        </ListBoxItem>
        <ListBoxItem id="isbank" description="TR•• •••• 1907">
          İş Bankası
        </ListBoxItem>
        <ListBoxItem id="wise" description="BE•• •••• 3310">
          Wise Business
        </ListBoxItem>
      </Select>
      <Button type="submit">Save payout settings</Button>
    </form>
  );
}
