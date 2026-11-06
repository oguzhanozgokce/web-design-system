import { LockIcon, NotificationsIcon } from '@/registry/ds/lib/icons';
import { Disclosure, DisclosurePanel, DisclosureTrigger } from '@/registry/ds/ui/disclosure';

export default function DisclosureIcons() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Disclosure>
        <DisclosureTrigger
          startIcon={<NotificationsIcon />}
          description="Email, push and the weekly summary"
        >
          Notifications
        </DisclosureTrigger>
        <DisclosurePanel>
          Choose which updates reach you and how. The weekly summary goes out on Monday mornings.
        </DisclosurePanel>
      </Disclosure>
      <Disclosure>
        <DisclosureTrigger
          startIcon={<LockIcon />}
          description="Two-step sign-in and active sessions"
        >
          Security
        </DisclosureTrigger>
        <DisclosurePanel>
          Two-step sign-in is on. You are signed in on three devices.
        </DisclosurePanel>
      </Disclosure>
    </div>
  );
}
