import { ProgressBar } from 'react-aria-components';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { Spinner } from '@/registry/ds/ui/spinner';

function spinner(root: Element) {
  return root.querySelector<SVGSVGElement>('[data-slot="spinner"]')!;
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

  it('paints with the current text colour', async () => {
    const screen = await renderWithDS(
      <span className="text-error">
        <Spinner />
      </span>,
    );
    const svg = spinner(screen.container);
    const colour = getComputedStyle(svg.parentElement!).color;
    expect(getComputedStyle(svg.querySelector('path')!).stroke).toBe(colour);
  });

  it('spins, slows down with reduced motion and stops when motion is disabled', async () => {
    const full = await renderWithDS(<Spinner />);
    expect(getComputedStyle(spinner(full.container)).animationDuration).toBe('1s');
    await full.unmount();

    const reduced = await renderWithDS(<Spinner />, { provider: { motion: 'reduced' } });
    expect(getComputedStyle(spinner(reduced.container)).animationDuration).toBe('2.4s');
    await reduced.unmount();

    const disabled = await renderWithDS(<Spinner />, { provider: { motion: 'disabled' } });
    expect(getComputedStyle(spinner(disabled.container)).animationName).toBe('none');
  });

  it('lets a class replace the built-in animation', async () => {
    const screen = await renderWithDS(<Spinner className="animate-none text-primary" />);
    const svg = spinner(screen.container);
    expect(getComputedStyle(svg).animationName).toBe('none');
    expect(svg.classList).toContain('shrink-0');
  });

  it('gets its name from a surrounding progress bar', async () => {
    const screen = await renderWithDS(
      <ProgressBar isIndeterminate aria-label="Refreshing balances">
        <Spinner />
      </ProgressBar>,
    );
    await expect
      .element(screen.getByRole('progressbar', { name: 'Refreshing balances' }))
      .toBeInTheDocument();
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex items-center gap-3 p-4 text-primary">
          <Spinner />
          <ProgressBar isIndeterminate aria-label="Loading orders" className="text-2xl">
            <Spinner />
          </ProgressBar>
          <p role="status" className="flex items-center gap-2 text-body-md text-on-surface">
            <Spinner />
            Syncing ledger
          </p>
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
