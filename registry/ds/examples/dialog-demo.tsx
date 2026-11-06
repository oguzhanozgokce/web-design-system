'use client';

import { useState } from 'react';
import { MailIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/registry/ds/ui/dialog';
import { TextField } from '@/registry/ds/ui/text-field';

export default function DialogDemo() {
  const [email, setEmail] = useState('');

  return (
    <DialogTrigger onOpenChange={(isOpen) => isOpen && setEmail('')}>
      <Button startIcon={<MailIcon />}>Invite teammate</Button>
      <Dialog>
        {({ close }) => (
          <>
            <DialogHeader
              title="Invite a teammate"
              description="They join the Finance workspace and see every ledger you share with them."
            />
            <DialogBody>
              <TextField
                type="email"
                label="Work email"
                placeholder="name@company.com"
                description="Invites expire after 7 days."
                value={email}
                onChange={setEmail}
                autoFocus
              />
            </DialogBody>
            <DialogFooter>
              <Button slot="close" variant="text">
                Cancel
              </Button>
              <Button
                isDisabled={!email.includes('@')}
                onPress={async () => {
                  await new Promise((resolve) => setTimeout(resolve, 1200));
                  close();
                }}
              >
                Send invite
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  );
}
