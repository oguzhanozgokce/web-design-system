import { Card, CardContent, CardHeader } from '@/registry/ds/ui/card';
import { Divider } from '@/registry/ds/ui/divider';

const transactions = [
  { name: 'Figma subscription', amount: '−45.00 USD' },
  { name: 'Client payment, Atlas Studio', amount: '+2,400.00 USD' },
  { name: 'AWS invoice', amount: '−312.18 USD' },
];

export default function CardPadding() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      {(['sm', 'md', 'lg'] as const).map((padding) => (
        <Card key={padding} variant="outlined" padding={padding}>
          <CardHeader
            title={`Padding ${padding}`}
            description="Payouts settle in 2 business days."
          />
        </Card>
      ))}
      <Card variant="outlined" padding="none">
        <CardHeader title="Padding none" className="px-4 pt-4 pb-2" />
        <CardContent className="flex flex-col pb-2">
          {transactions.map((transaction, index) => (
            <div key={transaction.name}>
              {index > 0 ? <Divider inset="middle" /> : null}
              <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                <span>{transaction.name}</span>
                <span className="shrink-0 text-on-surface-variant tabular-digits">
                  {transaction.amount}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
