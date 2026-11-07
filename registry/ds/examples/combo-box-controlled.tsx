'use client';

import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { ComboBox } from '@/registry/ds/ui/combo-box';
import { ListBoxItem } from '@/registry/ds/ui/list-box';

const colours = [
  { id: 'red', name: 'Red' },
  { id: 'green', name: 'Green' },
  { id: 'blue', name: 'Blue' },
  { id: 'yellow', name: 'Yellow' },
];

export default function ComboBoxControlled() {
  const [colour, setColour] = useState<Key | null>('blue');
  const chosen = colours.find((item) => item.id === colour);

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <ComboBox label="Colour" defaultItems={colours} value={colour} onChange={setColour}>
        {(item) => <ListBoxItem>{item.name}</ListBoxItem>}
      </ComboBox>
      <p className="text-sm text-on-surface-variant" aria-live="polite">
        {chosen ? `Selected: ${chosen.name}.` : 'Nothing selected.'}
      </p>
    </div>
  );
}
