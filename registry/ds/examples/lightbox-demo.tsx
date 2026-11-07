'use client';

import { useState } from 'react';
import { Button } from '@/registry/ds/ui/button';
import { Lightbox, type LightboxItem } from '@/registry/ds/ui/lightbox';

const photos: LightboxItem[] = [
  {
    id: 'lagoon',
    src: '/samples/lagoon.jpg',
    alt: 'An abstract lagoon in soft blue and green',
    title: 'Lagoon',
    description: 'A study in colour, light and quiet space.',
  },
  {
    id: 'dusk',
    src: '/samples/dusk.jpg',
    alt: 'An abstract scene in violet and warm pink',
    title: 'Dusk',
  },
  { id: 'moss', src: '/samples/moss.jpg', alt: 'A soft green abstract landscape', title: 'Moss' },
  {
    id: 'dune',
    src: '/samples/dune.jpg',
    alt: 'A warm abstract scene in sand tones',
    title: 'Dune',
  },
];

export default function LightboxDemo() {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <Button onPress={() => setOpen(true)}>Open photo gallery</Button>
      <Lightbox items={photos} isOpen={isOpen} onOpenChange={setOpen} />
    </>
  );
}
