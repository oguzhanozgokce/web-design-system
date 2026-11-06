import { Checkbox, CheckboxGroup } from '@/registry/ds/ui/checkbox';

export default function CheckboxHorizontal() {
  return (
    <CheckboxGroup
      label="Columns in export"
      orientation="horizontal"
      defaultValue={['date', 'customer', 'amount']}
    >
      <Checkbox value="date">Date</Checkbox>
      <Checkbox value="customer">Customer</Checkbox>
      <Checkbox value="amount">Amount</Checkbox>
      <Checkbox value="status">Status</Checkbox>
      <Checkbox value="reference">Reference</Checkbox>
    </CheckboxGroup>
  );
}
