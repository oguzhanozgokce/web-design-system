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
        <DisclosureTrigger description="Members sign in with email and password">
          Password sign-in
        </DisclosureTrigger>
        <DisclosurePanel>
          Passwords need at least 12 characters. Members are asked to change a password that appears
          in a known breach.
        </DisclosurePanel>
      </Disclosure>
      <Disclosure id="sso" isDisabled>
        <DisclosureTrigger description="Available on the Business plan">
          Single sign-on
        </DisclosureTrigger>
        <DisclosurePanel>
          Connect your identity provider with SAML or OpenID Connect.
        </DisclosurePanel>
      </Disclosure>
    </Accordion>
  );
}
