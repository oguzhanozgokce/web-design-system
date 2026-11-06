import { HelpIcon, MailIcon, OpenInNewIcon } from '@/registry/ds/lib/icons';
import { IconButtonLink } from '@/registry/ds/ui/icon-button';

export default function IconButtonLinkExample() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <IconButtonLink href="#accessibility" aria-label="Help centre" icon={<HelpIcon />} />
      <IconButtonLink
        href="mailto:billing@example.com"
        variant="tonal"
        aria-label="Email billing"
        icon={<MailIcon />}
      />
      <IconButtonLink
        href="https://m3.material.io/components/icon-buttons"
        target="_blank"
        rel="noreferrer"
        variant="outlined"
        aria-label="Material 3 icon button spec, opens in a new tab"
        icon={<OpenInNewIcon />}
      />
    </div>
  );
}
