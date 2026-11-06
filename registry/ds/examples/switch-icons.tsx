import { CloseIcon, DarkModeIcon, LightModeIcon } from '@/registry/ds/lib/icons';
import { Switch } from '@/registry/ds/ui/switch';

export default function SwitchIcons() {
  return (
    <div className="flex flex-col gap-6">
      <Switch defaultSelected>Notifications</Switch>
      <Switch defaultSelected unselectedIcon={<CloseIcon />}>
        Location
      </Switch>
      <Switch selectedIcon={<DarkModeIcon />} unselectedIcon={<LightModeIcon />}>
        Dark mode
      </Switch>
      <Switch defaultSelected selectedIcon={null}>
        Compact view
      </Switch>
    </div>
  );
}
