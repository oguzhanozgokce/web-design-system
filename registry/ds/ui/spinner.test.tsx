import { ProgressBar } from 'react-aria-components';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { Spinner } from '@/registry/ds/ui/spinner';

function spinner(root: Element) {
  return root.querySelector<SVGSVGElement>('[data-slot="spinner"]')!;
}

function strokeWidth(svg: SVGSVGElement) {
  const scale = svg.getBoundingClientRect().width / 24;
  return parseFloat(svg.querySelector('[data-slot="arc"]')!.getAttribute('stroke-width')!) * scale;
}

describe('Spinner', () => {
  it('is decorative and hidden from assistive technology', async () => {
    const screen = await renderWithDS(<Spinner />);
    const svg = spinner(screen.container);
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('focusable')).toBe('false');
  });

  it('follows the font size by default and accepts an explicit size', async () => {
    const screen = await renderWithDS(
      <div>
        <span style={{ fontSize: 32 }}>
          <Spinner data-testid="inherited" />
        </span>
        <Spinner size={20} data-testid="explicit" />
      </div>,
    );
    const inherited = screen.getByTestId('inherited').element().getBoundingClientRect();
    const explicit = screen.getByTestId('explicit').element().getBoundingClientRect();
    expect(inherited.width).toBe(32);
    expect(explicit.width).toBe(20);
  });

  it.each([
    ['sm', 16, 2],
    ['md', 24, 2.5],
    ['lg', 32, 3],
    ['xl', 40, 3.5],
  ] as const)('draws the %s size at %ipx with a %fpx stroke', async (size, box, stroke) => {
    const screen = await renderWithDS(<Spinner size={size} />);
    const svg = spinner(screen.container);
    expect(svg.dataset.size).toBe(size);
    expect(svg.getBoundingClientRect().width).toBe(box);
    expect(strokeWidth(svg)).toBeCloseTo(stroke, 5);
  });

  it('paints with the current text colour by default and in primary on request', async () => {
    const screen = await renderWithDS(
      <span className="text-error">
        <Spinner data-testid="current" />
        <Spinner tone="primary" data-testid="primary" />
        <span data-testid="reference" className="text-primary" />
      </span>,
    );
    const current = screen.getByTestId('current').element();
    const primary = screen.getByTestId('primary').element();
    expect(current.getAttribute('data-tone')).toBe('current');
    expect(getComputedStyle(current.querySelector('path')!).stroke).toBe(
      getComputedStyle(current.parentElement!).color,
    );
    expect(primary.getAttribute('data-tone')).toBe('primary');
    expect(getComputedStyle(primary.querySelector('path')!).stroke).toBe(
      getComputedStyle(screen.getByTestId('reference').element()).color,
    );
  });

  it('draws a faint full track under a quarter arc', async () => {
    const screen = await renderWithDS(<Spinner />);
    const track = spinner(screen.container).querySelector('[data-slot="track"]')!;
    expect(getComputedStyle(track).strokeOpacity).toBe('0.2');
  });

  it('spins, slows down with reduced motion and stops when motion is disabled', async () => {
    const full = await renderWithDS(<Spinner />);
    expect(getComputedStyle(spinner(full.container)).animationDuration).toBe('0.75s');
    await full.unmount();

    const reduced = await renderWithDS(<Spinner />, { provider: { motion: 'reduced' } });
    expect(getComputedStyle(spinner(reduced.container)).animationDuration).toBe('1.5s');
    await reduced.unmount();

    const disabled = await renderWithDS(<Spinner />, { provider: { motion: 'disabled' } });
    expect(getComputedStyle(spinner(disabled.container)).animationName).toBe('none');
  });

  it('lets a class replace the built-in animation', async () => {
    const screen = await renderWithDS(<Spinner className="animate-none text-primary" />);
    const svg = spinner(screen.container);
    expect(getComputedStyle(svg).animationName).toBe('none');
    expect(getComputedStyle(svg).flexShrink).toBe('0');
  });

  it('gets its name from a surrounding progress bar', async () => {
    const screen = await renderWithDS(
      <ProgressBar isIndeterminate aria-label="Refreshing photos">
        <Spinner />
      </ProgressBar>,
    );
    await expect
      .element(screen.getByRole('progressbar', { name: 'Refreshing photos' }))
      .toBeInTheDocument();
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex items-center gap-3 p-4">
          <Spinner tone="primary" size="md" />
          <ProgressBar isIndeterminate aria-label="Loading projects" className="text-2xl">
            <Spinner />
          </ProgressBar>
          <p role="status" className="flex items-center gap-2 text-sm text-on-surface">
            <Spinner size="sm" />
            Syncing folder
          </p>
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
