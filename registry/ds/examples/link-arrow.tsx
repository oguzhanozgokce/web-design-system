import { Link } from '@/registry/ds/ui/link';

export default function LinkArrow() {
  return (
    <ul className="flex flex-col items-start gap-3">
      <li>
        <Link href="#api" variant="standalone" showArrow>
          Account settings
        </Link>
      </li>
      <li>
        <Link href="#accessibility" variant="standalone" showArrow>
          See all photos
        </Link>
      </li>
      <li>
        <Link href="#usage" variant="standalone">
          Download files
        </Link>
      </li>
    </ul>
  );
}
