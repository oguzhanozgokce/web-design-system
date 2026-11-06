import { LockIcon, NotificationsIcon } from '@/registry/ds/lib/icons';
import { Disclosure, DisclosurePanel, DisclosureTrigger } from '@/registry/ds/ui/disclosure';

export default function DisclosureIcons() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Disclosure>
        <DisclosureTrigger
          startIcon={<NotificationsIcon />}
          description="Payout alerts and the weekly summary"
        >
          Notifications
        </DisclosureTrigger>
        <DisclosurePanel>
          Alerts go to every workspace owner. The weekly summary is sent on Monday mornings.
        </DisclosurePanel>
      </Disclosure>
      <Disclosure>
        <DisclosureTrigger
          startIcon={<LockIcon />}
          description="Two-step sign-in and session length"
        >
          Security
        </DisclosureTrigger>
        <DisclosurePanel>
          Two-step sign-in is required for owners. Members are signed out after 30 minutes without
          activity.
        </DisclosurePanel>
      </Disclosure>
    </div>
  );
}
