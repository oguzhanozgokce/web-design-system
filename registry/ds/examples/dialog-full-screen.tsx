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
  const [merchant, setMerchant] = useState('');

  return (
    <DialogTrigger onOpenChange={(isOpen) => isOpen && setMerchant('')}>
      <Button startIcon={<AddIcon />}>New expense</Button>
      <Dialog fullScreenOnMobile size="lg">
        {({ close }) => {
          const save = (
            <Button variant="text" isDisabled={!merchant.trim()} onPress={close}>
              Save
            </Button>
          );
          return (
            <>
              <DialogHeader
                title="New expense"
                description="Added to the Operating account ledger."
                action={save}
              />
              <DialogBody>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Merchant"
                    placeholder="Northwind Supplies"
                    value={merchant}
                    onChange={setMerchant}
                  />
                  <TextField label="Amount" placeholder="0.00" inputMode="decimal" />
                  <TextArea label="Note" minRows={3} className="sm:col-span-2" />
                </div>
              </DialogBody>
              <DialogFooter>
                <Button slot="close" variant="text">
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
