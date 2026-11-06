import { LockIcon, TuneIcon, UploadIcon } from '@/registry/ds/lib/icons';
import {
  Accordion,
  Disclosure,
  DisclosurePanel,
  DisclosureTrigger,
} from '@/registry/ds/ui/disclosure';

export default function DisclosureSeparated() {
  return (
    <Accordion variant="separated" className="w-full max-w-xl">
      <Disclosure id="bank">
        <DisclosureTrigger startIcon={<LockIcon />} description="About 5 minutes">
          Add your bank details
        </DisclosureTrigger>
        <DisclosurePanel>
          Enter the account that receives payouts. We send a test deposit of a few cents to confirm
          it, which you can check on your next statement.
        </DisclosurePanel>
      </Disclosure>
      <Disclosure id="import">
        <DisclosureTrigger startIcon={<UploadIcon />} description="CSV or Excel">
          Import your customers
        </DisclosureTrigger>
        <DisclosurePanel>
          Upload a file with one customer per row. Columns for name, email and VAT number are
          matched automatically; anything else can be mapped by hand.
        </DisclosurePanel>
      </Disclosure>
      <Disclosure id="tax">
        <DisclosureTrigger startIcon={<TuneIcon />} description="Required before invoicing">
          Set up tax rates
        </DisclosureTrigger>
        <DisclosurePanel>
          Add the rates you charge, such as 20% standard VAT, and choose which one new invoices use
          by default.
        </DisclosurePanel>
      </Disclosure>
    </Accordion>
  );
}
