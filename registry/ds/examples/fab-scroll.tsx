'use client';

import { useRef, useState } from 'react';
import { AddIcon } from '@/registry/ds/lib/icons';
import { ExtendedFab } from '@/registry/ds/ui/fab';

const contacts = [
  { name: 'Amara Okafor', email: 'amara@example.com' },
  { name: 'Kenji Sato', email: 'kenji@example.com' },
  { name: 'Lucía Fernández', email: 'lucia@example.com' },
  { name: 'Noah Fischer', email: 'noah@example.com' },
  { name: 'Priya Nair', email: 'priya@example.com' },
  { name: 'Omar Haddad', email: 'omar@example.com' },
  { name: 'Emma Wilson', email: 'emma@example.com' },
  { name: 'Mateus Costa', email: 'mateus@example.com' },
  { name: 'Hana Kim', email: 'hana@example.com' },
  { name: 'Liam Murphy', email: 'liam@example.com' },
];

export default function FabScroll() {
  const [isExtended, setExtended] = useState(true);
  const lastScrollTop = useRef(0);

  return (
    <div className="relative w-full max-w-sm overflow-hidden rounded-container border border-outline-subtle bg-surface-raised">
      <div
        role="region"
        aria-label="Contacts"
        tabIndex={0}
        className="h-80 overflow-y-auto focus-ring-inset"
        onScroll={(event) => {
          const top = event.currentTarget.scrollTop;
          if (Math.abs(top - lastScrollTop.current) < 8) return;
          setExtended(top < lastScrollTop.current || top < 8);
          lastScrollTop.current = top;
        }}
      >
        <ul className="divide-y divide-outline-subtle pb-24">
          {contacts.map((contact) => (
            <li key={contact.email} className="px-4 py-3">
              <p className="truncate text-sm font-medium text-on-surface">{contact.name}</p>
              <p className="truncate text-xs text-on-surface-variant">{contact.email}</p>
            </li>
          ))}
        </ul>
      </div>
      <ExtendedFab
        icon={<AddIcon />}
        isExtended={isExtended}
        className="absolute inset-e-4 bottom-4"
      >
        New contact
      </ExtendedFab>
    </div>
  );
}
