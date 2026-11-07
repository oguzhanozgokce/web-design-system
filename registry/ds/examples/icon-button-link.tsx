import { HelpIcon, MailIcon, OpenInNewIcon } from '@/registry/ds/lib/icons';
import { IconButtonLink } from '@/registry/ds/ui/icon-button';

export default function IconButtonLinkExample() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <IconButtonLink href="#accessibility" aria-label="Help" icon={<HelpIcon />} />
      <IconButtonLink
        href="mailto:hello@example.com"
        variant="soft"
        aria-label="Send email"
        icon={<MailIcon />}
      />
      <IconButtonLink
        href="https://example.com/help"
        target="_blank"
        rel="noreferrer"
        variant="outline"
        aria-label="Help centre, opens in a new tab"
        icon={<OpenInNewIcon />}
      />
    </div>
  );
}
