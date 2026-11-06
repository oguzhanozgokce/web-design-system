import { Switch } from '@/registry/ds/ui/switch';

export default function SwitchDisabled() {
  return (
    <div className="flex flex-col gap-6">
      <Switch isDisabled>Allow guest checkout</Switch>
      <Switch isDisabled defaultSelected description="Managed by your organisation's policy.">
        Single sign-on
      </Switch>
    </div>
  );
}
