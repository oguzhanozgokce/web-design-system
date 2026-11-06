import { Link } from '@/registry/ds/ui/link';

export default function LinkArrow() {
  return (
    <ul className="flex flex-col items-start gap-3">
      <li>
        <Link href="#api" variant="standalone" showArrow>
          Manage billing
        </Link>
      </li>
      <li>
        <Link href="#accessibility" variant="standalone" showArrow>
          See all transactions
        </Link>
      </li>
      <li>
        <Link href="#usage" variant="standalone">
          Download receipts
        </Link>
      </li>
    </ul>
  );
}
