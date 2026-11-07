import Link from 'next/link';
import { ArrowForwardIcon } from '@/registry/ds/lib/icons';
import { ButtonLink } from '@/registry/ds/ui/button';
import { CopyButton } from '@/registry/ds/ui/copy-button';
import { BrandMark } from '@/components/brand-mark';
import { Features } from '@/components/showcase/features';
import { ComponentGallery } from '@/components/showcase/gallery';
import { Hero } from '@/components/showcase/hero';
import { SectionHeading } from '@/components/showcase/section-heading';
import { ShowcaseProvider } from '@/components/showcase/showcase-provider';
import { galleryCategories, getGalleryEntries, getInstallFiles } from '@/lib/gallery';
import { appName, gitConfig } from '@/lib/shared';

const command = 'npx shadcn@4.23.0 add @ds/button';

export default async function HomePage() {
  const [entries, installFiles] = await Promise.all([
    getGalleryEntries(),
    getInstallFiles('button'),
  ]);

  return (
    <ShowcaseProvider>
      <div className="flex flex-1 flex-col bg-canvas text-on-surface">
        <Hero componentCount={entries.length} />
        <Features />
        <section
          id="components"
          aria-label="Component catalogue"
          className="home-width scroll-mt-20 border-t border-outline-subtle py-14 sm:py-20"
        >
          <SectionHeading
            eyebrow="02 / THE COLLECTION"
            title={
              <>
                Small parts.
                <br />
                Endless possibilities.
              </>
            }
            body="Find your next building block. Every component comes with live examples, a complete API and the source to make it yours."
            className="mb-10 sm:mb-12"
          />
          <ComponentGallery entries={entries} categories={galleryCategories} />
        </section>
        <section
          aria-labelledby="start-building-title"
          className="mt-4 border-y border-outline-subtle bg-surface-raised"
        >
          <div className="home-width grid gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="mb-6 font-mono text-xs tracking-wide text-on-surface-variant">
                03 / MAKE SOMETHING YOURS
              </p>
              <h2
                id="start-building-title"
                className="text-5xl leading-[1.05] font-medium tracking-[-0.045em] sm:text-6xl"
              >
                Your next idea.
                <br />
                <span className="text-on-surface-variant">A good place to start.</span>
              </h2>
              <p className="mt-6 max-w-sm text-base leading-relaxed text-on-surface-variant">
                Start with a colour. Pick a component. Take it somewhere we haven’t thought of.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink
                  href="/theme"
                  endIcon={<ArrowForwardIcon className="rtl:-scale-x-100" />}
                >
                  Create your theme
                </ButtonLink>
                <ButtonLink href="/docs/foundations/installation" variant="outline">
                  Installation guide
                </ButtonLink>
              </div>
            </div>
            <div className="min-w-0 self-center overflow-clip rounded-overlay border border-outline-subtle bg-canvas">
              <div className="flex items-center justify-between border-b border-outline-subtle px-5 py-3 text-xs text-on-surface-variant">
                <span className="font-mono">TERMINAL</span>
                <span>Your project, your source</span>
              </div>
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-2">
                  <span aria-hidden className="pt-2 font-mono text-sm text-on-surface-variant">
                    $
                  </span>
                  <code className="min-w-0 flex-1 pt-2 font-mono text-sm leading-relaxed wrap-anywhere">
                    {command}
                  </code>
                  <CopyButton value={command} size="sm" aria-label="Copy install command" />
                </div>
                <div className="my-6 border-s border-outline-subtle ps-4">
                  <p className="mb-3 text-xs text-on-surface-variant">Added to your project</p>
                  <ul className="space-y-2 font-mono text-xs text-on-surface">
                    {installFiles.slice(0, 3).map((file) => (
                      <li key={file} className="wrap-anywhere">
                        {file}
                      </li>
                    ))}
                  </ul>
                  <details className="mt-3 text-xs text-on-surface-variant">
                    <summary className="w-fit cursor-pointer rounded-sm underline-offset-4 focus-ring hover:underline">
                      {installFiles.length - 3} supporting files
                    </summary>
                    <ul className="mt-3 space-y-2 font-mono">
                      {installFiles.slice(3).map((file) => (
                        <li key={file} className="wrap-anywhere">
                          {file}
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
                <p className="border-t border-outline-subtle pt-4 text-xs leading-relaxed text-on-surface-variant">
                  Configure the{' '}
                  <Link
                    href="/docs/foundations/installation"
                    className="rounded-sm text-on-surface underline underline-offset-4 focus-ring"
                  >
                    @ds registry
                  </Link>{' '}
                  once, then add just what you need.
                </p>
              </div>
            </div>
          </div>
        </section>
        <footer className="home-width pt-12 pb-7">
          <div className="flex flex-col justify-between gap-8 sm:flex-row">
            <div>
              <p className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
                <BrandMark className="text-primary" />
                {appName}
              </p>
              <p className="mt-2 text-sm text-on-surface-variant">
                A thoughtful foundation for the web.
              </p>
            </div>
            <nav
              aria-label="Footer"
              className="flex flex-wrap items-start gap-x-6 gap-y-3 text-sm font-medium"
            >
              {[
                ['Components', '#components'],
                ['Documentation', '/docs'],
                ['Theme builder', '/theme'],
                ['GitHub', `https://github.com/${gitConfig.user}/${gitConfig.repo}`],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="rounded-sm underline-offset-4 focus-ring hover:underline"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-12 flex flex-wrap justify-between gap-3 border-t border-outline-subtle pt-5 text-xs text-on-surface-variant">
            <p>Apache-2.0 licensed.</p>
            <p>Built with React Aria & Tailwind CSS.</p>
          </div>
        </footer>
      </div>
    </ShowcaseProvider>
  );
}
