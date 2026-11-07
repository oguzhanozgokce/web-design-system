import { ArrowForwardIcon } from '@/registry/ds/lib/icons';
import { ButtonLink } from '@/registry/ds/ui/button';
import { Features } from '@/components/showcase/features';
import { ComponentGallery } from '@/components/showcase/gallery';
import { Hero } from '@/components/showcase/hero';
import { Reveal } from '@/components/showcase/reveal';
import { SectionHeading } from '@/components/showcase/section-heading';
import { ShowcaseProvider } from '@/components/showcase/showcase-provider';
import { galleryCategories, getGalleryEntries, getInstallFiles } from '@/lib/gallery';
import { gitConfig } from '@/lib/shared';

export default async function HomePage() {
  const [entries, installFiles] = await Promise.all([
    getGalleryEntries(),
    getInstallFiles('button'),
  ]);

  return (
    <ShowcaseProvider>
      <main className="flex flex-1 flex-col bg-canvas text-on-surface">
        <Hero componentCount={entries.length} />
        <Features installFiles={installFiles} />
        <section
          id="components"
          className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-14 sm:py-16"
        >
          <SectionHeading
            eyebrow="The catalogue"
            title="Every component, ready to use."
            body="Each card opens a page with live examples in light, dark and right-to-left, the full API and the install command."
            className="mb-10"
          />
          <ComponentGallery entries={entries} categories={galleryCategories} />
        </section>
        <section className="mx-auto w-full max-w-6xl px-4 pt-6 pb-20 sm:pb-24">
          <Reveal className="relative isolate overflow-clip rounded-dialog border border-outline-subtle bg-surface-raised px-6 py-12 shadow-xs sm:px-12 sm:py-14">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-[radial-gradient(color-mix(in_srgb,var(--on-surface)_9%,transparent)_1px,transparent_1px)] mask-[radial-gradient(70%_90%_at_100%_0%,var(--on-surface),transparent)] bg-size-[18px_18px]"
            />
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="flex max-w-2xl flex-col gap-3">
                <h2 className="text-3xl font-semibold tracking-tight text-balance">
                  Make it yours in a minute.
                </h2>
                <p className="text-base text-pretty text-on-surface-variant sm:text-lg">
                  Pick a seed in the theme builder, copy the tokens, and install the first
                  component.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <ButtonLink href="/theme" size="lg">
                  Open the theme builder
                </ButtonLink>
                <ButtonLink
                  href="/docs"
                  size="lg"
                  variant="outline"
                  endIcon={<ArrowForwardIcon className="rtl:-scale-x-100" />}
                >
                  Read the docs
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </section>
        <footer className="border-t border-outline-subtle">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
            <p>Apache-2.0. Built on React Aria Components and Tailwind CSS.</p>
            <a
              href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
              className="inline-flex w-fit items-center gap-1 rounded-sm font-medium text-on-surface underline-offset-4 focus-ring hover:underline"
            >
              Source on GitHub
              <ArrowForwardIcon className="rtl:-scale-x-100" />
            </a>
          </div>
        </footer>
      </main>
    </ShowcaseProvider>
  );
}
