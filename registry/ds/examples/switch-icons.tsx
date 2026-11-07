import { CheckIcon, CloseIcon, DarkModeIcon, LightModeIcon } from '@/registry/ds/lib/icons';
import { Switch } from '@/registry/ds/ui/switch';

export default function SwitchIcons() {
  return (
    <div className="flex flex-col gap-6">
      <Switch defaultSelected selectedIcon={<CheckIcon />}>
        Notifications
      </Switch>
      <Switch selectedIcon={<CheckIcon />} unselectedIcon={<CloseIcon />}>
        Location
      </Switch>
      <Switch selectedIcon={<DarkModeIcon />} unselectedIcon={<LightModeIcon />}>
        Dark mode
      </Switch>
    </div>
  );
}
