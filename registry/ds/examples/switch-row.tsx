import { LockIcon, MailIcon, NotificationsIcon } from '@/registry/ds/lib/icons';
import { Switch } from '@/registry/ds/ui/switch';

export default function SwitchRow() {
  return (
    <div className="w-full max-w-xl rounded-lg bg-surface-container-low p-2">
      <Switch
        variant="row"
        icon={<NotificationsIcon />}
        description="A push notification when a payout fails or is delayed."
        defaultSelected
      >
        Payout alerts
      </Switch>
      <Switch
        variant="row"
        icon={<MailIcon />}
        description="A summary of last week's revenue, refunds and fees every Monday."
      >
        Weekly summary email
      </Switch>
      <Switch
        variant="row"
        icon={<LockIcon />}
        description="Sign out members after 30 minutes without activity."
        defaultSelected
      >
        Automatic sign-out
      </Switch>
    </div>
  );
}
