import { Switch } from '@/registry/ds/ui/switch';

export default function SwitchLabelPlacement() {
  return (
    <div className="flex flex-col gap-6">
      <Switch defaultSelected>Show cents in totals</Switch>
      <Switch labelPlacement="start" defaultSelected>
        Round to whole units
      </Switch>
    </div>
  );
}
