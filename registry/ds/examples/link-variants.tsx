import { Link } from '@/registry/ds/ui/link';

export default function LinkVariants() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4 rounded-lg bg-surface-container-low p-5">
      <div className="flex flex-col gap-1">
        <p className="text-title-md text-on-surface">Notifications</p>
        <p className="text-body-md text-on-surface-variant">
          You have three unread messages. Choose what reaches your inbox in{' '}
          <Link href="#api">settings</Link>.
        </p>
      </div>
      <Link href="#examples" variant="standalone" showArrow className="self-start">
        View all notifications
      </Link>
    </div>
  );
}
