import {
  Accordion,
  Disclosure,
  DisclosurePanel,
  DisclosureTrigger,
} from '@/registry/ds/ui/disclosure';

export default function DisclosureDisabled() {
  return (
    <Accordion className="w-full max-w-xl">
      <Disclosure id="password">
        <DisclosureTrigger description="Last changed 3 months ago">Password</DisclosureTrigger>
        <DisclosurePanel>
          Use at least 12 characters. We ask you to change a password that appears in a known data
          breach.
        </DisclosurePanel>
      </Disclosure>
      <Disclosure id="passkeys" isDisabled>
        <DisclosureTrigger description="Not supported on this device">Passkeys</DisclosureTrigger>
        <DisclosurePanel>
          Sign in with your fingerprint, face or screen lock instead of a password.
        </DisclosurePanel>
      </Disclosure>
    </Accordion>
  );
}
