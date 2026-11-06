'use client';

import { TextField as AriaTextField } from 'react-aria-components';
import { useCopyToClipboard } from '@/registry/ds/hooks/use-copy-to-clipboard';
import { CheckIcon, CopyIcon, LinkIcon } from '@/registry/ds/lib/icons';
import {
  Field,
  FieldAdornment,
  FieldButton,
  FieldGroup,
  FieldInput,
  fieldStyles,
} from '@/registry/ds/ui/field';

const inviteLink = 'https://ledger.app/join/7f3k-q9xa';

export default function FieldComposition() {
  const { status, attempt, copy } = useCopyToClipboard();
  const announcement =
    status === 'copied' ? 'Link copied' : status === 'failed' ? 'Could not copy the link' : null;

  return (
    <AriaTextField
      value={inviteLink}
      isReadOnly
      className={fieldStyles().root({ className: 'w-full max-w-sm' })}
    >
      <Field label="Invite link" description="Anyone with this link can join as a viewer.">
        <FieldGroup isReadOnly dir="ltr">
          <FieldAdornment>
            <LinkIcon />
          </FieldAdornment>
          <FieldInput />
          <FieldButton aria-label="Copy link" onPress={() => copy(inviteLink)}>
            {status === 'copied' ? <CheckIcon /> : <CopyIcon />}
          </FieldButton>
        </FieldGroup>
      </Field>
      <span role="status" className="sr-only">
        {announcement ? <span key={attempt}>{announcement}</span> : null}
      </span>
    </AriaTextField>
  );
}
