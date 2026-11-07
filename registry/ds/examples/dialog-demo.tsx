'use client';

import { useState } from 'react';
import { EditIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/registry/ds/ui/dialog';
import { TextField } from '@/registry/ds/ui/text-field';

const savedName = 'Alex Morgan';

export default function DialogDemo() {
  const [name, setName] = useState(savedName);

  return (
    <DialogTrigger onOpenChange={(isOpen) => isOpen && setName(savedName)}>
      <Button startIcon={<EditIcon />}>Edit profile</Button>
      <Dialog>
        {({ close }) => (
          <>
            <DialogHeader
              title="Edit profile"
              description="Your name appears on your profile and next to your comments."
            />
            <DialogBody>
              <TextField label="Name" value={name} onChange={setName} autoFocus />
            </DialogBody>
            <DialogFooter>
              <Button slot="close" variant="soft">
                Cancel
              </Button>
              <Button
                isDisabled={!name.trim()}
                onPress={async () => {
                  await new Promise((resolve) => setTimeout(resolve, 1200));
                  close();
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  );
}
