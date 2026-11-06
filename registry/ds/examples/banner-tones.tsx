import { Banner } from '@/registry/ds/ui/banner';

export default function BannerTones() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Banner
        tone="info"
        title="Update available"
        description="A new version is ready. It installs the next time you restart the app."
      />
      <Banner
        tone="success"
        title="Changes saved"
        description="Your profile is up to date on every device."
      />
      <Banner
        tone="warning"
        title="Connection is unstable"
        description="Changes are kept on this device and sync when you are back online."
      />
      <Banner
        tone="error"
        title="Something went wrong"
        description="We could not save your changes. Try again in a moment."
      />
      <Banner
        tone="neutral"
        title="This folder is read-only"
        description="Ask the owner for edit access to make changes."
      />
    </div>
  );
}
