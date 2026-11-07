'use client';

import { useState } from 'react';
import { Label, TextArea, TextField } from 'react-aria-components';
import { Button } from '@/registry/ds/ui/button';
import { KbdCombo, toAriaKeyShortcuts } from '@/registry/ds/ui/kbd';

export default function KbdShortcutHint() {
  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState(0);

  function send() {
    if (!draft.trim()) return;
    setSent((count) => count + 1);
    setDraft('');
  }

  return (
    <form
      className="flex w-full max-w-md flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
    >
      <TextField value={draft} onChange={setDraft} className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-on-surface">Comment</Label>
        <TextArea
          rows={3}
          placeholder="Add a comment"
          aria-keyshortcuts={toAriaKeyShortcuts(['mod', 'enter'])}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
              event.preventDefault();
              send();
            }
          }}
          className="resize-none rounded-field border border-outline-variant bg-surface-raised px-3 py-2 text-base text-on-surface outline-none placeholder:text-on-surface-variant data-[focused]:border-primary data-[focused]:inset-ring-2 data-[focused]:inset-ring-primary/20 pointer-fine:text-sm"
        />
      </TextField>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-on-surface-variant">
          <KbdCombo keys={['mod', 'enter']} size="sm" /> to send
        </p>
        <Button type="submit" size="sm">
          Send
        </Button>
      </div>
      <p className="text-xs text-on-surface-variant" aria-live="polite">
        {sent === 0 ? null : sent === 1 ? '1 comment sent' : `${sent} comments sent`}
      </p>
    </form>
  );
}
