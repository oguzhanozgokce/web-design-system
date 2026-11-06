import { Card, CardHeader } from '@/registry/ds/ui/card';

const variants = [
  {
    variant: 'elevated',
    title: 'Elevated',
    description: 'surface-container-low with a shadow. Lifts off busy or patterned backgrounds.',
  },
  {
    variant: 'filled',
    title: 'Filled',
    description: 'surface-container-highest. The default, for grouped content on a plain page.',
  },
  {
    variant: 'outlined',
    title: 'Outlined',
    description: 'surface with an outline-variant border. Calm enough for dense dashboards.',
  },
] as const;

export default function CardVariants() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {variants.map((item) => (
        <Card key={item.variant} variant={item.variant}>
          <CardHeader title={item.title} description={item.description} />
        </Card>
      ))}
    </div>
  );
}
