import { Banner } from '@/registry/ds/ui/banner';
import { Button } from '@/registry/ds/ui/button';

export default function BannerDemo() {
  return (
    <Banner
      tone="warning"
      title="Card ending 4242 expires on 30 November"
      description="Update your payment method before the next invoice is charged on 1 December."
      actions={
        <>
          <Button>Update card</Button>
          <Button>Remind me later</Button>
        </>
      }
      className="max-w-xl"
    />
  );
}
