import { render } from 'vitest-browser-react';
import { useLocalStorageState } from '@/registry/ds/hooks/use-local-storage-state';

const defaults = { density: 'comfortable' };

function Density({ id }: { id: string }) {
  const [value, setValue] = useLocalStorageState('ds-test-density', defaults);
  return (
    <button
      type="button"
      data-testid={id}
      onClick={() =>
        setValue((previous) => ({
          density: previous.density === 'compact' ? 'comfortable' : 'compact',
        }))
      }
    >
      {value.density}
    </button>
  );
}

describe('useLocalStorageState', () => {
  afterEach(() => localStorage.clear());

  it('starts from the default and persists updates', async () => {
    const screen = await render(<Density id="a" />);
    await expect.element(screen.getByTestId('a')).toHaveTextContent('comfortable');
    await screen.getByTestId('a').click();
    await expect.element(screen.getByTestId('a')).toHaveTextContent('compact');
    expect(JSON.parse(localStorage.getItem('ds-test-density')!)).toEqual({ density: 'compact' });
  });

  it('keeps every component on the same key in sync', async () => {
    const screen = await render(
      <>
        <Density id="a" />
        <Density id="b" />
      </>,
    );
    await screen.getByTestId('a').click();
    await expect.element(screen.getByTestId('b')).toHaveTextContent('compact');
  });

  it('follows changes from other tabs', async () => {
    const screen = await render(<Density id="a" />);
    localStorage.setItem('ds-test-density', JSON.stringify({ density: 'compact' }));
    window.dispatchEvent(new StorageEvent('storage', { key: 'ds-test-density' }));
    await expect.element(screen.getByTestId('a')).toHaveTextContent('compact');
    localStorage.clear();
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
    await expect.element(screen.getByTestId('a')).toHaveTextContent('comfortable');
  });

  it('removes the key when set to undefined', async () => {
    function Clear() {
      const [value, setValue] = useLocalStorageState<string | undefined>('ds-test-clear', 'none');
      return (
        <button type="button" data-testid="clear" onClick={() => setValue(undefined)}>
          {value}
        </button>
      );
    }
    localStorage.setItem('ds-test-clear', JSON.stringify('set'));
    const screen = await render(<Clear />);
    await expect.element(screen.getByTestId('clear')).toHaveTextContent('set');
    await screen.getByTestId('clear').click();
    await expect.element(screen.getByTestId('clear')).toHaveTextContent('none');
    expect(localStorage.getItem('ds-test-clear')).toBeNull();
  });

  it('keeps the setter stable with an inline default', async () => {
    const setters = new Set<unknown>();
    function Inline() {
      const [, setValue] = useLocalStorageState('ds-test-inline', { open: false });
      setters.add(setValue);
      return null;
    }
    const screen = await render(<Inline />);
    await screen.rerender(<Inline />);
    expect(setters.size).toBe(1);
  });

  it('falls back to the default for unreadable data', async () => {
    localStorage.setItem('ds-test-density', '{not json');
    const screen = await render(<Density id="a" />);
    await expect.element(screen.getByTestId('a')).toHaveTextContent('comfortable');
  });

  it('keeps the default and does not throw when storage is blocked', async () => {
    const blocked = () => {
      throw new DOMException('blocked', 'SecurityError');
    };
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked);
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked);
    try {
      const screen = await render(<Density id="a" />);
      await expect.element(screen.getByTestId('a')).toHaveTextContent('comfortable');
      await screen.getByTestId('a').click();
      expect(setItem).toHaveBeenCalled();
      await expect.element(screen.getByTestId('a')).toHaveTextContent('comfortable');
    } finally {
      getItem.mockRestore();
      setItem.mockRestore();
    }
  });
});
