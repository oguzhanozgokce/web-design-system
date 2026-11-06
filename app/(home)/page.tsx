import { ArrowForwardIcon } from '@/registry/ds/lib/icons';
import { ButtonLink } from '@/registry/ds/ui/button';
import { Features } from '@/components/showcase/features';
import { ComponentGallery } from '@/components/showcase/gallery';
import { Hero } from '@/components/showcase/hero';
import { Reveal } from '@/components/showcase/reveal';
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
      <main className="flex flex-1 flex-col">
        <Hero componentCount={entries.length} />
        <Features installFiles={installFiles} />
        <section id="components" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-20">
          <Reveal className="mb-10 flex max-w-3xl flex-col gap-3">
            <p className="text-label-lg tracking-[0.12em] text-primary uppercase">The catalogue</p>
            <h2 className="text-headline-lg text-balance text-on-background sm:text-display-sm">
              Every component, ready to use.
            </h2>
            <p className="text-body-lg text-pretty text-on-surface-variant">
              Each card opens a page with live examples in light, dark and right-to-left, the full
              API and the install command.
            </p>
          </Reveal>
          <ComponentGallery entries={entries} categories={galleryCategories} />
        </section>
        <section className="mx-auto w-full max-w-6xl px-4 pb-24">
          <Reveal className="relative isolate overflow-clip rounded-xl border border-outline-variant bg-surface-container-low px-6 py-14 text-on-surface sm:px-12">
            <div
              aria-hidden
              className="absolute -inset-x-20 -top-24 -z-10 h-72 bg-[radial-gradient(50%_60%_at_80%_20%,color-mix(in_srgb,var(--primary)_12%,transparent),transparent)] blur-2xl"
            />
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="flex max-w-2xl flex-col gap-3">
                <h2 className="text-headline-lg text-balance">Make it yours in a minute.</h2>
                <p className="text-body-lg text-pretty text-on-surface-variant">
                  Pick a seed in the theme builder, copy the tokens, and install the first
                  component.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/theme" size="lg">
                  Open the theme builder
                </ButtonLink>
                <ButtonLink
                  href="/docs"
                  size="lg"
                  variant="outlined"
                  endIcon={<ArrowForwardIcon className="rtl:-scale-x-100" />}
                >
                  Read the docs
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </section>
        <footer className="border-t border-outline-variant">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-body-sm text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
            <p>
              Apache-2.0. Built on React Aria Components, Tailwind CSS and Material Color Utilities.
            </p>
            <a
              href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
              className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
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
