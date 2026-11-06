import { Disclosure, DisclosurePanel, DisclosureTrigger } from '@/registry/ds/ui/disclosure';

export default function DisclosureSizes() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <Disclosure size="sm">
        <DisclosureTrigger description="3 items">Order ORD-10482</DisclosureTrigger>
        <DisclosurePanel>
          Linen shirt (M) × 1, canvas tote × 2, gift wrap × 1. Shipped with tracked delivery.
        </DisclosurePanel>
      </Disclosure>
      <Disclosure size="md">
        <DisclosureTrigger description="Arrives Thursday">Shipping details</DisclosureTrigger>
        <DisclosurePanel>
          Tracked delivery to 14 Harbour Street, Leeds. The courier leaves parcels with a neighbour
          if nobody is home.
        </DisclosurePanel>
      </Disclosure>
      <Disclosure size="lg">
        <DisclosureTrigger>How do refunds work?</DisclosureTrigger>
        <DisclosurePanel>
          Return any item within 30 days. The refund goes back to the original payment method within
          five business days of the return arriving.
        </DisclosurePanel>
      </Disclosure>
    </div>
  );
}
