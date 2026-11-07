import { VisuallyHidden } from 'react-aria-components';
import { OpenInNewIcon } from '@/registry/ds/lib/icons';
import { ButtonLink } from '@/registry/ds/ui/button';

export default function ButtonLinkExample() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <ButtonLink href="#installation" variant="outline">
        Read the guide
      </ButtonLink>
      <ButtonLink
        href="https://example.com/help"
        target="_blank"
        rel="noreferrer"
        variant="ghost"
        endIcon={<OpenInNewIcon />}
      >
        Help centre
        <VisuallyHidden elementType="span"> (opens in a new tab)</VisuallyHidden>
      </ButtonLink>
    </div>
  );
}
