import { Banner } from '@/registry/ds/ui/banner';

export default function BannerVariants() {
  return (
    <div className="grid w-full max-w-3xl gap-3 sm:grid-cols-2">
      <Banner
        variant="tonal"
        tone="success"
        title="Export ready"
        description="orders-october.csv has 1,284 rows."
      />
      <Banner
        variant="outlined"
        tone="success"
        title="Export ready"
        description="orders-october.csv has 1,284 rows."
      />
      <Banner
        variant="tonal"
        tone="error"
        title="Webhook failing"
        description="The last 12 deliveries to your endpoint returned 500."
      />
      <Banner
        variant="outlined"
        tone="error"
        title="Webhook failing"
        description="The last 12 deliveries to your endpoint returned 500."
      />
    </div>
  );
}
