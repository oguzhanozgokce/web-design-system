import { Card, CardHeader } from '@/registry/ds/ui/card';

const variants = [
  {
    variant: 'outline',
    title: 'Outline',
    description:
      'A raised surface with a hairline border. The default, calm enough for dense pages.',
  },
  {
    variant: 'elevated',
    title: 'Elevated',
    description: 'A raised surface with a soft shadow. Lifts off busy or patterned backgrounds.',
  },
  {
    variant: 'soft',
    title: 'Soft',
    description: 'A translucent neutral fill. Groups content inside another card or a panel.',
  },
  {
    variant: 'transparent',
    title: 'Transparent',
    description: 'No fill and no border. Keeps the card layout for content that sits on the page.',
  },
] as const;

export default function CardVariants() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      {variants.map((item) => (
        <Card key={item.variant} variant={item.variant}>
          <CardHeader title={item.title} description={item.description} />
        </Card>
      ))}
    </div>
  );
}
