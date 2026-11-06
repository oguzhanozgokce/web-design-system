import { Switch } from '@/registry/ds/ui/switch';

export default function SwitchDisabled() {
  return (
    <div className="flex flex-col gap-6">
      <Switch isDisabled>Bluetooth</Switch>
      <Switch isDisabled defaultSelected description="Managed by your organisation.">
        Automatic updates
      </Switch>
    </div>
  );
}
