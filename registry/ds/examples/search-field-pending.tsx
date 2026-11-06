'use client';

import { useEffect, useState } from 'react';
import { SearchField } from '@/registry/ds/ui/search-field';

const members = [
  'Dana Whitfield',
  'Daniel Okafor',
  'Priya Raman',
  'Mateo Alvarez',
  'Sofia Lindqvist',
  'Yusuf Demir',
];

export default function SearchFieldPending() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(members);
  const [isPending, setPending] = useState(false);

  function search(next: string) {
    setQuery(next);
    setPending(true);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const needle = query.trim().toLowerCase();
      setResults(members.filter((member) => member.toLowerCase().includes(needle)));
      setPending(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="grid w-full max-w-sm gap-3">
      <SearchField
        label="Members"
        placeholder="Search by name"
        value={query}
        onChange={search}
        isPending={isPending}
      />
      <p className="text-body-sm text-on-surface-variant" aria-live="polite">
        {results.length === 1 ? '1 member' : `${results.length} members`}
      </p>
      <ul className="grid gap-1 text-body-md text-on-surface">
        {results.map((member) => (
          <li key={member}>{member}</li>
        ))}
      </ul>
    </div>
  );
}
