import { CopyIcon, DownloadIcon, MailIcon, ShareIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Sheet, SheetBody, SheetHeader, SheetTrigger } from '@/registry/ds/ui/sheet';

const actions = [
  { label: 'Copy payment link', icon: <CopyIcon /> },
  { label: 'Email to Northwind Traders', icon: <MailIcon /> },
  { label: 'Download PDF', icon: <DownloadIcon /> },
];

export default function SheetBottom() {
  return (
    <SheetTrigger>
      <Button variant="tonal" startIcon={<ShareIcon />}>
        Share invoice
      </Button>
      <Sheet side="bottom" size="sm">
        <SheetHeader title="Share INV-2048" showCloseButton={false} />
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
