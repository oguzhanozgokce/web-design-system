'use client';

import { useState } from 'react';
import { SearchIcon } from '@/registry/ds/lib/icons';
import { TextField } from '@/registry/ds/ui/text-field';

const payees = ['Lisbon apartment', 'Lisbon flights', 'Office rent', 'Team lunch', 'Cloud hosting'];

export default function TextFieldClearable() {
  const [query, setQuery] = useState('Lisbon');
  const matches = payees.filter((payee) => payee.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="grid w-full max-w-sm gap-3">
      <TextField
        label="Filter payees"
        value={query}
        onChange={setQuery}
        startAdornment={<SearchIcon />}
        isClearable
      />
      <ul className="grid gap-1 text-body-md text-on-surface-variant" aria-live="polite">
        {matches.map((payee) => (
          <li key={payee}>{payee}</li>
        ))}
      </ul>
    </div>
  );
}
