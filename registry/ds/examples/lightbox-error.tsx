'use client';

import { useState } from 'react';
import { Button } from '@/registry/ds/ui/button';
import { Lightbox } from '@/registry/ds/ui/lightbox';

export default function LightboxError() {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <Button variant="soft" onPress={() => setOpen(true)}>
        Open unavailable image
      </Button>
      <Lightbox
        isOpen={isOpen}
        onOpenChange={setOpen}
        items={[
          {
            id: 'unavailable',
            src: '/samples/unavailable.jpg',
            alt: 'An unavailable photo',
            title: 'Unavailable photo',
          },
        ]}
      />
    </>
  );
}
