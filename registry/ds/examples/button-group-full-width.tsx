import { Button } from '@/registry/ds/ui/button';
import { ButtonGroup } from '@/registry/ds/ui/button-group';

export default function ButtonGroupFullWidth() {
  return (
    <div className="w-full max-w-sm rounded-lg bg-surface-container-low p-4 text-on-surface">
      <p className="text-title-sm">Unsaved changes to “Q3 payroll”</p>
      <p className="mt-1 mb-4 text-body-md text-on-surface-variant">
        Save them before you leave, or they will be lost.
      </p>
      <ButtonGroup aria-label="Unsaved changes" fullWidth>
        <Button variant="outlined">Discard</Button>
        <Button>Save changes</Button>
      </ButtonGroup>
    </div>
  );
}
