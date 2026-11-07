'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { AlertDialog } from '@/registry/ds/ui/alert-dialog';
import { Button } from '@/registry/ds/ui/button';

const initialMembers = [
  { id: 'ayse', name: 'Ayşe Demir', role: 'Admin' },
  { id: 'jonas', name: 'Jonas Weber', role: 'Editor' },
  { id: 'mei', name: 'Mei Tanaka', role: 'Viewer' },
];

export default function AlertDialogControlled() {
  const [members, setMembers] = useState(initialMembers);
  const [pending, setPending] = useState(initialMembers[0]);
  const [isOpen, setOpen] = useState(false);
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusHeadingOnClose = useRef(false);

  useEffect(() => {
    if (isOpen || !focusHeadingOnClose.current) return;
    focusHeadingOnClose.current = false;
    headingRef.current?.focus();
  }, [isOpen]);

  return (
    <section
      aria-labelledby={headingId}
      className="flex w-full max-w-md flex-col gap-2 text-on-surface"
    >
      <h3
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className="rounded-item px-1 text-sm font-semibold text-on-surface-variant focus-ring"
      >
        Members
      </h3>
      <ul className="divide-y divide-outline-subtle rounded-container border border-outline-subtle bg-surface-raised px-4">
        {members.map((member) => (
          <li key={member.id} className="flex items-center justify-between gap-3 py-2">
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-base">{member.name}</span>
              <span className="text-xs text-on-surface-variant">{member.role}</span>
            </span>
            <Button
              variant="ghost"
              tone="error"
              size="sm"
              aria-label={`Remove ${member.name}`}
              onPress={() => {
                setPending(member);
                setOpen(true);
              }}
            >
              Remove
            </Button>
          </li>
        ))}
        {members.length === 0 ? (
          <li className="py-3 text-sm text-on-surface-variant">No members left.</li>
        ) : null}
      </ul>
      <AlertDialog
        isOpen={isOpen}
        onOpenChange={setOpen}
        tone="error"
        title={`Remove ${pending.name}?`}
        description="They lose access to everything shared with this team. You can invite them again later."
        confirmLabel="Remove"
        onConfirm={async () => {
          await new Promise((resolve) => setTimeout(resolve, 800));
          setMembers((current) => current.filter((member) => member.id !== pending.id));
          focusHeadingOnClose.current = true;
        }}
      />
    </section>
  );
}
