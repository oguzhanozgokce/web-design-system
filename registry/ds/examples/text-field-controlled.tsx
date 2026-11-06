'use client';

import { useState } from 'react';
import { TextField } from '@/registry/ds/ui/text-field';

function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function TextFieldControlled() {
  const [name, setName] = useState('Northwind Café');

  return (
    <div className="grid w-full max-w-sm gap-2">
      <TextField label="Workspace name" value={name} onChange={setName} />
      <p className="text-body-sm text-on-surface-variant">
        Your workspace lives at{' '}
        <span className="text-on-surface">ledger.app/{toSlug(name) || '…'}</span>
      </p>
    </div>
  );
}
