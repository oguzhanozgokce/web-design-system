'use client';

import { useState } from 'react';
import { ArchiveIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Toaster, toast } from '@/registry/ds/ui/toast';

interface Conversation {
  id: string;
  subject: string;
  from: string;
}

const allConversations: Conversation[] = [
  { id: 'weekly', subject: 'Weekly update', from: 'Alex Morgan' },
  { id: 'review', subject: 'Design review notes', from: 'Jonas Weber' },
  { id: 'trip', subject: 'Trip photos', from: 'Priya Natarajan' },
];

export default function ToastUndo() {
  const [conversations, setConversations] = useState(allConversations);

  function archive(conversation: Conversation) {
    setConversations((current) => current.filter((item) => item.id !== conversation.id));
    toast('Conversation archived', {
      toasterId: 'toast-undo',
      action: {
        label: 'Undo',
        onAction: () =>
          setConversations((current) =>
            allConversations.filter(
              (item) => item.id === conversation.id || current.some((kept) => kept.id === item.id),
            ),
          ),
      },
    });
  }

  return (
    <div className="w-full max-w-sm">
      {conversations.length ? (
        <ul className="divide-y divide-outline-subtle rounded-container border border-outline-subtle bg-surface-raised text-on-surface">
          {conversations.map((conversation) => (
            <li key={conversation.id} className="flex items-center gap-3 py-2 ps-4 pe-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{conversation.subject}</p>
                <p className="text-xs text-on-surface-variant">{conversation.from}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                startIcon={<ArchiveIcon />}
                aria-label={`Archive ${conversation.subject}`}
                onPress={() => archive(conversation)}
              >
                Archive
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-container border border-outline-subtle bg-surface-raised p-4 text-center text-sm text-on-surface-variant">
          Every conversation is archived.
        </p>
      )}
      <Toaster toasterId="toast-undo" />
    </div>
  );
}
