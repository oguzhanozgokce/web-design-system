import { BarChartIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardMedia } from '@/registry/ds/ui/card';

export default function CardMediaExample() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <Card variant="elevated">
        <CardMedia
          src="https://picsum.photos/seed/lisbon-offsite/800/450"
          alt=""
          className="aspect-video"
        />
        <CardHeader title="Lisbon offsite" description="12–14 March · 18 people going" />
        <CardFooter>
          <Button variant="text">Itinerary</Button>
          <Button variant="tonal">Book travel</Button>
        </CardFooter>
      </Card>
      <Card variant="outlined">
        <CardMedia inset>
          <span className="grid aspect-video place-items-center bg-tertiary-container text-on-tertiary-container">
            <BarChartIcon className="size-12" />
          </span>
        </CardMedia>
        <CardHeader title="Monthly cash flow" description="Generated on the 1st of every month" />
        <CardContent className="text-on-surface-variant">
          Inflows, outflows and runway for every ledger in the workspace.
        </CardContent>
      </Card>
    </div>
  );
}
