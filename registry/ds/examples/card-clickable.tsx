import { ArrowForwardIcon, DescriptionIcon } from '@/registry/ds/lib/icons';
import { CardContent, CardHeader, ClickableCard } from '@/registry/ds/ui/card';

const reports = [
  { slug: 'q3-revenue', title: 'Q3 revenue', updated: 'Updated 2 hours ago', total: '128,400 USD' },
  { slug: 'payroll', title: 'Payroll summary', updated: 'Updated yesterday', total: '86,250 USD' },
  { slug: 'vendors', title: 'Vendor spend', updated: 'Updated 3 days ago', total: '41,780 USD' },
];

export default function CardClickable() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {reports.map((report) => (
        <ClickableCard key={report.slug} href={`#${report.slug}`} variant="outlined">
          <CardHeader
            leading={<DescriptionIcon className="size-6 text-primary" />}
            title={report.title}
            description={report.updated}
          />
          <CardContent className="mt-auto flex items-center justify-between gap-2">
            <span className="text-title-md tabular-digits">{report.total}</span>
            <ArrowForwardIcon className="size-5 text-on-surface-variant rtl:-scale-x-100" />
          </CardContent>
        </ClickableCard>
      ))}
    </div>
  );
}
