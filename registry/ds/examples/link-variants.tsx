import { Link } from '@/registry/ds/ui/link';

export default function LinkVariants() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4 rounded-container border border-outline-subtle bg-surface-raised p-5">
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-on-surface">Notifications</p>
        <p className="text-sm text-on-surface-variant">
          You have three unread messages. Choose what reaches your inbox in{' '}
          <Link href="#api">settings</Link>.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <Link href="#examples" variant="standalone" showArrow>
          View all notifications
        </Link>
        <Link href="#accessibility" variant="standalone" tone="primary">
          Mark all as read
        </Link>
      </div>
    </div>
  );
}
