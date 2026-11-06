'use client';

import { useState } from 'react';
import { ComboBox } from '@/registry/ds/ui/combo-box';
import { ListBoxItem } from '@/registry/ds/ui/list-box';

const suggestions = ['Software', 'Office supplies', 'Travel', 'Meals', 'Hardware', 'Training'];

export default function ComboBoxCustomValue() {
  const [category, setCategory] = useState('');

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <ComboBox
        label="Expense category"
        placeholder="Pick or type a new one"
        allowsCustomValue
        inputValue={category}
        onInputChange={setCategory}
      >
        {suggestions.map((suggestion) => (
          <ListBoxItem key={suggestion} id={suggestion}>
            {suggestion}
          </ListBoxItem>
        ))}
      </ComboBox>
      <p className="text-body-sm text-on-surface-variant" aria-live="polite">
        {category ? `Filed under “${category}”.` : 'No category yet.'}
      </p>
    </div>
  );
}
