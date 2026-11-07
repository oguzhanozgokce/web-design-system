import { LockIcon } from '@/registry/ds/lib/icons';
import { ButtonLink } from '@/registry/ds/ui/button';
import { ContentState } from '@/registry/ds/ui/content-state';
import { EmptyState } from '@/registry/ds/ui/empty-state';

class HttpError extends Error {
  constructor(readonly status: number) {
    super(`HTTP ${status}`);
  }
}

export default function ContentStateError() {
  return (
    <div className="grid w-full gap-3 md:grid-cols-2">
      <ContentState
        error={new HttpError(503)}
        headingLevel={3}
        errorTitle={(error) =>
          error instanceof HttpError && error.status === 503
            ? 'Down for maintenance'
            : 'This page is unavailable'
        }
        errorDescription="This usually takes a few minutes. The page updates by itself."
        className="rounded-container border border-outline-subtle bg-surface-raised"
      />
      <ContentState
        error={new HttpError(403)}
        headingLevel={3}
        errorContent={(error) => (
          <EmptyState
            headingLevel={3}
            icon={<LockIcon />}
            title="You don’t have access"
            description={
              error instanceof HttpError && error.status === 403
                ? 'Ask the owner to share this page with you.'
                : 'Ask the owner for access.'
            }
            primaryAction={<ButtonLink href="#accessibility">Request access</ButtonLink>}
          />
        )}
        className="rounded-container border border-outline-subtle bg-surface-raised"
      />
    </div>
  );
}
