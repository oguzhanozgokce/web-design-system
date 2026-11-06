import { ArrowForwardIcon, DownloadIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';

export default function ButtonIcons() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button variant="tonal" startIcon={<DownloadIcon />}>
        Download
      </Button>
      <Button endIcon={<ArrowForwardIcon className="rtl:-scale-x-100" />}>Continue</Button>
    </div>
  );
}
