import { Card, CardContent, CardHeader } from '@/registry/ds/ui/card';
import { Divider } from '@/registry/ds/ui/divider';

const paddings = [
  { padding: 'sm', description: '12px inside, 8px between parts.' },
  { padding: 'md', description: '16px inside, 12px between parts.' },
  { padding: 'lg', description: '24px inside, 16px between parts.' },
] as const;

const folders = [
  { name: 'Photos', size: '24.6 GB' },
  { name: 'Videos', size: '18.2 GB' },
  { name: 'Documents', size: '1.4 GB' },
];

export default function CardPadding() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      {paddings.map(({ padding, description }) => (
        <Card key={padding} variant="outlined" padding={padding}>
          <CardHeader title={`Padding ${padding}`} description={description} />
        </Card>
      ))}
      <Card variant="outlined" padding="none">
        <CardHeader title="Padding none" className="px-4 pt-4 pb-2" />
        <CardContent className="flex flex-col pb-2">
          {folders.map((folder, index) => (
            <div key={folder.name}>
              {index > 0 ? <Divider inset="middle" /> : null}
              <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                <span>{folder.name}</span>
                <span className="shrink-0 text-on-surface-variant tabular-digits">
                  {folder.size}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
