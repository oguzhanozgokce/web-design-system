import { useState } from 'react';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';

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
    const next = screen.getByRole('button', { name: 'Next page' });
    next.element().focus();
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByTestId('page')).toHaveTextContent('12');
    await expect.element(next).toBeDisabled();
    await expect.element(screen.getByRole('button', { name: 'Page 12' })).toHaveFocus();
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

  it('takes its labels from props and the provider', async () => {
    const screen = await renderWithDS(
      <Pagination
        defaultPage={2}
        pageCount={4}
        labels={{ page: 'Page number {page}', previous: 'Go back' }}
      />,
      { provider: { labels: { pagination: { navigation: 'Pages', nextPage: 'Following page' } } } },
    );
    await expect.element(screen.getByRole('navigation', { name: 'Pages' })).toBeVisible();
    await expect.element(screen.getByRole('button', { name: 'Page number 2' })).toBeVisible();
    await expect.element(screen.getByRole('button', { name: 'Following page' })).toBeVisible();
    await expect.element(screen.getByText('Go back')).toBeVisible();
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
