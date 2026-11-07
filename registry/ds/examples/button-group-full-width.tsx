import { Button } from '@/registry/ds/ui/button';
import { ButtonGroup } from '@/registry/ds/ui/button-group';

export default function ButtonGroupFullWidth() {
  return (
    <div className="w-full max-w-sm rounded-container border border-outline-subtle bg-surface-raised p-4 text-on-surface">
      <p className="text-sm font-semibold">You have unsaved changes</p>
      <p className="mt-1 mb-4 text-sm text-on-surface-variant">
        Save them before you leave, or they will be lost.
      </p>
      <ButtonGroup aria-label="Unsaved changes" variant="detached" fullWidth>
        <Button variant="outline">Discard</Button>
        <Button>Save changes</Button>
      </ButtonGroup>
    </div>
  );
}
