'use client';

import { useState } from 'react';
import { Form } from 'react-aria-components';
import { EditIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Popover, PopoverDialog, PopoverTrigger } from '@/registry/ds/ui/popover';
import { TextField } from '@/registry/ds/ui/text-field';

export default function PopoverForm() {
  const [name, setName] = useState('Operating account');
  const [isSaving, setSaving] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <span className="text-title-md text-on-surface">{name}</span>
      <PopoverTrigger>
        <Button variant="text" size="sm" startIcon={<EditIcon />}>
          Rename
        </Button>
        <Popover placement="bottom start">
          <PopoverDialog title="Rename ledger" className="w-80">
            {({ close }) => (
              <Form
                className="flex flex-col gap-4 pt-2"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const next = String(new FormData(event.currentTarget).get('name'));
                  setSaving(true);
                  await new Promise((resolve) => setTimeout(resolve, 600));
                  setSaving(false);
                  setName(next);
                  close();
                }}
              >
                <TextField
                  name="name"
                  label="Ledger name"
                  defaultValue={name}
                  isRequired
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button variant="text" onPress={close}>
                    Cancel
                  </Button>
                  <Button type="submit" isPending={isSaving}>
                    Save
                  </Button>
                </div>
              </Form>
            )}
          </PopoverDialog>
        </Popover>
      </PopoverTrigger>
    </div>
  );
}
