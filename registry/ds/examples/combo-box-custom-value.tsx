'use client';

import { useState } from 'react';
import { ComboBox } from '@/registry/ds/ui/combo-box';
import { ListBoxItem } from '@/registry/ds/ui/list-box';

const suggestions = ['Work', 'Personal', 'Ideas', 'Travel', 'Health', 'Reading'];

export default function ComboBoxCustomValue() {
  const [tag, setTag] = useState('');

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <ComboBox
        label="Tag"
        placeholder="Pick or type a new one"
        allowsCustomValue
        inputValue={tag}
        onInputChange={setTag}
      >
        {suggestions.map((suggestion) => (
          <ListBoxItem key={suggestion} id={suggestion}>
            {suggestion}
          </ListBoxItem>
        ))}
      </ComboBox>
      <p className="text-body-sm text-on-surface-variant" aria-live="polite">
        {tag ? `Tagged “${tag}”.` : 'No tag yet.'}
      </p>
    </div>
  );
}
