import { render } from 'vitest-browser-react';
import {
  defaultSettings,
  type PaletteRequest,
  type SchemeSet,
  type ThemePalette,
} from '@/components/theme-builder/theme-model';
import { useThemePalette } from '@/components/theme-builder/use-theme-palette';

const schemes = {} as SchemeSet;
let worker: {
  postMessage: ReturnType<typeof vi.fn>;
  terminate: ReturnType<typeof vi.fn>;
  onmessage: ((event: MessageEvent<ThemePalette>) => void) | null;
  onerror: (() => void) | null;
};

function Palette({ seed, style }: PaletteRequest) {
  const { palette, isUpdating, hasError } = useThemePalette({ seed, style }, schemes);
  return (
    <output aria-label="Palette" aria-busy={isUpdating}>
      {hasError ? 'Failed' : `${palette.seed} ${palette.style}`}
    </output>
  );
}

function complete(request: PaletteRequest) {
  worker.onmessage?.(new MessageEvent('message', { data: { ...request, schemes } }));
}

beforeEach(() => {
  worker = { postMessage: vi.fn(), terminate: vi.fn(), onmessage: null, onerror: null };
  vi.stubGlobal(
    'Worker',
    vi.fn(function () {
      return worker;
    }),
  );
});

afterEach(() => vi.unstubAllGlobals());

it('discards stale results and sends only the latest queued seed and style', async () => {
  const first = { seed: '#123456', style: 'vibrant' } as const;
  const last = { seed: '#abcdef', style: 'fidelity' } as const;
  const screen = await render(<Palette {...first} />);
  await screen.rerender(<Palette seed="#334455" style="neutral" />);
  await screen.rerender(<Palette {...last} />);
  expect(worker.postMessage.mock.calls).toEqual([[first]]);

  complete(first);
  expect(worker.postMessage.mock.calls).toEqual([[first], [last]]);
  await expect
    .element(screen.getByRole('status', { name: 'Palette' }))
    .toHaveTextContent(`${defaultSettings.seed} ${defaultSettings.style}`);

  complete(last);
  await expect
    .element(screen.getByRole('status', { name: 'Palette' }))
    .toHaveTextContent(`${last.seed} ${last.style}`);
  await expect
    .element(screen.getByRole('status', { name: 'Palette' }))
    .toHaveAttribute('aria-busy', 'false');
  await screen.unmount();
  expect(worker.terminate).toHaveBeenCalledOnce();
});

it('keeps the current palette when reset overtakes an in-flight calculation', async () => {
  const pending = { seed: '#123456', style: 'vibrant' } as const;
  const screen = await render(<Palette {...pending} />);
  await screen.rerender(<Palette {...defaultSettings} />);
  complete(pending);

  expect(worker.postMessage).toHaveBeenCalledOnce();
  await expect
    .element(screen.getByRole('status', { name: 'Palette' }))
    .toHaveTextContent(`${defaultSettings.seed} ${defaultSettings.style}`);
  await expect
    .element(screen.getByRole('status', { name: 'Palette' }))
    .toHaveAttribute('aria-busy', 'false');
});

it('reports a failed worker instead of silently presenting the previous result as current', async () => {
  const screen = await render(<Palette seed="#123456" style="vibrant" />);
  worker.onerror?.();
  await expect.element(screen.getByRole('status', { name: 'Palette' })).toHaveTextContent('Failed');
});
