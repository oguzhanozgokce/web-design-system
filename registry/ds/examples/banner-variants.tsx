import { Banner } from '@/registry/ds/ui/banner';

export default function BannerVariants() {
  return (
    <div className="grid w-full max-w-3xl gap-3 sm:grid-cols-2">
      <Banner
        variant="soft"
        tone="success"
        title="File uploaded"
        description="report.pdf is ready to share."
      />
      <Banner
        variant="surface"
        tone="success"
        title="File uploaded"
        description="report.pdf is ready to share."
      />
      <Banner
        variant="soft"
        tone="error"
        title="Upload failed"
        description="photo.jpg is larger than the 20 MB limit."
      />
      <Banner
        variant="surface"
        tone="error"
        title="Upload failed"
        description="photo.jpg is larger than the 20 MB limit."
      />
    </div>
  );
}
