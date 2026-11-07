import { LockIcon, MailIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { OrDivider } from '@/registry/ds/ui/divider';

export default function DividerLabel() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Button variant="outline" startIcon={<LockIcon />} fullWidth>
        Sign in with a passkey
      </Button>
      <OrDivider />
      <Button startIcon={<MailIcon />} fullWidth>
        Email me a sign-in link
      </Button>
    </div>
  );
}
