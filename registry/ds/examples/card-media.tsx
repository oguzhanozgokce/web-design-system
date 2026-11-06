import { BarChartIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardMedia } from '@/registry/ds/ui/card';

export default function CardMediaExample() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <Card variant="elevated">
        <CardMedia src="/samples/dune.jpg" alt="" className="aspect-video" />
        <CardHeader title="Landscape photography basics" description="Article · 6 min read" />
        <CardFooter>
          <Button variant="text">Save</Button>
          <Button variant="tonal">Read</Button>
        </CardFooter>
      </Card>
      <Card variant="outlined">
        <CardMedia inset>
          <span className="grid aspect-video place-items-center bg-tertiary-container text-on-tertiary-container">
            <BarChartIcon className="size-12" />
          </span>
        </CardMedia>
        <CardHeader title="Weekly summary" description="Sent every Monday morning" />
        <CardContent className="text-on-surface-variant">
          A short recap of what changed last week, with the busiest days first.
        </CardContent>
      </Card>
    </div>
  );
}
