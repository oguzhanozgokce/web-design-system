import { Disclosure, DisclosurePanel, DisclosureTrigger } from '@/registry/ds/ui/disclosure';

export default function DisclosureVariants() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <Disclosure variant="plain">
        <DisclosureTrigger>Advanced export options</DisclosureTrigger>
        <DisclosurePanel>
          Exports use a comma delimiter, ISO 8601 dates and the workspace currency. Change them in
          Settings, then Data.
        </DisclosurePanel>
      </Disclosure>
      <Disclosure variant="outlined">
        <DisclosureTrigger>Billing address</DisclosureTrigger>
        <DisclosurePanel>
          Northwind Supplies Ltd, 14 Harbour Street, Leeds LS1 4DY, United Kingdom. VAT number GB
          284 1937 06.
        </DisclosurePanel>
      </Disclosure>
      <Disclosure variant="filled">
        <DisclosureTrigger>Payment terms</DisclosureTrigger>
        <DisclosurePanel>
          Invoices are due 30 days after issue. A reminder goes out 3 days before the due date and
          again on the day it becomes overdue.
        </DisclosurePanel>
      </Disclosure>
    </div>
  );
}
