import { Switch } from '@/registry/ds/ui/switch';

export default function SwitchSizes() {
  return (
    <div className="flex flex-col gap-4">
      <Switch size="sm" defaultSelected>
        Small, for dense lists
      </Switch>
      <Switch defaultSelected>Medium, the default</Switch>
    </div>
  );
}
