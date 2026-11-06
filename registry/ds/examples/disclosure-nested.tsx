import { LockIcon } from '@/registry/ds/lib/icons';
import { Disclosure, DisclosurePanel, DisclosureTrigger } from '@/registry/ds/ui/disclosure';

export default function DisclosureNested() {
  return (
    <Disclosure className="w-full max-w-xl" defaultExpanded>
      <DisclosureTrigger startIcon={<LockIcon />} description="Two-step sign-in and session length">
        Security
      </DisclosureTrigger>
      <DisclosurePanel>
        <p>Two-step sign-in is required for owners and recommended for everyone else.</p>
        <Disclosure variant="plain" size="sm" className="-mx-3">
          <DisclosureTrigger level={4}>Advanced</DisclosureTrigger>
          <DisclosurePanel>
            Restrict sign-in to the office IP range 192.0.2.0/24 and shorten sessions to 15 minutes
            for members with payout access.
          </DisclosurePanel>
        </Disclosure>
      </DisclosurePanel>
    </Disclosure>
  );
}
