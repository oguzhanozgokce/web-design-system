import {
  ArrowForwardIcon,
  DescriptionIcon,
  CheckCircleIcon,
  PaletteIcon,
} from '@/registry/ds/lib/icons';
import { PreviewThemeScope } from '@/components/showcase/preview-theme';

const principles = [
  {
    icon: PaletteIcon,
    title: 'One colour. A whole system.',
    body: 'Choose a seed. Accent, status and surface roles work together in light and dark, at three contrast levels.',
    href: '/theme',
    link: 'Explore the colour system',
  },
  {
    icon: CheckCircleIcon,
    title: 'The unseen details, included.',
    body: 'Keyboard navigation, focus management and screen-reader behaviour from React Aria. Motion that respects your preferences.',
    href: '/docs/foundations/conventions',
    link: 'Read the component conventions',
  },
  {
    icon: DescriptionIcon,
    title: 'In your project. In your hands.',
    body: 'Install the components you need as source. Change a default, adapt a pattern and take updates when you choose.',
    href: '/docs/foundations/installation',
    link: 'See how installation works',
  },
];

export function Features() {
  return (
    <section aria-label="Design principles" className="home-width py-14 sm:py-20">
      <div className="grid gap-10 md:grid-cols-3 md:gap-8">
        {principles.map(({ icon: Icon, ...item }, index) => (
          <div key={item.title} className="flex flex-col items-start">
            <div className="mb-5 flex w-full items-center justify-between">
              <Icon className="text-2xl text-on-surface-variant" />
              <span className="font-mono text-xs text-on-surface-variant">0{index + 1}</span>
            </div>
            <h2 className="text-base font-semibold tracking-tight">{item.title}</h2>
            <p className="mt-3 mb-5 max-w-sm flex-1 text-sm leading-relaxed text-on-surface-variant">
              {item.body}
            </p>
            {index === 0 ? (
              <PreviewThemeScope className="mb-5 flex w-full max-w-xs gap-1">
                {[
                  'bg-primary-solid',
                  'bg-primary-container',
                  'bg-primary-soft',
                  'bg-neutral-soft',
                  'bg-success-soft',
                  'bg-warning-soft',
                ].map((fill) => (
                  <span key={fill} aria-hidden className={`h-7 flex-1 rounded-sm ${fill}`} />
                ))}
              </PreviewThemeScope>
            ) : null}
            <a
              href={item.href}
              className="inline-flex items-center gap-2 rounded-sm text-sm font-medium underline-offset-4 focus-ring hover:underline"
            >
              {item.link}
              <ArrowForwardIcon className="rtl:-scale-x-100" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
