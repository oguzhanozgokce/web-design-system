import { Sparkline } from '@/registry/ds/ui/sparkline';

const rising = [12, 14, 13, 17, 16, 19, 22, 21, 25, 27];
const falling = [30, 29, 31, 27, 26, 24, 25, 21, 20, 18];

export default function SparklineVariants() {
  return (
    <div className="grid w-full max-w-md grid-cols-2 gap-x-6 gap-y-4 text-sm text-on-surface-variant">
      <span>Line</span>
      <Sparkline aria-label="Sign-ups, last 10 days" data={rising} />
      <span>Area</span>
      <Sparkline aria-label="Sign-ups, last 10 days" data={rising} variant="area" />
      <span>Success</span>
      <Sparkline aria-label="Uptime, last 10 days" data={rising} variant="area" color="success" />
      <span>Error</span>
      <Sparkline aria-label="Free storage, last 10 days" data={falling} color="error" />
      <span>Linear, no end dot</span>
      <Sparkline
        aria-label="Sign-ups, last 10 days"
        data={rising}
        curve="linear"
        showEndDot={false}
      />
    </div>
  );
}
