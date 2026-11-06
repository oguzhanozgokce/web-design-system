import { CloseIcon, DarkModeIcon, LightModeIcon } from '@/registry/ds/lib/icons';
import { Switch } from '@/registry/ds/ui/switch';

export default function SwitchIcons() {
  return (
    <div className="flex flex-col gap-6">
      <Switch defaultSelected>Email receipts</Switch>
      <Switch defaultSelected unselectedIcon={<CloseIcon />}>
        Public profile
      </Switch>
      <Switch selectedIcon={<DarkModeIcon />} unselectedIcon={<LightModeIcon />}>
        Dark theme
      </Switch>
      <Switch defaultSelected selectedIcon={null}>
        Compact tables
      </Switch>
    </div>
  );
}
