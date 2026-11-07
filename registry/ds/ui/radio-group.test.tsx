import { useState } from 'react';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { GroupIcon, PersonIcon } from '@/registry/ds/lib/icons';
import { Radio, RadioGroup } from '@/registry/ds/ui/radio-group';

describe('RadioGroup', () => {
  it('renders a labelled radio group and selects on click', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <RadioGroup
        label="Project delivery"
        description="Sent when a project ships."
        onChange={onChange}
      >
        <Radio value="email">Email</Radio>
        <Radio value="post">Postal mail</Radio>
      </RadioGroup>,
    );
    const group = screen.getByRole('radiogroup', { name: 'Project delivery' });
    await expect.element(group).toHaveAccessibleDescription('Sent when a project ships.');
    await expect.element(group).toHaveAttribute('data-variant', 'default');

    await screen.getByText('Postal mail').click();
    expect(onChange).toHaveBeenLastCalledWith('post');
    await expect.element(screen.getByRole('radio', { name: 'Postal mail' })).toBeChecked();
    await expect.element(screen.getByRole('radio', { name: 'Email' })).not.toBeChecked();
  });

  it('supports controlled value', async () => {
    function Controlled() {
      const [value, setValue] = useState('weekly');
      return (
        <>
          <RadioGroup label="Upload schedule" value={value} onChange={setValue}>
            <Radio value="daily">Daily</Radio>
            <Radio value="weekly">Weekly</Radio>
          </RadioGroup>
          <output>{value}</output>
        </>
      );
    }
    const screen = await renderWithDS(<Controlled />);
    await expect.element(screen.getByRole('radio', { name: 'Weekly' })).toBeChecked();
    await screen.getByText('Daily').click();
    await expect.element(screen.getByRole('status')).toHaveTextContent('daily');
  });

  it('keeps option descriptions out of the name and selects from anywhere on a card', async () => {
    const screen = await renderWithDS(
      <RadioGroup label="Plan" variant="card" orientation="horizontal">
        <Radio value="starter" icon={<PersonIcon />} description="One folder and one member.">
          Starter
        </Radio>
        <Radio value="team" icon={<GroupIcon />} description="Unlimited folders.">
          Team
        </Radio>
      </RadioGroup>,
    );
    const team = screen.getByRole('radio', { name: 'Team' });
    await expect.element(team).toHaveAccessibleDescription('Unlimited folders.');
    await expect
      .element(screen.getByRole('radiogroup', { name: 'Plan' }))
      .toHaveAttribute('data-variant', 'card');

    await screen.getByText('Unlimited folders.').click();
    await expect.element(team).toBeChecked();
    expect(team.element().closest('[data-slot="radio"]')?.getAttribute('data-variant')).toBe(
      'card',
    );
  });

  it('dims disabled options and the header of a disabled group', async () => {
    await renderWithDS(
      <>
        <RadioGroup label="Data region">
          <Radio value="eu">European Union</Radio>
          <Radio value="apac" isDisabled>
            Asia Pacific
          </Radio>
        </RadioGroup>
        <RadioGroup label="Week starts on" isDisabled>
          <Radio value="monday">Monday</Radio>
        </RadioGroup>
      </>,
    );
    const targets = [...document.querySelectorAll<HTMLElement>('[data-slot="target"]')];
    expect(getComputedStyle(targets[1]).opacity).toBe('0.5');
    expect(getComputedStyle(targets[1]).cursor).toBe('not-allowed');
    expect(getComputedStyle(targets[0]).opacity).toBe('1');
    const header = document.querySelectorAll<HTMLElement>('[data-slot="header"]')[1];
    expect(getComputedStyle(header).opacity).toBe('0.5');
  });

  it('keeps an explicit aria-label when a description is present', async () => {
    const screen = await renderWithDS(
      <RadioGroup label="Plan" variant="card">
        <Radio
          value="team"
          aria-label="Team plan, up to 50 members"
          description="Unlimited folders."
        >
          Team
        </Radio>
      </RadioGroup>,
    );
    await expect
      .element(screen.getByRole('radio'))
      .toHaveAccessibleName('Team plan, up to 50 members');
  });

  it('draws the focus ring on the dot, or around the whole card', async () => {
    const screen = await renderWithDS(
      <>
        <RadioGroup label="Sharing cycle" defaultValue="monthly">
          <Radio value="monthly">Monthly</Radio>
        </RadioGroup>
        <RadioGroup label="Plan" variant="card" defaultValue="starter">
          <Radio value="starter" description="One folder.">
            Starter
          </Radio>
        </RadioGroup>
      </>,
    );
    const [dot, cardRing] = document.querySelectorAll<HTMLElement>('[data-slot="ring"]');
    const card = document.querySelectorAll<HTMLElement>('[data-slot="target"]')[1];

    await userEvent.tab();
    await expect.element(screen.getByRole('radio', { name: 'Monthly' })).toHaveFocus();
    expect(dot.hasAttribute('data-focus-visible')).toBe(true);
    expect(getComputedStyle(dot).outlineWidth).toBe('2px');
    expect(getComputedStyle(dot).outlineOffset).toBe('2px');

    await userEvent.tab();
    await expect.element(screen.getByRole('radio', { name: 'Starter' })).toHaveFocus();
    expect(card.hasAttribute('data-focus-visible')).toBe(true);
    expect(getComputedStyle(card).outlineWidth).toBe('2px');
    expect(getComputedStyle(card).outlineOffset).toBe('2px');
    expect(getComputedStyle(cardRing).outlineStyle).toBe('none');
  });

  it('keeps the click target to the ring and its text', async () => {
    const onChange = vi.fn();
    await renderWithDS(
      <div style={{ width: 600 }}>
        <RadioGroup label="Project delivery" onChange={onChange}>
          <Radio value="email">Email</Radio>
        </RadioGroup>
      </div>,
    );
    expect(
      document.querySelector('[data-slot="target"]')!.getBoundingClientRect().width,
    ).toBeLessThan(200);
    const radio = document.querySelector<HTMLElement>('[data-slot="radio"]')!;
    await page.elementLocator(radio).click({ position: { x: 580, y: 12 } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('darkens the border of an editable card on hover but not of a read-only one', async () => {
    await renderWithDS(
      <div className="flex flex-col gap-4">
        <RadioGroup label="Plan" variant="card">
          <Radio value="team" description="Unlimited folders.">
            Team
          </Radio>
        </RadioGroup>
        <RadioGroup label="Language" variant="card" isReadOnly>
          <Radio value="en" description="Set when the workspace was created.">
            English
          </Radio>
        </RadioGroup>
      </div>,
      { provider: { motion: 'disabled' } },
    );
    const [editable, readOnly] = document.querySelectorAll<HTMLElement>('[data-slot="target"]');
    const resting = getComputedStyle(editable!).borderTopColor;
    expect(getComputedStyle(readOnly!).borderTopColor).toBe(resting);

    await page.elementLocator(editable!).hover();
    await expect.poll(() => getComputedStyle(editable!).borderTopColor).not.toBe(resting);

    await page.elementLocator(readOnly!).hover();
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(readOnly!.hasAttribute('data-readonly')).toBe(true);
    expect(getComputedStyle(readOnly!).borderTopColor).toBe(resting);
    expect(getComputedStyle(readOnly!).cursor).toBe('default');
  });

  it('fills a selected radio with the solid primary and shrinks the dot', async () => {
    const screen = await renderWithDS(
      <>
        <span data-testid="primary" className="bg-primary-solid" />
        <span data-testid="on-primary" className="bg-on-primary-solid" />
        <RadioGroup label="Sharing cycle" defaultValue="monthly">
          <Radio value="monthly">Monthly</Radio>
          <Radio value="yearly">Yearly</Radio>
        </RadioGroup>
      </>,
      { provider: { motion: 'disabled' } },
    );
    const fill = (testId: string) =>
      getComputedStyle(screen.getByTestId(testId).element()).backgroundColor;
    const [selected, unselected] = document.querySelectorAll<HTMLElement>('[data-slot="ring"]');
    expect(getComputedStyle(selected).backgroundColor).toBe(fill('primary'));
    expect(getComputedStyle(selected.firstElementChild!).backgroundColor).toBe(fill('on-primary'));
    expect(getComputedStyle(unselected).backgroundColor).not.toBe(fill('primary'));
    expect(unselected.firstElementChild!.getBoundingClientRect().width).toBe(16);
  });

  it.each([
    ['light', {}],
    ['dark', { dark: true }],
    ['RTL', { locale: 'ar' }],
  ])('has no accessibility violations in %s', async (_, options) => {
    const screen = await renderWithDS(
      <div className="flex flex-col gap-8 p-6">
        <RadioGroup
          label="Upload schedule"
          description="From the next business day."
          defaultValue="weekly"
        >
          <Radio value="daily" description="Every evening.">
            Daily
          </Radio>
          <Radio value="weekly">Weekly</Radio>
          <Radio value="monthly" isDisabled>
            Monthly
          </Radio>
        </RadioGroup>
        <RadioGroup
          label="Sharing cycle"
          orientation="horizontal"
          isInvalid
          errorMessage="Choose a cycle."
        >
          <Radio value="monthly">Monthly</Radio>
          <Radio value="yearly">Yearly</Radio>
        </RadioGroup>
        <RadioGroup label="Plan" variant="card" orientation="horizontal" defaultValue="team">
          <Radio value="starter" icon={<PersonIcon />} description="One folder.">
            Starter
          </Radio>
          <Radio value="team" icon={<GroupIcon />} description="Unlimited folders.">
            Team
          </Radio>
          <Radio value="business" isDisabled description="Approvals and audit log.">
            Business
          </Radio>
        </RadioGroup>
        <RadioGroup
          label="Report access"
          variant="card"
          isInvalid
          errorMessage="Choose who can open it."
        >
          <Radio value="private" icon={<PersonIcon />} description="Only you.">
            Only me
          </Radio>
        </RadioGroup>
      </div>,
      options,
    );
    await expect.element(screen.getByRole('radio', { name: 'Team' })).toBeChecked();
    await expectNoA11yViolations(screen.container);
  });
});
