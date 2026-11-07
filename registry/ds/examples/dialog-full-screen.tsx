'use client';

import { useState } from 'react';
import { AddIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/registry/ds/ui/dialog';
import { TextArea } from '@/registry/ds/ui/text-area';
import { TextField } from '@/registry/ds/ui/text-field';

export default function DialogFullScreen() {
  const [title, setTitle] = useState('');

  return (
    <DialogTrigger onOpenChange={(isOpen) => isOpen && setTitle('')}>
      <Button startIcon={<AddIcon />}>New event</Button>
      <Dialog fullScreenOnMobile size="lg">
        {({ close }) => {
          const save = (
            <Button isDisabled={!title.trim()} onPress={close}>
              Save
            </Button>
          );
          return (
            <>
              <DialogHeader
                title="New event"
                description="It is added to your calendar."
                action={save}
              />
              <DialogBody>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField label="Title" value={title} onChange={setTitle} />
                  <TextField label="Location" />
                  <TextArea label="Notes" minRows={3} className="sm:col-span-2" />
                </div>
              </DialogBody>
              <DialogFooter>
                <Button slot="close" variant="soft">
                  Cancel
                </Button>
                {save}
              </DialogFooter>
            </>
          );
        }}
      </Dialog>
    </DialogTrigger>
  );
}
