import { Disclosure, DisclosurePanel, DisclosureTrigger } from '@/registry/ds/ui/disclosure';

export default function DisclosureVariants() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <Disclosure variant="plain">
        <DisclosureTrigger>Advanced options</DisclosureTrigger>
        <DisclosurePanel>
          Include hidden files and keep the original folder structure in the download.
        </DisclosurePanel>
      </Disclosure>
      <Disclosure variant="surface">
        <DisclosureTrigger>System requirements</DisclosureTrigger>
        <DisclosurePanel>
          Any current desktop or mobile browser with JavaScript turned on, and a screen at least
          320px wide.
        </DisclosurePanel>
      </Disclosure>
    </div>
  );
}
