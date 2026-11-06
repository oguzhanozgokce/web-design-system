import { CalendarIcon } from '@/registry/ds/lib/icons';
import { Banner } from '@/registry/ds/ui/banner';

export default function BannerIcon() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Banner
        tone="neutral"
        icon={<CalendarIcon />}
        title="Event moved to Friday"
        description="The team meeting now starts at 10:00 in the same room."
      />
      <Banner
        tone="info"
        variant="outlined"
        icon={null}
        description="Times are shown in your time zone. Change it in Settings → Language and region."
      />
    </div>
  );
}
