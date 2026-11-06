import { Banner } from '@/registry/ds/ui/banner';

export default function BannerTones() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Banner
        tone="info"
        title="Invoices now sync every 15 minutes"
        description="Changes you make in your accounting app appear here without a manual refresh."
      />
      <Banner
        tone="success"
        title="Payout sent"
        description="The money reaches the account ending 0193 within one business day."
      />
      <Banner
        tone="warning"
        title="Your trial ends in 3 days"
        description="Add a payment method to keep your invoices, clients and reports."
      />
      <Banner
        tone="error"
        title="Payment for INV-2051 failed"
        description="The customer’s bank declined the card. We emailed them a new payment link."
      />
      <Banner
        tone="neutral"
        title="This workspace is read-only"
        description="An owner archived it on 2 November. Ask them to restore it to make changes."
      />
    </div>
  );
}
