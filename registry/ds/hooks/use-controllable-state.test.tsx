import { useState } from 'react';
import { renderWithDS } from '@/test/utils';
import { useControllableState } from '@/registry/ds/hooks/use-controllable-state';

function Counter({
  controlled,
  onChange,
}: {
  controlled: boolean;
  onChange?: (value: number) => void;
}) {
  const [external, setExternal] = useState(0);
  const [value, setValue] = useControllableState(
    controlled ? external : undefined,
    0,
    onChange ?? setExternal,
  );
  return (
    <button
      onClick={() => {
        setValue((previous) => previous + 1);
        setValue((previous) => previous + 1);
      }}
    >
      {controlled ? 'Controlled' : 'Uncontrolled'}: {value}
    </button>
  );
}

it('does not lose consecutive functional updates in controlled or uncontrolled state', async () => {
  const screen = await renderWithDS(
    <>
      <Counter controlled />
      <Counter controlled={false} />
    </>,
  );
  for (const name of ['Controlled', 'Uncontrolled']) {
    await screen.getByRole('button', { name: `${name}: 0` }).click();
    await expect.element(screen.getByRole('button', { name: `${name}: 2` })).toBeVisible();
  }
});

it('starts the next interaction from the controlled value when the consumer declines an update', async () => {
  const onChange = vi.fn();
  const screen = await renderWithDS(<Counter controlled onChange={onChange} />);
  const button = screen.getByRole('button', { name: 'Controlled: 0' });
  await button.click();
  await button.click();
  await button.click();
  expect(onChange.mock.calls.map(([value]) => value)).toEqual([1, 2, 1, 2, 1, 2]);
  await expect.element(button).toHaveTextContent('Controlled: 0');
});
