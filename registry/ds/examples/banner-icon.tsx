import { CalendarIcon } from '@/registry/ds/lib/icons';
import { Banner } from '@/registry/ds/ui/banner';

export default function BannerIcon() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Banner
        tone="neutral"
        icon={<CalendarIcon />}
        title="Support is closed on 29 October"
        description="Replies to tickets opened that day start on 30 October at 09:00."
      />
      <Banner
        tone="info"
        variant="outlined"
        icon={null}
        description="Amounts are shown in your workspace currency. Change it in Settings → Billing."
      />
    </div>
  );
}
