'use client';

import { useCopyToClipboard } from '@/registry/ds/hooks/use-copy-to-clipboard';
import { Button } from '@/registry/ds/ui/button';
import { useIcons } from '@/registry/ds/ui/ds-provider';

export default function CopyButtonHook() {
  const icons = useIcons();
  const { status, copy } = useCopyToClipboard();

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant="ghost"
        startIcon={<icons.link />}
        onPress={() => {
          copy(window.location.href);
        }}
      >
        Copy page link
      </Button>
      <p role="status" className="min-h-4 text-xs text-on-surface-variant">
        {status === 'copied' ? 'Link copied. Paste it into a message or email.' : null}
        {status === 'failed' ? 'Your browser blocked the clipboard.' : null}
      </p>
    </div>
  );
}
