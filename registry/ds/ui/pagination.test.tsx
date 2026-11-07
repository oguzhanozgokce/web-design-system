import { useState } from 'react';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import {
  clampPage,
  getPageNumbers,
  getPaginationEntries,
  getPaginationSlots,
} from '@/registry/ds/lib/pagination';
import { Pagination, type PaginationProps } from '@/registry/ds/ui/pagination';

function visiblePages(container: Element) {
  return [...container.querySelectorAll<HTMLElement>('[data-slot="pagination-page"]')]
    .filter((button) => button.offsetParent !== null)
    .map((button) => button.textContent);
}

function visibleEllipses(container: Element) {
  return [...container.querySelectorAll<HTMLElement>('[data-slot="pagination-ellipsis"]')].filter(
    (item) => getComputedStyle(item).display !== 'none',
  ).length;
}

function Controlled(props: Partial<PaginationProps>) {
  const [current, setCurrent] = useState(props.defaultPage ?? 1);
  return (
    <div>
      <Pagination pageCount={12} {...props} page={current} onPageChange={setCurrent} />
      <output data-testid="page">{current}</output>
    </div>
  );
}

describe('pagination helpers', () => {
  it('clamps pages into range', () => {
    expect(clampPage(0, 5)).toBe(1);
    expect(clampPage(9, 5)).toBe(5);
    expect(clampPage(2.6, 5)).toBe(3);
    expect(clampPage(3, 0)).toBe(1);
  });

  it('shows every page when they fit', () => {
    expect(getPageNumbers(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(getPageNumbers(1, 1)).toEqual([1]);
    expect(getPageNumbers(1, 0)).toEqual([]);
  });

  it('collapses the far side into an ellipsis and keeps the slot count', () => {
    expect(getPageNumbers(1, 20)).toEqual([1, 2, 3, 4, 5, null, 20]);
    expect(getPageNumbers(4, 20)).toEqual([1, 2, 3, 4, 5, null, 20]);
    expect(getPageNumbers(5, 20)).toEqual([1, null, 4, 5, 6, null, 20]);
    expect(getPageNumbers(16, 20)).toEqual([1, null, 15, 16, 17, null, 20]);
    expect(getPageNumbers(17, 20)).toEqual([1, null, 16, 17, 18, 19, 20]);
    expect(getPageNumbers(20, 20)).toEqual([1, null, 16, 17, 18, 19, 20]);
    for (let current = 1; current <= 20; current++) {
      expect(getPageNumbers(current, 20)).toHaveLength(7);
      expect(getPageNumbers(current, 20, 2)).toHaveLength(9);
      expect(getPageNumbers(current, 20, 0)).toHaveLength(5);
    }
  });

  it('never hides a single page behind an ellipsis', () => {
    for (let total = 1; total <= 30; total++) {
      for (let current = 1; current <= total; current++) {
        const numbers = getPageNumbers(current, total);
        numbers.forEach((value, index) => {
          if (value !== null) return;
          const before = numbers[index - 1] as number;
          const after = numbers[index + 1] as number;
          expect(after - before).toBeGreaterThan(2);
        });
      }
    }
  });

  it('gives ellipses stable keys and merges wide and compact layouts', () => {
    const entries = getPaginationEntries(10, 20);
    expect(entries.filter((entry) => entry.type === 'ellipsis').map((entry) => entry.key)).toEqual([
      'gap-5',
      'gap-15.5',
    ]);
    const slots = getPaginationSlots(10, 20, 1);
    expect(slots.filter((slot) => slot.isWide).map((slot) => slot.entry.key)).toEqual(
      getPaginationEntries(10, 20, 1).map((entry) => entry.key),
    );
    expect(slots.filter((slot) => slot.isCompact).map((slot) => slot.entry.key)).toEqual(
      getPaginationEntries(10, 20, 0).map((entry) => entry.key),
    );
  });
});

describe('Pagination', () => {
  beforeEach(async () => {
    await page.viewport(1024, 768);
  });

  it('marks the current page and moves between pages', async () => {
    const screen = await renderWithDS(<Controlled defaultPage={4} />);
    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    await expect.element(nav).toBeVisible();
    const current = screen.getByRole('button', { name: 'Page 4' });
    await expect.element(current).toHaveAttribute('aria-current', 'page');
    await screen.getByRole('button', { name: 'Page 5' }).click();
    await expect.element(screen.getByTestId('page')).toHaveTextContent('5');
    await expect
      .element(screen.getByRole('button', { name: 'Page 5' }))
      .toHaveAttribute('aria-current', 'page');
    await screen.getByRole('button', { name: 'Next page' }).click();
    await expect.element(screen.getByTestId('page')).toHaveTextContent('6');
    await screen.getByRole('button', { name: 'Previous page' }).click();
    await expect.element(screen.getByTestId('page')).toHaveTextContent('5');
  });

  it('jumps to the ends and disables the arrow that leads nowhere', async () => {
    const screen = await renderWithDS(<Controlled />);
    await expect.element(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await screen.getByRole('button', { name: 'Page 12' }).click();
    await expect.element(screen.getByTestId('page')).toHaveTextContent('12');
    await expect.element(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    await expect.element(screen.getByRole('button', { name: 'Previous page' })).toBeEnabled();
    expect(visiblePages(screen.container)).toEqual(['1', '8', '9', '10', '11', '12']);
  });

  it('works from the keyboard and keeps focus when an arrow turns off', async () => {
    const screen = await renderWithDS(<Controlled defaultPage={11} />);
    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('button', { name: 'Previous page' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByTestId('page')).toHaveTextContent('10');
    const next = screen.getByRole('button', { name: 'Next page' });
    next.element().focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByTestId('page')).toHaveTextContent('12');
    await expect.element(next).toBeDisabled();
    await expect.element(screen.getByRole('button', { name: 'Page 12' })).toHaveFocus();
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    await expect.element(screen.getByRole('button', { name: 'Page 11' })).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect.element(screen.getByTestId('page')).toHaveTextContent('11');
  });

  it('works uncontrolled and clamps an out-of-range page', async () => {
    const onPageChange = vi.fn();
    const screen = await renderWithDS(
      <Pagination defaultPage={40} pageCount={5} onPageChange={onPageChange} />,
    );
    await expect
      .element(screen.getByRole('button', { name: 'Page 5' }))
      .toHaveAttribute('aria-current', 'page');
    await screen.getByRole('button', { name: 'Page 2' }).click();
    expect(onPageChange).toHaveBeenLastCalledWith(2);
    await expect
      .element(screen.getByRole('button', { name: 'Page 2' }))
      .toHaveAttribute('aria-current', 'page');
  });

  it('collapses to icon arrows and fewer pages in a narrow container', async () => {
    const screen = await renderWithDS(
      <div className="flex flex-col gap-4">
        <div data-testid="narrow" className="w-80">
          <Pagination aria-label="Narrow" size="sm" defaultPage={10} pageCount={20} />
        </div>
        <div data-testid="wide" className="w-[40rem]">
          <Pagination aria-label="Wide" size="sm" defaultPage={10} pageCount={20} />
        </div>
      </div>,
    );
    const narrow = screen.getByTestId('narrow').element();
    const wide = screen.getByTestId('wide').element();
    expect(visiblePages(narrow)).toEqual(['1', '10', '20']);
    expect(visiblePages(wide)).toEqual(['1', '9', '10', '11', '20']);
    expect(visibleEllipses(narrow)).toBe(2);
    expect(visibleEllipses(wide)).toBe(2);
    const previous = screen.getByRole('button', { name: 'Previous page' }).all();
    const narrowArrow = previous.find((button) => narrow.contains(button.element()))!.element();
    const wideArrow = previous.find((button) => wide.contains(button.element()))!.element();
    expect(narrowArrow.getBoundingClientRect().width).toBe(32);
    expect(narrowArrow.textContent).toContain('Previous');
    expect(wideArrow.getBoundingClientRect().width).toBeGreaterThan(60);
    for (const nav of [narrow, wide]) {
      const box = nav.querySelector('nav')!.getBoundingClientRect();
      expect(nav.querySelector('nav')!.scrollWidth).toBeLessThanOrEqual(Math.ceil(box.width));
    }
  });

  it('keeps the same number of slots as the page moves', async () => {
    const screen = await renderWithDS(<Controlled pageCount={30} defaultPage={1} />);
    const widths = new Set<number>();
    for (const target of ['Page 5', 'Page 6', 'Page 7', 'Page 30']) {
      await screen.getByRole('button', { name: target }).click();
      widths.add(visiblePages(screen.container).length + visibleEllipses(screen.container));
    }
    expect([...widths]).toEqual([7]);
  });

  it('takes its labels from props and the provider', async () => {
    const screen = await renderWithDS(
      <Pagination
        defaultPage={2}
        pageCount={4}
        labels={{ page: 'Seite {page}', previous: 'Zurück' }}
      />,
      { provider: { labels: { pagination: { navigation: 'Seiten', nextPage: 'Nächste Seite' } } } },
    );
    await expect.element(screen.getByRole('navigation', { name: 'Seiten' })).toBeVisible();
    await expect.element(screen.getByRole('button', { name: 'Seite 2' })).toBeVisible();
    await expect.element(screen.getByRole('button', { name: 'Nächste Seite' })).toBeVisible();
    await expect.element(screen.getByText('Zurück')).toBeVisible();
  });

  it('formats page numbers for the locale', async () => {
    const screen = await renderWithDS(<Pagination defaultPage={3} pageCount={4} />, {
      locale: 'ar-EG',
    });
    await expect.element(screen.getByRole('button', { name: 'Page ٣' })).toBeVisible();
  });

  it('mirrors in right-to-left layouts', async () => {
    const screen = await renderWithDS(<Pagination defaultPage={2} pageCount={4} />, {
      locale: 'ar',
    });
    const previous = screen.getByRole('button', { name: 'Previous page' }).element();
    const next = screen.getByRole('button', { name: 'Next page' }).element();
    expect(previous.getBoundingClientRect().left).toBeGreaterThan(
      next.getBoundingClientRect().left,
    );
    const icon = previous.querySelector('svg')!;
    expect(getComputedStyle(icon).scale).toBe('-1 1');
    const first = screen.getByRole('button', { name: 'Page 1' }).element();
    const last = screen.getByRole('button', { name: 'Page 4' }).element();
    expect(first.getBoundingClientRect().left).toBeGreaterThan(last.getBoundingClientRect().left);
  });

  it('slides the current-page indicator unless motion is reduced', async () => {
    const moving = await renderWithDS(<Controlled pageCount={5} />);
    await moving.getByRole('button', { name: 'Page 4' }).click();
    const indicator = moving.container.querySelector<HTMLElement>(
      '[data-slot="pagination-indicator"]',
    )!;
    expect(indicator.closest('button')!.textContent).toBe('4');
    expect(indicator.style.transform).not.toBe('');
    await moving.unmount();

    const still = await renderWithDS(<Controlled pageCount={5} />, {
      provider: { motion: 'reduced' },
    });
    await still.getByRole('button', { name: 'Page 4' }).click();
    const settled = still.container.querySelector<HTMLElement>(
      '[data-slot="pagination-indicator"]',
    )!;
    expect(settled.closest('button')!.textContent).toBe('4');
    expect(settled.style.transform).toBe('');
  });

  it('disables every control while disabled and shows one page alone', async () => {
    const screen = await renderWithDS(
      <div>
        <Pagination aria-label="Busy" defaultPage={2} pageCount={4} isDisabled />
        <Pagination aria-label="Single" pageCount={1} />
      </div>,
    );
    const busy = screen.getByRole('navigation', { name: 'Busy' });
    for (const button of busy.getByRole('button').all()) {
      await expect.element(button).toBeDisabled();
    }
    const single = screen.getByRole('navigation', { name: 'Single' });
    expect(single.getByRole('button', { name: /^Page/ }).all()).toHaveLength(1);
    await expect.element(single.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('raises the current page on a segment surface', async () => {
    const screen = await renderWithDS(
      <div>
        <span data-testid="segment" className="bg-surface-segment" />
        <Pagination defaultPage={2} pageCount={4} />
      </div>,
    );
    const indicator = screen.container.querySelector('[data-slot="pagination-indicator"]')!;
    const style = getComputedStyle(indicator);
    expect(style.backgroundColor).toBe(
      getComputedStyle(screen.getByTestId('segment').element()).backgroundColor,
    );
    expect(style.borderTopLeftRadius).not.toBe('0px');
    expect(style.boxShadow).not.toBe('none');
    const pageButton = screen.getByRole('button', { name: 'Page 1' }).element();
    expect(pageButton.getBoundingClientRect().height).toBe(40);
  });
});

describe('Pagination accessibility', () => {
  beforeEach(async () => {
    await page.viewport(1024, 768);
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-4 bg-surface-raised p-4">
          <Pagination aria-label="Projects" defaultPage={6} pageCount={20} />
          <div className="w-72">
            <Pagination aria-label="Photos" size="sm" defaultPage={2} pageCount={9} />
          </div>
          <Pagination aria-label="Loading" pageCount={3} isDisabled />
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
