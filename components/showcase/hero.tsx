import { ArrowForwardIcon } from '@/registry/ds/lib/icons';
import { ButtonLink } from '@/registry/ds/ui/button';
import { Playground } from '@/components/showcase/playground';

export function Hero({ componentCount }: { componentCount: number }) {
  return (
    <section aria-labelledby="home-title" className="home-width pt-12 sm:pt-20 lg:pt-24">
      <div className="mb-7 flex items-center justify-between gap-4 font-mono text-xs text-on-surface-variant">
        <p>REACT COMPONENTS, CONSIDERED.</p>
        <a href="#components" className="rounded-sm underline-offset-4 focus-ring hover:underline">
          {componentCount} components <span aria-hidden>↗</span>
        </a>
      </div>
      <div className="grid items-end gap-8 pb-12 sm:pb-16 lg:grid-cols-[1.65fr_1fr] lg:gap-16">
        <h1
          id="home-title"
          className="text-5xl leading-[1.02] font-medium tracking-[-0.055em] sm:text-7xl lg:text-[5.75rem]"
        >
          Every detail.
          <br />
          <span className="text-on-surface-variant">In its place.</span>
        </h1>
        <div className="flex max-w-xl flex-col gap-7 lg:max-w-sm lg:pb-1">
          <p className="text-base leading-relaxed text-pretty text-on-surface-variant sm:text-lg">
            Expressive controls. Quiet surfaces. A colour system that starts with you. React
            components for the web, ready to make your own.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <ButtonLink
              href="#components"
              endIcon={<ArrowForwardIcon className="rtl:-scale-x-100" />}
            >
              Explore components
            </ButtonLink>
            <ButtonLink href="/docs" variant="ghost">
              Get started
            </ButtonLink>
          </div>
        </div>
      </div>
      <Playground />
      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-b border-outline-subtle pb-8 text-xs text-on-surface-variant sm:text-sm">
        <p>A working preview. Go ahead, try it.</p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 font-medium">
          <li>React Aria</li>
          <li>Tailwind CSS</li>
          <li>TypeScript</li>
          <li>Source you own</li>
        </ul>
      </div>
    </section>
  );
}
