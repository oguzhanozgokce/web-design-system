import { LockIcon } from '@/registry/ds/lib/icons';
import { Disclosure, DisclosurePanel, DisclosureTrigger } from '@/registry/ds/ui/disclosure';

export default function DisclosureNested() {
  return (
    <Disclosure className="w-full max-w-xl" defaultExpanded>
      <DisclosureTrigger startIcon={<LockIcon />} description="Two-step sign-in and session length">
        Security
      </DisclosureTrigger>
      <DisclosurePanel>
        <p>Two-step sign-in asks for a code from your phone when you sign in on a new device.</p>
        <Disclosure variant="plain" size="sm" className="-mx-3">
          <DisclosureTrigger level={4}>Advanced</DisclosureTrigger>
          <DisclosurePanel>
            Sign out automatically after 15 minutes without activity, or sign out of every other
            device at once.
          </DisclosurePanel>
        </Disclosure>
      </DisclosurePanel>
    </Disclosure>
  );
}
