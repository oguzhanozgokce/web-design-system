import { Switch } from '@/registry/ds/ui/switch';

export default function SwitchDescription() {
  return (
    <Switch
      description="Members must confirm a code from their authenticator app when they sign in."
      className="max-w-sm"
    >
      Require two-factor sign-in
    </Switch>
  );
}
