'use client';

import { useState } from 'react';
import { SearchField } from '@/registry/ds/ui/search-field';

const topics = ['Getting started', 'Installation', 'Themes', 'Dark mode', 'Typography', 'Icons'];

export default function SearchFieldSubmit() {
  const [result, setResult] = useState('Type a topic, then press Enter.');

  async function search(query: string) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const needle = query.trim().toLowerCase();
    const matches = needle ? topics.filter((topic) => topic.toLowerCase().includes(needle)) : [];
    setResult(matches.length > 0 ? `Found ${matches.join(', ')}.` : `Nothing matches “${query}”.`);
  }

  return (
    <div className="grid w-full max-w-sm gap-3">
      <SearchField label="Documentation" placeholder="Search topics" onSubmit={search} />
      <p className="text-body-md text-on-surface-variant" aria-live="polite">
        {result}
      </p>
    </div>
  );
}
