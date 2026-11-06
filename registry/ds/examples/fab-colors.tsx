import { AddIcon, CallIcon, ChatIcon, CloudUploadIcon } from '@/registry/ds/lib/icons';
import { Fab } from '@/registry/ds/ui/fab';

export default function FabColors() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <Fab color="primary" aria-label="New invoice" icon={<AddIcon />} />
      <Fab color="secondary" aria-label="Upload receipts" icon={<CloudUploadIcon />} />
      <Fab color="tertiary" aria-label="Start a call" icon={<CallIcon />} />
      <Fab color="surface" aria-label="Message support" icon={<ChatIcon />} />
    </div>
  );
}
