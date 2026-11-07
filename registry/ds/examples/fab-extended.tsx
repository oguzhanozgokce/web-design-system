import { ChatIcon, CloudUploadIcon, EditIcon } from '@/registry/ds/lib/icons';
import { ExtendedFab } from '@/registry/ds/ui/fab';

export default function FabExtended() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <ExtendedFab icon={<EditIcon />}>Write</ExtendedFab>
      <ExtendedFab tone="neutral" icon={<ChatIcon />}>
        New chat
      </ExtendedFab>
      <ExtendedFab size="lg" icon={<CloudUploadIcon />}>
        Upload
      </ExtendedFab>
    </div>
  );
}
