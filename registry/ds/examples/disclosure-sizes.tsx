import { Disclosure, DisclosurePanel, DisclosureTrigger } from '@/registry/ds/ui/disclosure';

export default function DisclosureSizes() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <Disclosure size="sm">
        <DisclosureTrigger description="2.4 MB">File details</DisclosureTrigger>
        <DisclosurePanel>Created on 3 March. Last edited yesterday by you.</DisclosurePanel>
      </Disclosure>
      <Disclosure size="md">
        <DisclosureTrigger description="Shared with 3 people">Sharing</DisclosureTrigger>
        <DisclosurePanel>
          Anyone with the link can view. Only you and the people you invite can edit.
        </DisclosurePanel>
      </Disclosure>
      <Disclosure size="lg">
        <DisclosureTrigger>How do I change my email address?</DisclosureTrigger>
        <DisclosurePanel>
          Go to Settings, then Account. We send a confirmation link to the new address, and the
          change applies once you open it.
        </DisclosurePanel>
      </Disclosure>
    </div>
  );
}
