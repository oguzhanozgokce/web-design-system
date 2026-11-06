'use client';

import { useState } from 'react';
import { TextField } from '@/registry/ds/ui/text-field';

function toSlug(title: string) {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function TextFieldControlled() {
  const [title, setTitle] = useState('Crème brûlée');

  return (
    <div className="grid w-full max-w-sm gap-2">
      <TextField label="Page title" value={title} onChange={setTitle} />
      <p className="text-body-sm text-on-surface-variant">
        The page lives at{' '}
        <span className="text-on-surface">example.com/{toSlug(title) || '…'}</span>
      </p>
    </div>
  );
}
