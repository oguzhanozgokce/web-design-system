import { LockIcon, NotificationsIcon, VisibilityIcon } from '@/registry/ds/lib/icons';
import {
  Accordion,
  Disclosure,
  DisclosurePanel,
  DisclosureTrigger,
} from '@/registry/ds/ui/disclosure';
import { Switch } from '@/registry/ds/ui/switch';

export default function DisclosureSettings() {
  return (
    <Accordion
      allowsMultipleExpanded
      defaultExpandedKeys={['notifications']}
      className="w-full max-w-xl"
    >
      <Disclosure id="notifications">
        <DisclosureTrigger
          level={2}
          startIcon={<NotificationsIcon />}
          description="Push, email and the weekly summary"
        >
          Notifications
        </DisclosureTrigger>
        <DisclosurePanel className="space-y-0 px-2 pb-2">
          <Switch variant="row" defaultSelected>
            Push notifications
          </Switch>
          <Switch variant="row">Weekly summary email</Switch>
        </DisclosurePanel>
      </Disclosure>
      <Disclosure id="privacy">
        <DisclosureTrigger
          level={2}
          startIcon={<VisibilityIcon />}
          description="Who can see your profile and activity"
        >
          Privacy
        </DisclosureTrigger>
        <DisclosurePanel className="space-y-0 px-2 pb-2">
          <Switch variant="row" defaultSelected>
            Show my profile in search
          </Switch>
          <Switch variant="row">Show when I am online</Switch>
        </DisclosurePanel>
      </Disclosure>
      <Disclosure id="security">
        <DisclosureTrigger
          level={2}
          startIcon={<LockIcon />}
          description="Two-step sign-in and session length"
        >
          Security
        </DisclosureTrigger>
        <DisclosurePanel className="space-y-0 px-2 pb-2">
          <Switch variant="row" defaultSelected>
            Require two-step sign-in
          </Switch>
          <Switch variant="row" defaultSelected>
            Sign out after 30 minutes idle
          </Switch>
        </DisclosurePanel>
      </Disclosure>
    </Accordion>
  );
}
