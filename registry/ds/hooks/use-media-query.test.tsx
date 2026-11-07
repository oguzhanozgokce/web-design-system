import { render } from 'vitest-browser-react';
import { useMediaQuery } from '@/registry/ds/hooks/use-media-query';

function Probe({ query, label }: { query: string; label: string }) {
  const matches = useMediaQuery(query);
  return (
    <output>
      {label}: {String(matches)}
    </output>
  );
}

it('keeps its subscription through unrelated renders and replaces it when the query changes', async () => {
  const first = window.matchMedia('(min-width: 1px)');
  const second = window.matchMedia('(min-width: 100000px)');
  const add = vi.spyOn(first, 'addEventListener');
  const remove = vi.spyOn(first, 'removeEventListener');
  const secondRemove = vi.spyOn(second, 'removeEventListener');
  vi.spyOn(window, 'matchMedia').mockImplementation((query) =>
    query === first.media ? first : second,
  );
  try {
    const screen = await render(<Probe query={first.media} label="First" />);
    await screen.rerender(<Probe query={first.media} label="Updated" />);
    await expect.element(screen.getByRole('status')).toHaveTextContent('Updated: true');
    expect(add).toHaveBeenCalledOnce();
    expect(remove).not.toHaveBeenCalled();
    await screen.rerender(<Probe query={second.media} label="Other query" />);
    await expect.element(screen.getByRole('status')).toHaveTextContent('Other query: false');
    expect(remove).toHaveBeenCalledOnce();
    await screen.unmount();
    expect(secondRemove).toHaveBeenCalledOnce();
  } finally {
    vi.restoreAllMocks();
  }
});
