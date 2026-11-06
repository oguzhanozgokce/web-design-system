import { Switch } from '@/registry/ds/ui/switch';

export default function SwitchLabelPlacement() {
  return (
    <div className="flex flex-col gap-6">
      <Switch defaultSelected>Wi-Fi</Switch>
      <Switch labelPlacement="start" defaultSelected>
        Bluetooth
      </Switch>
    </div>
  );
}
