import { useState } from 'react';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { GroupIcon, PersonIcon } from '@/registry/ds/lib/icons';
import { Radio, RadioGroup } from '@/registry/ds/ui/radio-group';

function hasHoverLayer(element: HTMLElement) {
  const layer = getComputedStyle(element, '::before');
  return layer.content !== 'none' && layer.opacity !== '0';
}

describe('RadioGroup', () => {
  it('renders a labelled radio group and selects on click', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <RadioGroup
        label="Invoice delivery"
        description="Sent on the issue date."
        onChange={onChange}
      >
        <Radio value="email">Email</Radio>
        <Radio value="post">Postal mail</Radio>
      </RadioGroup>,
    );
    const group = screen.getByRole('radiogroup', { name: 'Invoice delivery' });
    await expect.element(group).toHaveAccessibleDescription('Sent on the issue date.');
    await expect.element(group).toHaveAttribute('data-variant', 'default');

    await screen.getByText('Postal mail').click();
    expect(onChange).toHaveBeenLastCalledWith('post');
    await expect.element(screen.getByRole('radio', { name: 'Postal mail' })).toBeChecked();
    await expect.element(screen.getByRole('radio', { name: 'Email' })).not.toBeChecked();
  });

  it('moves the selection with arrow keys', async () => {
    const screen = await renderWithDS(
      <RadioGroup label="Billing cycle" defaultValue="monthly">
        <Radio value="monthly">Monthly</Radio>
        <Radio value="yearly">Yearly</Radio>
      </RadioGroup>,
    );
    await userEvent.tab();
    await expect.element(screen.getByRole('radio', { name: 'Monthly' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(screen.getByRole('radio', { name: 'Yearly' })).toBeChecked();
  });

  it('follows the reading direction for horizontal arrow keys in RTL', async () => {
    const screen = await renderWithDS(
      <RadioGroup label="دورة الفوترة" orientation="horizontal" defaultValue="monthly">
        <Radio value="monthly">شهري</Radio>
        <Radio value="yearly">سنوي</Radio>
      </RadioGroup>,
      { locale: 'ar' },
    );
    await userEvent.tab();
    await userEvent.keyboard('{ArrowLeft}');
    await expect.element(screen.getByRole('radio', { name: 'سنوي' })).toBeChecked();
  });

  it('supports controlled value', async () => {
    function Controlled() {
      const [value, setValue] = useState('weekly');
      return (
        <>
          <RadioGroup label="Payout schedule" value={value} onChange={setValue}>
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
        <Radio value="starter" icon={<PersonIcon />} description="One ledger and one member.">
          Starter
        </Radio>
        <Radio value="team" icon={<GroupIcon />} description="Unlimited ledgers.">
          Team
        </Radio>
      </RadioGroup>,
    );
    const team = screen.getByRole('radio', { name: 'Team' });
    await expect.element(team).toHaveAccessibleDescription('Unlimited ledgers.');
    await expect
      .element(screen.getByRole('radiogroup', { name: 'Plan' }))
      .toHaveAttribute('data-variant', 'card');

    await screen.getByText('Unlimited ledgers.').click();
    await expect.element(team).toBeChecked();
    expect(team.element().closest('[data-slot="radio"]')?.getAttribute('data-variant')).toBe(
      'card',
    );
  });

  it('skips disabled options and blocks a disabled group', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <>
        <RadioGroup label="Data region" onChange={onChange}>
          <Radio value="eu">European Union</Radio>
          <Radio value="apac" isDisabled>
            Asia Pacific
          </Radio>
        </RadioGroup>
        <RadioGroup label="Fiscal year start" isDisabled>
          <Radio value="january">January</Radio>
        </RadioGroup>
      </>,
    );
    await expect.element(screen.getByRole('radio', { name: 'Asia Pacific' })).toBeDisabled();
    await screen.getByText('Asia Pacific').click({ force: true });
    expect(onChange).not.toHaveBeenCalled();
    await expect.element(screen.getByRole('radio', { name: 'January' })).toBeDisabled();
  });

  it('shows the error message when invalid', async () => {
    const screen = await renderWithDS(
      <RadioGroup
        label="Why are you closing this account?"
        isRequired
        isInvalid
        errorMessage="Choose a reason."
      >
        <Radio value="duplicate">Duplicate account</Radio>
      </RadioGroup>,
    );
    const group = screen.getByRole('radiogroup');
    await expect.element(group).toHaveAttribute('aria-invalid', 'true');
    await expect.element(group).toHaveAttribute('aria-required', 'true');
    await expect.element(screen.getByText('Choose a reason.')).toBeVisible();
  });

  it('keeps an explicit aria-label when a description is present', async () => {
    const screen = await renderWithDS(
      <RadioGroup label="Plan" variant="card">
        <Radio
          value="team"
          aria-label="Team plan, 12 USD a member"
          description="Unlimited ledgers."
        >
          Team
        </Radio>
      </RadioGroup>,
    );
    await expect
      .element(screen.getByRole('radio'))
      .toHaveAccessibleName('Team plan, 12 USD a member');
  });

  it('draws the focus ring around the whole card', async () => {
    await renderWithDS(
      <RadioGroup label="Plan" variant="card" defaultValue="starter">
        <Radio value="starter" description="One ledger.">
          Starter
        </Radio>
      </RadioGroup>,
    );
    await userEvent.tab();
    const target = document.querySelector<HTMLElement>('[data-slot="target"]')!;
    expect(target.hasAttribute('data-focus-visible')).toBe(true);
    expect(getComputedStyle(target).outlineWidth).toBe('3px');
    expect(document.querySelector('[data-slot="state-layer"]')).toBeNull();
  });

  it('does not change a read-only group', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <RadioGroup label="Base currency" isReadOnly defaultValue="eur" onChange={onChange}>
        <Radio value="eur">Euro</Radio>
        <Radio value="usd">US dollar</Radio>
      </RadioGroup>,
    );
    await screen.getByText('US dollar').click();
    expect(onChange).not.toHaveBeenCalled();
    await expect.element(screen.getByRole('radio', { name: 'Euro' })).toBeChecked();
  });

  it('keeps the click target to the ring and its text', async () => {
    const onChange = vi.fn();
    await renderWithDS(
      <div style={{ width: 600 }}>
        <RadioGroup label="Invoice delivery" onChange={onChange}>
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

  it('shows the hover layer on an editable card but not on a read-only one', async () => {
    await renderWithDS(
      <div className="flex flex-col gap-4">
        <RadioGroup label="Plan" variant="card" defaultValue="team">
          <Radio value="team" description="Unlimited ledgers.">
            Team
          </Radio>
        </RadioGroup>
        <RadioGroup label="Base currency" variant="card" isReadOnly defaultValue="eur">
          <Radio value="eur" description="Set when the workspace was created.">
            Euro
          </Radio>
        </RadioGroup>
      </div>,
    );
    const [editable, readOnly] = document.querySelectorAll<HTMLElement>('[data-slot="target"]');

    await page.elementLocator(editable!).hover();
    await expect.poll(() => getComputedStyle(editable!, '::before').opacity).toBe('0.08');

    await page.elementLocator(readOnly!).hover();
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(readOnly!.hasAttribute('data-readonly')).toBe(true);
    expect(hasHoverLayer(readOnly!)).toBe(false);
  });

  it.each([
    ['system', 'scale'],
    ['reduced', 'none'],
  ] as const)('scales the dot in with motion %s', async (motion, transitionProperty) => {
    await renderWithDS(
      <RadioGroup label="Billing cycle" defaultValue="monthly">
        <Radio value="monthly">Monthly</Radio>
      </RadioGroup>,
      { provider: { motion } },
    );
    const dot = document.querySelector<HTMLElement>('[data-slot="dot"]')!;
    expect(getComputedStyle(dot).transitionProperty).toBe(transitionProperty);
    expect(dot.getBoundingClientRect().width).toBe(10);
  });

  it.each([
    ['light', {}],
    ['dark', { dark: true }],
    ['RTL', { locale: 'ar' }],
  ])('has no accessibility violations in %s', async (_, options) => {
    const screen = await renderWithDS(
      <div className="flex flex-col gap-8 p-6">
        <RadioGroup
          label="Payout schedule"
          description="From the next business day."
          defaultValue="weekly"
        >
          <Radio value="daily" description="Two business days after each sale.">
            Daily
          </Radio>
          <Radio value="weekly">Weekly</Radio>
          <Radio value="monthly" isDisabled>
            Monthly
          </Radio>
        </RadioGroup>
        <RadioGroup
          label="Billing cycle"
          orientation="horizontal"
          isInvalid
          errorMessage="Choose a cycle."
        >
          <Radio value="monthly">Monthly</Radio>
          <Radio value="yearly">Yearly</Radio>
        </RadioGroup>
        <RadioGroup label="Plan" variant="card" orientation="horizontal" defaultValue="team">
          <Radio value="starter" icon={<PersonIcon />} description="One ledger.">
            Starter
          </Radio>
          <Radio value="team" icon={<GroupIcon />} description="Unlimited ledgers.">
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
    expect(screen.container.querySelectorAll('input[type="radio"]')).toHaveLength(9);
    await expectNoA11yViolations(screen.container);
  });
});
