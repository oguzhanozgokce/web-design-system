import {
  Accordion,
  Disclosure,
  DisclosurePanel,
  DisclosureTrigger,
} from '@/registry/ds/ui/disclosure';

export default function DisclosureDemo() {
  return (
    <Accordion className="w-full max-w-xl" defaultExpandedKeys={['schedule']}>
      <Disclosure id="schedule">
        <DisclosureTrigger>When are payouts sent?</DisclosureTrigger>
        <DisclosurePanel>
          Payouts leave every Monday at 09:00 in your workspace time zone and usually arrive within
          two business days.
        </DisclosurePanel>
      </Disclosure>
      <Disclosure id="fees">
        <DisclosureTrigger>Which fees are deducted?</DisclosureTrigger>
        <DisclosurePanel>
          Card processing fees and refunds issued since the last payout are deducted before the
          transfer. Each deduction is its own line in the payout ledger.
        </DisclosurePanel>
      </Disclosure>
      <Disclosure id="failed">
        <DisclosureTrigger>What happens when a payout fails?</DisclosureTrigger>
        <DisclosurePanel>
          We retry on the next business day and email the workspace owners. After a second failure
          the balance stays in your account until the bank details are updated.
        </DisclosurePanel>
      </Disclosure>
    </Accordion>
  );
}
