import { AddIcon, CallIcon, ChatIcon, CloudUploadIcon } from '@/registry/ds/lib/icons';
import { Fab } from '@/registry/ds/ui/fab';

export default function FabColors() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <Fab color="primary" aria-label="Add" icon={<AddIcon />} />
      <Fab color="secondary" aria-label="Upload" icon={<CloudUploadIcon />} />
      <Fab color="tertiary" aria-label="Call" icon={<CallIcon />} />
      <Fab color="surface" aria-label="Message" icon={<ChatIcon />} />
    </div>
  );
}
