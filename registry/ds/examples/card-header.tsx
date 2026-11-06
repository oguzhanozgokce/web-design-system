import { HomeIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Card, CardContent, CardHeader } from '@/registry/ds/ui/card';

export default function CardHeaderExample() {
  return (
    <Card variant="outlined" className="w-full max-w-md">
      <CardHeader
        leading={
          <span className="grid size-10 place-items-center rounded-full bg-secondary-container text-on-secondary-container">
            <HomeIcon className="size-5" />
          </span>
        }
        title="Operating account"
        description="Garanti BBVA •••• 4821 · synced 5 minutes ago"
        action={
          <Button variant="tonal" size="sm">
            Manage
          </Button>
        }
      />
      <CardContent className="text-on-surface-variant">
        Incoming payments land here first. Payroll and vendor payouts are drawn from this account.
      </CardContent>
    </Card>
  );
}
