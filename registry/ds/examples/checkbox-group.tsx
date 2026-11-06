import { Checkbox, CheckboxGroup } from '@/registry/ds/ui/checkbox';

export default function CheckboxGroupExample() {
  return (
    <CheckboxGroup
      label="Weekly digest"
      description="Sent every Monday at 9:00 in your workspace time zone."
      defaultValue={['payouts', 'invoices']}
    >
      <Checkbox value="payouts">Payouts</Checkbox>
      <Checkbox value="invoices">Paid invoices</Checkbox>
      <Checkbox value="refunds">Refunds and disputes</Checkbox>
      <Checkbox value="members">New team members</Checkbox>
    </CheckboxGroup>
  );
}
