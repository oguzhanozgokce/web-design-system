import { KeyboardReturnIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Dialog, DialogBody, DialogHeader, DialogTrigger } from '@/registry/ds/ui/dialog';
import { KbdCombo } from '@/registry/ds/ui/kbd';

const shortcuts = [
  { keys: ['N'], action: 'New file' },
  { keys: ['mod', 'K'], action: 'Search' },
  { keys: ['mod', 'S'], action: 'Save' },
  { keys: ['shift', 'E'], action: 'Export' },
  { keys: ['?'], action: 'Show this list' },
];

export default function DialogCloseButton() {
  return (
    <DialogTrigger>
      <Button variant="outlined" startIcon={<KeyboardReturnIcon />}>
        Keyboard shortcuts
      </Button>
      <Dialog size="sm">
        <DialogHeader title="Keyboard shortcuts" showCloseButton />
        <DialogBody>
          <dl className="flex flex-col">
            {shortcuts.map((shortcut) => (
              <div key={shortcut.action} className="flex items-center justify-between gap-4 py-2">
                <dt className="text-body-md text-on-surface">{shortcut.action}</dt>
                <dd>
                  <KbdCombo keys={shortcut.keys} />
                </dd>
              </div>
            ))}
          </dl>
        </DialogBody>
      </Dialog>
    </DialogTrigger>
  );
}
