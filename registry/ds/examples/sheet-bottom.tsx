import { DownloadIcon, LinkIcon, MailIcon, ShareIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Sheet, SheetBody, SheetHeader, SheetTrigger } from '@/registry/ds/ui/sheet';

const actions = [
  { label: 'Copy link', icon: <LinkIcon /> },
  { label: 'Send by email', icon: <MailIcon /> },
  { label: 'Download', icon: <DownloadIcon /> },
];

export default function SheetBottom() {
  return (
    <SheetTrigger>
      <Button variant="tonal" startIcon={<ShareIcon />}>
        Share
      </Button>
      <Sheet side="bottom" size="sm">
        <SheetHeader title="Share photo" showCloseButton={false} />
        <SheetBody className="px-3">
          <ul className="flex flex-col">
            {actions.map((action) => (
              <li key={action.label}>
                <Button
                  slot="close"
                  variant="text"
                  size="lg"
                  fullWidth
                  startIcon={action.icon}
                  className="justify-start text-on-surface"
                >
                  {action.label}
                </Button>
              </li>
            ))}
          </ul>
        </SheetBody>
      </Sheet>
    </SheetTrigger>
  );
}
