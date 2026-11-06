import { GroupIcon, LockIcon, NotificationsIcon } from '@/registry/ds/lib/icons';
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
          description="Payout alerts and the weekly summary"
        >
          Notifications
        </DisclosureTrigger>
        <DisclosurePanel className="space-y-0 px-2 pb-2">
          <Switch variant="row" defaultSelected>
            Payout alerts
          </Switch>
          <Switch variant="row">Weekly summary email</Switch>
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
      <Disclosure id="team">
        <DisclosureTrigger
          level={2}
          startIcon={<GroupIcon />}
          description="Who can approve invoices and payouts"
        >
          Team access
        </DisclosureTrigger>
        <DisclosurePanel className="space-y-0 px-2 pb-2">
          <Switch variant="row">Members can approve invoices</Switch>
          <Switch variant="row" defaultSelected>
            Only owners can change bank details
          </Switch>
        </DisclosurePanel>
      </Disclosure>
    </Accordion>
  );
}
