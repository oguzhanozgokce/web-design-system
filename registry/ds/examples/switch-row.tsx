import { LockIcon, MailIcon, NotificationsIcon } from '@/registry/ds/lib/icons';
import { Switch } from '@/registry/ds/ui/switch';

export default function SwitchRow() {
  return (
    <div className="w-full max-w-xl rounded-lg bg-surface-container-low p-2">
      <Switch
        variant="row"
        icon={<NotificationsIcon />}
        description="Alerts for messages and mentions."
        defaultSelected
      >
        Notifications
      </Switch>
      <Switch variant="row" icon={<MailIcon />} description="A short recap every Monday.">
        Email summary
      </Switch>
      <Switch
        variant="row"
        icon={<LockIcon />}
        description="Lock after 5 minutes away."
        defaultSelected
      >
        App lock
      </Switch>
    </div>
  );
}
