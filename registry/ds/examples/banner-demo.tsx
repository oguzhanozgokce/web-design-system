import { Banner } from '@/registry/ds/ui/banner';
import { Button } from '@/registry/ds/ui/button';

export default function BannerDemo() {
  return (
    <Banner
      tone="warning"
      title="Storage almost full"
      description="You have used 9.2 GB of your 10 GB. Delete files you no longer need to keep syncing."
      actions={
        <>
          <Button>Manage storage</Button>
          <Button>Remind me later</Button>
        </>
      }
      className="max-w-xl"
    />
  );
}
