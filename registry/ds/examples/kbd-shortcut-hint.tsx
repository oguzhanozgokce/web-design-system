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
        <Label className="text-label-lg text-on-surface">Comment</Label>
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
          className="resize-none rounded-sm border border-outline bg-transparent px-3 py-2 text-body-md text-on-surface ring-primary outline-none placeholder:text-on-surface-variant data-[focused]:border-primary data-[focused]:ring-1 data-[focused]:ring-inset"
        />
      </TextField>
      <div className="flex items-center justify-between gap-3">
        <p className="text-body-sm text-on-surface-variant">
          <KbdCombo keys={['mod', 'enter']} size="sm" /> to send
        </p>
        <Button type="submit" size="sm">
          Send
        </Button>
      </div>
      <p className="text-body-sm text-on-surface-variant" aria-live="polite">
        {sent === 0 ? null : sent === 1 ? '1 comment sent' : `${sent} comments sent`}
      </p>
    </form>
  );
}
