import { AddIcon, EditIcon } from '@/registry/ds/lib/icons';
import { ExtendedFab } from '@/registry/ds/ui/fab';

export default function FabExtended() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <ExtendedFab icon={<EditIcon />}>Compose</ExtendedFab>
      <ExtendedFab color="surface" icon={<AddIcon />}>
        New invoice
      </ExtendedFab>
      <ExtendedFab size="lg" color="tertiary" icon={<AddIcon />}>
        Create budget
      </ExtendedFab>
    </div>
  );
}
