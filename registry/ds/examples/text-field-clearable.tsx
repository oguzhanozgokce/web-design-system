'use client';

import { useState } from 'react';
import { SearchIcon } from '@/registry/ds/lib/icons';
import { TextField } from '@/registry/ds/ui/text-field';

const files = [
  'beach-photo.jpg',
  'city-photo.jpg',
  'meeting-notes.txt',
  'project-plan.pdf',
  'intro-video.mp4',
];

export default function TextFieldClearable() {
  const [query, setQuery] = useState('photo');
  const matches = files.filter((file) => file.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="grid w-full max-w-sm gap-3">
      <TextField
        label="Filter files"
        value={query}
        onChange={setQuery}
        startAdornment={<SearchIcon />}
        isClearable
      />
      <ul className="grid gap-1 text-body-md text-on-surface-variant" aria-live="polite">
        {matches.map((file) => (
          <li key={file}>{file}</li>
        ))}
      </ul>
    </div>
  );
}
