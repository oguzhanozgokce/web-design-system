'use client';

import { useEffect, useRef, useState } from 'react';
import { SearchIcon } from '@/registry/ds/lib/icons';
import { ComboBox } from '@/registry/ds/ui/combo-box';
import { ListBoxItem } from '@/registry/ds/ui/list-box';

interface Person {
  id: string;
  name: string;
  email: string;
}

const directory: Person[] = [
  { id: 'amara', name: 'Amara Okafor', email: 'amara@example.com' },
  { id: 'fatima', name: 'Fatima Zahra', email: 'fatima@example.com' },
  { id: 'hiroshi', name: 'Hiroshi Tanaka', email: 'hiroshi@example.com' },
  { id: 'lars', name: 'Lars Nilsson', email: 'lars@example.com' },
  { id: 'mateo', name: 'Mateo García', email: 'mateo@example.com' },
  { id: 'priya', name: 'Priya Sharma', email: 'priya@example.com' },
  { id: 'sofia', name: 'Sofia Rossi', email: 'sofia@example.com' },
];

function searchPeople(query: string, signal: AbortSignal) {
  return new Promise<Person[]>((resolve, reject) => {
    const timer = setTimeout(() => {
      const needle = query.trim().toLocaleLowerCase();
      resolve(
        directory.filter(
          (person) =>
            person.name.toLocaleLowerCase().includes(needle) || person.email.includes(needle),
        ),
      );
    }, 700);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
}

export default function ComboBoxAsync() {
  const [query, setQuery] = useState('');
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setLoading] = useState(true);
  const latest = useRef<AbortController | null>(null);

  useEffect(() => {
    latest.current?.abort();
    const controller = new AbortController();
    latest.current = controller;
    searchPeople(query, controller.signal).then(
      (results) => {
        setPeople(results);
        setLoading(false);
      },
      () => undefined,
    );
    return () => controller.abort();
  }, [query]);

  return (
    <ComboBox
      label="Invite"
      placeholder="Search people"
      items={people}
      isLoading={isLoading}
      onInputChange={(value) => {
        setLoading(true);
        setQuery(value);
      }}
      startAdornment={<SearchIcon />}
      className="w-full max-w-xs"
    >
      {(person) => (
        <ListBoxItem textValue={person.name} description={person.email}>
          {person.name}
        </ListBoxItem>
      )}
    </ComboBox>
  );
}
