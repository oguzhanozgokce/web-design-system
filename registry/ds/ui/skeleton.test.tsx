import { useEffect, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { Skeleton } from '@/registry/ds/ui/skeleton';

function all(root: Element, slot: string) {
  return [...root.querySelectorAll<HTMLElement>(`[data-slot="${slot}"]`)];
}

function ProjectCard() {
  const [loaded, setLoaded] = useState(false);
  return (
    <section aria-label="Project" aria-busy={!loaded}>
      <Skeleton isLoaded={loaded} className="w-fit">
        <button type="button">Open project</button>
      </Skeleton>
      <button type="button" onClick={() => setLoaded(true)}>
        Finish loading
      </button>
    </section>
  );
}

describe('Skeleton', () => {
  it('renders a hidden block by default', async () => {
    const screen = await renderWithDS(<Skeleton />);
    const block = all(screen.container, 'skeleton')[0];
    expect(block.getAttribute('aria-hidden')).toBe('true');
    expect(block.dataset.shape).toBe('block');
    expect(block.dataset.animation).toBe('shimmer');
    expect(block.getBoundingClientRect().height).toBe(96);
    expect(getComputedStyle(block).borderRadius).toBe('20px');
  });

  it('paints on the neutral soft fill', async () => {
    const screen = await renderWithDS(
      <>
        <Skeleton />
        <span data-testid="reference" className="bg-neutral-soft" />
      </>,
    );
    const block = all(screen.container, 'skeleton')[0];
    expect(getComputedStyle(block).backgroundColor).toBe(
      getComputedStyle(screen.getByTestId('reference').element()).backgroundColor,
    );
  });

  it('draws text lines from the line height with a shorter last line', async () => {
    const screen = await renderWithDS(
      <div className="w-60 text-sm">
        <Skeleton shape="text" lines={3} />
      </div>,
    );
    const root = all(screen.container, 'skeleton')[0];
    const lines = all(screen.container, 'skeleton-line');
    expect(lines).toHaveLength(3);
    expect(root.getBoundingClientRect().height).toBeCloseTo(60, 0);
    expect(lines[0].getBoundingClientRect().height).toBeCloseTo(12, 0);
    expect(lines[0].getBoundingClientRect().width).toBe(240);
    expect(lines[2].getBoundingClientRect().width).toBeCloseTo(144, 0);
  });

  it('follows a larger type size', async () => {
    const screen = await renderWithDS(
      <div className="w-60 text-3xl">
        <Skeleton shape="text" />
      </div>,
    );
    const lines = all(screen.container, 'skeleton-line');
    expect(lines).toHaveLength(1);
    expect(all(screen.container, 'skeleton')[0].getBoundingClientRect().height).toBeCloseTo(36, 0);
    expect(lines[0].getBoundingClientRect().width).toBe(240);
  });

  it('renders a circle', async () => {
    const screen = await renderWithDS(<Skeleton shape="circle" className="size-12" />);
    const circle = all(screen.container, 'skeleton')[0];
    expect(circle.getBoundingClientRect().width).toBe(48);
    expect(circle.getBoundingClientRect().height).toBe(48);
    expect(getComputedStyle(circle).borderRadius).not.toBe('0px');
  });

  it.each([
    ['en', '-100%'],
    ['ar', '100%'],
  ])('sweeps a shimmer along the reading direction in %s', async (locale, start) => {
    const screen = await renderWithDS(<Skeleton />, { locale });
    const block = all(screen.container, 'skeleton')[0];
    const after = getComputedStyle(block, '::after');
    expect(after.animationName).toBe('ds-shimmer');
    expect(after.animationDuration).toBe('2s');
    const [sweep] = block.getAnimations({ subtree: true });
    sweep.pause();
    sweep.currentTime = 0;
    expect(after.translate).toBe(start);
  });

  it('pulses on request and stays still with animation none', async () => {
    const pulse = await renderWithDS(<Skeleton animation="pulse" />);
    const block = all(pulse.container, 'skeleton')[0];
    expect(block.dataset.animation).toBe('pulse');
    expect(getComputedStyle(block).animationName).toBe('ds-pulse');
    expect(getComputedStyle(block, '::after').animationName).toBe('none');
    await pulse.unmount();

    const still = await renderWithDS(<Skeleton animation="none" />);
    const stillBlock = all(still.container, 'skeleton')[0];
    expect(getComputedStyle(stillBlock).animationName).toBe('none');
    expect(getComputedStyle(stillBlock, '::after').animationName).toBe('none');
  });

  it('pulses with reduced motion and stays still when motion is disabled', async () => {
    const reduced = await renderWithDS(<Skeleton />, { provider: { motion: 'reduced' } });
    const block = all(reduced.container, 'skeleton')[0];
    expect(block.dataset.animation).toBe('pulse');
    expect(getComputedStyle(block).animationName).toBe('ds-pulse');
    expect(getComputedStyle(block, '::after').animationName).toBe('none');
    await reduced.unmount();

    const disabled = await renderWithDS(<Skeleton />, { provider: { motion: 'disabled' } });
    expect(getComputedStyle(all(disabled.container, 'skeleton')[0]).animationName).toBe('none');
  });

  it('keeps wrapped content out of reach until it is loaded', async () => {
    const screen = await renderWithDS(<ProjectCard />);
    await expect
      .element(screen.getByRole('button', { name: 'Open project' }))
      .not.toBeInTheDocument();
    const region = screen.getByRole('region', { name: 'Project' });
    await expect.element(region).toHaveAttribute('aria-busy', 'true');
    const placeholder = all(screen.container, 'skeleton')[0];
    expect(placeholder.getBoundingClientRect().width).toBeGreaterThan(0);

    await screen.getByRole('button', { name: 'Finish loading' }).click();
    await expect.element(screen.getByRole('button', { name: 'Open project' })).toBeVisible();
    await expect.element(region).toHaveAttribute('aria-busy', 'false');
    expect(all(screen.container, 'skeleton')[0].dataset.loaded).toBe('true');
  });

  it('keeps the wrapped content mounted when it loads', async () => {
    const mounted = vi.fn();
    function Draft() {
      const [note, setNote] = useState('');
      useEffect(() => mounted(), []);
      return (
        <input aria-label="Note" value={note} onChange={(event) => setNote(event.target.value)} />
      );
    }
    function Harness() {
      const [loaded, setLoaded] = useState(false);
      return (
        <>
          <Skeleton isLoaded={loaded} className="w-fit">
            <Draft />
          </Skeleton>
          <button type="button" onClick={() => setLoaded(!loaded)}>
            Toggle
          </button>
        </>
      );
    }
    const screen = await renderWithDS(<Harness />);
    await screen.getByRole('button', { name: 'Toggle' }).click();
    const note = screen.getByRole('textbox', { name: 'Note' });
    await note.fill('Ready for review');
    await screen.getByRole('button', { name: 'Toggle' }).click();
    await screen.getByRole('button', { name: 'Toggle' }).click();
    await expect.element(note).toHaveValue('Ready for review');
    expect(mounted).toHaveBeenCalledTimes(1);
  });

  it('cannot be reached with the keyboard while loading', async () => {
    const screen = await renderWithDS(
      <>
        <button type="button">Before</button>
        <Skeleton className="w-fit">
          <button type="button">Open project</button>
        </Skeleton>
        <button type="button">After</button>
      </>,
    );
    await screen.getByRole('button', { name: 'Before' }).click();
    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('treats a false or null child as no content', async () => {
    const screen = await renderWithDS(<Skeleton>{false}</Skeleton>);
    const block = all(screen.container, 'skeleton')[0];
    expect(all(screen.container, 'skeleton-content')).toHaveLength(0);
    expect(block.getBoundingClientRect().height).toBe(96);
  });

  it('renders nothing once loaded when it has no children', async () => {
    const screen = await renderWithDS(<Skeleton isLoaded />);
    expect(all(screen.container, 'skeleton')).toHaveLength(0);
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <section aria-label="Team members" aria-busy="true" className="flex w-80 gap-3 p-4">
          <Skeleton shape="circle" />
          <div className="flex-1 text-sm">
            <Skeleton shape="text" lines={2} />
          </div>
          <Skeleton className="h-10 w-24">
            <button type="button">Invite</button>
          </Skeleton>
        </section>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
