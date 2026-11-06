'use client';

import { useState } from 'react';
import { Form } from 'react-aria-components';
import { EditIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Sheet, SheetBody, SheetFooter, SheetHeader } from '@/registry/ds/ui/sheet';
import { TextField } from '@/registry/ds/ui/text-field';

export default function SheetControlled() {
  const [isOpen, setOpen] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [name, setName] = useState('Alex Morgan');

  return (
    <div className="flex items-center gap-3">
      <span className="text-title-md text-on-surface">{name}</span>
      <Button variant="text" size="sm" startIcon={<EditIcon />} onPress={() => setOpen(true)}>
        Edit name
      </Button>
      <Sheet
        isOpen={isOpen}
        onOpenChange={setOpen}
        isDismissable={!isSaving}
        isKeyboardDismissDisabled={isSaving}
        size="sm"
      >
        {({ close }) => (
          <Form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={async (event) => {
              event.preventDefault();
              const next = String(new FormData(event.currentTarget).get('name'));
              setSaving(true);
              await new Promise((resolve) => setTimeout(resolve, 800));
              setSaving(false);
              setName(next);
              close();
            }}
          >
            <SheetHeader
              title="Edit name"
              description="Shown on your profile and next to your comments."
              showCloseButton={!isSaving}
            />
            <SheetBody>
              <TextField label="Name" name="name" defaultValue={name} isRequired autoFocus />
            </SheetBody>
            <SheetFooter>
              <Button variant="text" onPress={close} isDisabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" isPending={isSaving}>
                Save
              </Button>
            </SheetFooter>
          </Form>
        )}
      </Sheet>
    </div>
  );
}
