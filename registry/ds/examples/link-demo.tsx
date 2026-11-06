import { Link } from '@/registry/ds/ui/link';

export default function LinkDemo() {
  return (
    <p className="max-w-md text-body-lg text-on-surface">
      Payouts reach your bank two business days after a sale settles. You can{' '}
      <Link href="#usage">change the payout schedule</Link> at any time.
    </p>
  );
}
