import {
  Accordion,
  Disclosure,
  DisclosurePanel,
  DisclosureTrigger,
} from '@/registry/ds/ui/disclosure';

export default function DisclosureDemo() {
  return (
    <Accordion className="w-full max-w-xl" defaultExpandedKeys={['password']}>
      <Disclosure id="password">
        <DisclosureTrigger>How do I reset my password?</DisclosureTrigger>
        <DisclosurePanel>
          Select Forgot password on the sign-in page and we will email you a link. The link works
          for one hour.
        </DisclosurePanel>
      </Disclosure>
      <Disclosure id="username">
        <DisclosureTrigger>Can I change my username?</DisclosureTrigger>
        <DisclosurePanel>
          Yes, in Settings under Profile. Your old username stays reserved for 14 days in case you
          change your mind.
        </DisclosurePanel>
      </Disclosure>
      <Disclosure id="delete">
        <DisclosureTrigger>How do I delete my account?</DisclosureTrigger>
        <DisclosurePanel>
          Go to Settings, then Account, and select Delete account. Your data is removed for good
          after 30 days.
        </DisclosurePanel>
      </Disclosure>
    </Accordion>
  );
}
