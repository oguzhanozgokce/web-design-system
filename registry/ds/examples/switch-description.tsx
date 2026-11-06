import { Switch } from '@/registry/ds/ui/switch';

export default function SwitchDescription() {
  return (
    <Switch
      description="Ask for a code from your authenticator app each time you sign in."
      className="max-w-sm"
    >
      Two-step verification
    </Switch>
  );
}
