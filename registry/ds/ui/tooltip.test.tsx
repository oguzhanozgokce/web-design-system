import { useEffect, useState, type ReactNode } from 'react';
import { Button as AriaButton } from 'react-aria-components';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { ArchiveIcon, CopyIcon, UndoIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { RichTooltip, Tooltip, TooltipGroup, TooltipTrigger } from '@/registry/ds/ui/tooltip';

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function hover(target: ReturnType<typeof page.getByRole>) {
  await page.getByTestId('pointer-rest').hover();
  await target.hover();
}

function PointerRest() {
  return (
    <p data-testid="pointer-rest" className="p-2">
      Projects
    </p>
  );
}

function roleColor(className: string, property: 'backgroundColor' | 'color') {
  const probe = document.createElement('div');
  probe.className = className;
  document.body.append(probe);
  const color = getComputedStyle(probe)[property];
  probe.remove();
  return color;
}

function IconTrigger({ label, children }: { label: string; children: ReactNode }) {
  return (
    <AriaButton aria-label={label} className="inline-flex size-10 items-center justify-center">
      {children}
    </AriaButton>
  );
}

describe('Tooltip', () => {
  it('renders shortcut keys as Kbd with spoken names', async () => {
    const screen = await renderWithDS(
      <TooltipTrigger defaultOpen>
        <IconTrigger label="Undo">
          <UndoIcon />
        </IconTrigger>
        <Tooltip shortcut={['command', 'Z']}>Undo</Tooltip>
      </TooltipTrigger>,
      { provider: { labels: { kbd: { command: 'Command key' } } } },
    );

    const tooltip = page.getByRole('tooltip');
    await expect.element(tooltip).toBeVisible();
    const keys = document.querySelectorAll('[data-slot="shortcut"] [data-slot="kbd"]');
    expect(keys).toHaveLength(2);
    expect(keys[0]).toHaveAttribute('data-key', 'command');
    expect(keys[0].querySelector('[data-slot="kbd-glyph"]')).toHaveTextContent('⌘');
    expect(getComputedStyle(keys[0]).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(keys[0]).color).toBe(roleColor('text-inverse-on-surface', 'color'));
    expect(document.querySelector('[data-slot="shortcut"]')).toHaveAttribute('dir', 'ltr');
    await expect
      .element(screen.getByRole('button', { name: 'Undo' }))
      .toHaveAccessibleDescription('Undo Command key Z');
  });

  it('lets a trigger override its group and nested groups inherit', async () => {
    const screen = await renderWithDS(
      <TooltipGroup isDisabled placement="bottom">
        <TooltipGroup delay={0}>
          <div className="flex justify-center gap-2 p-16">
            <TooltipTrigger>
              <IconTrigger label="Copy">
                <CopyIcon />
              </IconTrigger>
              <Tooltip>Copy</Tooltip>
            </TooltipTrigger>
            <TooltipTrigger isDisabled={false}>
              <IconTrigger label="Archive">
                <ArchiveIcon />
              </IconTrigger>
              <Tooltip>Archive project</Tooltip>
            </TooltipTrigger>
          </div>
        </TooltipGroup>
      </TooltipGroup>,
    );

    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('button', { name: 'Copy' })).toHaveFocus();
    await wait(300);
    expect(document.querySelector('[role="tooltip"]')).toBeNull();

    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('button', { name: 'Archive' })).toHaveFocus();
    const tooltip = page.getByRole('tooltip');
    await expect.element(tooltip).toHaveTextContent('Archive project');
    await expect.element(tooltip).toHaveAttribute('data-placement', 'bottom');
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('tooltip')).not.toBeInTheDocument();
  });

  it('supports placement, an arrow and the locale direction', async () => {
    await renderWithDS(
      <div className="flex justify-center p-24">
        <TooltipTrigger defaultOpen>
          <IconTrigger label="Archive">
            <ArchiveIcon />
          </IconTrigger>
          <Tooltip placement="bottom" showArrow>
            أرشفة المشروع
          </Tooltip>
        </TooltipTrigger>
      </div>,
      { locale: 'ar' },
    );

    const tooltip = page.getByRole('tooltip');
    await expect.element(tooltip).toBeVisible();
    await expect.element(tooltip).toHaveAttribute('data-placement', 'bottom');
    await expect.element(tooltip).toHaveAttribute('dir', 'rtl');
    await expect.element(tooltip).toHaveAttribute('lang', 'ar');
    expect(document.querySelector('[role="tooltip"] [data-slot="arrow"]')).not.toBeNull();
  });

  it('keeps the shortcut at the end of the tooltip in Arabic', async () => {
    await renderWithDS(
      <div className="flex justify-center p-24">
        <TooltipTrigger defaultOpen>
          <IconTrigger label="أرشفة">
            <ArchiveIcon />
          </IconTrigger>
          <Tooltip className="w-60" shortcut={['command', 'E']}>
            أرشفة
          </Tooltip>
        </TooltipTrigger>
      </div>,
      { locale: 'ar' },
    );

    await expect.element(page.getByRole('tooltip')).toBeVisible();
    await Promise.all(document.getAnimations().map((animation) => animation.finished));
    const tooltip = document.querySelector('[role="tooltip"]')!.getBoundingClientRect();
    const label = document.querySelector('[data-slot="label"]')!.getBoundingClientRect();
    const shortcut = document.querySelector('[data-slot="shortcut"]')!.getBoundingClientRect();
    expect(label.right).toBeCloseTo(tooltip.right - 10, 0);
    expect(shortcut.left).toBeCloseTo(tooltip.left + 10, 0);
  });
});

describe('RichTooltip', () => {
  it('renders a title and body as a tooltip when it has no action', async () => {
    const screen = await renderWithDS(
      <TooltipTrigger defaultOpen>
        <Button variant="ghost">Storage</Button>
        <RichTooltip title="Storage">Photos, videos and backups count toward it.</RichTooltip>
      </TooltipTrigger>,
    );

    const tooltip = page.getByRole('tooltip');
    await expect.element(tooltip).toBeVisible();
    await expect.element(tooltip).toHaveAttribute('data-slot', 'rich-tooltip');
    await expect
      .element(screen.getByRole('button', { name: 'Storage' }))
      .toHaveAccessibleDescription('Storage Photos, videos and backups count toward it.');
  });

  it('sits on the overlay surface, not the inverse one', async () => {
    await renderWithDS(
      <div className="flex justify-between p-24">
        <TooltipTrigger defaultOpen>
          <IconTrigger label="Archive">
            <ArchiveIcon />
          </IconTrigger>
          <Tooltip>Archive project</Tooltip>
        </TooltipTrigger>
        <TooltipTrigger defaultOpen>
          <Button variant="ghost">Storage</Button>
          <RichTooltip title="Storage">Photos, videos and backups count toward it.</RichTooltip>
        </TooltipTrigger>
      </div>,
    );

    await expect.element(page.getByRole('tooltip').nth(1)).toBeVisible();
    const plain = getComputedStyle(document.querySelector('[data-slot="tooltip"]')!);
    const rich = getComputedStyle(document.querySelector('[data-slot="rich-tooltip"]')!);
    expect(plain.backgroundColor).toBe(roleColor('bg-inverse-surface', 'backgroundColor'));
    expect(plain.color).toBe(roleColor('text-inverse-on-surface', 'color'));
    expect(rich.backgroundColor).toBe(roleColor('bg-surface-overlay', 'backgroundColor'));
  });

  it('becomes a non-modal dialog the keyboard can enter when it has an action', async () => {
    const onLearnMore = vi.fn();
    const screen = await renderWithDS(
      <TooltipTrigger delay={100}>
        <Button variant="ghost">Storage</Button>
        <RichTooltip
          title="Storage"
          action={
            <Button variant="ghost" size="sm" onPress={onLearnMore}>
              How we calculate it
            </Button>
          }
        >
          Photos, videos and backups count toward it.
        </RichTooltip>
      </TooltipTrigger>,
    );
    const trigger = screen.getByRole('button', { name: 'Storage' });

    await userEvent.keyboard('{Tab}');
    await expect.element(trigger).toHaveFocus();
    const dialog = page.getByRole('dialog', { name: 'Storage' });
    await expect.element(dialog).toBeVisible();
    await expect.element(dialog).toHaveAttribute('data-trigger', 'PreviewTrigger');
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.keyboard('{Tab}');
    const action = page.getByRole('button', { name: 'How we calculate it' });
    await expect.element(action).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onLearnMore).toHaveBeenCalledOnce();

    await userEvent.keyboard('{Escape}');
    await expect.element(dialog).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();
  });

  it('still becomes a dialog when the rich tooltip is wrapped in another component', async () => {
    function StorageHelp() {
      return (
        <RichTooltip title="Storage" action={<Button variant="ghost">Details</Button>}>
          Photos, videos and backups count toward it.
        </RichTooltip>
      );
    }

    const screen = await renderWithDS(
      <TooltipTrigger delay={100}>
        <Button variant="ghost">Storage</Button>
        <StorageHelp />
      </TooltipTrigger>,
    );
    const trigger = screen.getByRole('button', { name: 'Storage' });

    await userEvent.keyboard('{Tab}');
    await expect.element(trigger).toHaveFocus();
    await expect.element(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    await expect.element(page.getByRole('dialog', { name: 'Storage' })).toBeVisible();
    await userEvent.keyboard('{Tab}');
    await expect.element(page.getByRole('button', { name: 'Details' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect.element(trigger).toHaveFocus();
  });

  it('stays closed with an action when the trigger or its group is disabled', async () => {
    const onOpenChange = vi.fn();
    const screen = await renderWithDS(
      <>
        <PointerRest />
        <TooltipTrigger isDisabled delay={50} onOpenChange={onOpenChange}>
          <Button variant="ghost">Storage</Button>
          <RichTooltip title="Storage" action={<Button variant="ghost">Details</Button>}>
            Photos, videos and backups count toward it.
          </RichTooltip>
        </TooltipTrigger>
        <TooltipGroup isDisabled delay={50}>
          <TooltipTrigger>
            <Button variant="ghost">Backups</Button>
            <RichTooltip title="Backups" action={<Button variant="ghost">Open backups</Button>}>
              Copies of your devices from the last 30 days.
            </RichTooltip>
          </TooltipTrigger>
        </TooltipGroup>
      </>,
    );

    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('button', { name: 'Storage' })).toHaveFocus();
    await wait(300);
    expect(document.querySelector('[role="dialog"]')).toBeNull();

    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('button', { name: 'Backups' })).toHaveFocus();
    await wait(300);
    expect(document.querySelector('[role="dialog"]')).toBeNull();

    await hover(screen.getByRole('button', { name: 'Storage' }));
    await wait(300);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('stays closed when its trigger is enabled again after being disabled while open', async () => {
    const controls: { setDisabled?: (isDisabled: boolean) => void } = {};

    function HelpWithAction() {
      const [isDisabled, setDisabled] = useState(false);
      useEffect(() => {
        controls.setDisabled = setDisabled;
      }, []);
      return (
        <TooltipTrigger defaultOpen isDisabled={isDisabled}>
          <Button variant="ghost">Storage</Button>
          <RichTooltip title="Storage" action={<Button variant="ghost">Manage</Button>}>
            41 of 50 GB used.
          </RichTooltip>
        </TooltipTrigger>
      );
    }

    await renderWithDS(<HelpWithAction />);
    await expect.element(page.getByRole('dialog', { name: 'Storage' })).toBeVisible();
    controls.setDisabled?.(true);
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    controls.setDisabled?.(false);
    await wait(300);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it('supports a controlled open state with an action', async () => {
    function Controlled() {
      const [isOpen, setOpen] = useState(false);
      return (
        <>
          <p>{isOpen ? 'Details shown' : 'Details hidden'}</p>
          <TooltipTrigger isOpen={isOpen} onOpenChange={setOpen} delay={50}>
            <Button variant="ghost">Storage</Button>
            <RichTooltip title="Storage" action={<Button variant="ghost">Details</Button>}>
              Photos, videos and backups count toward it.
            </RichTooltip>
          </TooltipTrigger>
        </>
      );
    }

    const screen = await renderWithDS(<Controlled />);
    const trigger = screen.getByRole('button', { name: 'Storage' });

    await userEvent.keyboard('{Tab}');
    await expect.element(trigger).toHaveFocus();
    await expect.element(page.getByRole('dialog', { name: 'Storage' })).toBeVisible();
    await expect.element(screen.getByText('Details shown')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await expect.element(screen.getByText('Details hidden')).toBeInTheDocument();
  });
});

describe('Tooltip accessibility', () => {
  it('has no violations for plain, rich and action tooltips in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      document.documentElement.classList.toggle('dark', 'dark' in options);
      const screen = await renderWithDS(
        <div className="flex justify-between p-32">
          <TooltipTrigger defaultOpen>
            <IconTrigger label="Undo">
              <UndoIcon />
            </IconTrigger>
            <Tooltip shortcut={['mod', 'shift', 'Z']} showArrow>
              Undo last change
            </Tooltip>
          </TooltipTrigger>
          <TooltipTrigger defaultOpen>
            <Button variant="ghost">Storage</Button>
            <RichTooltip title="Storage" showArrow>
              Photos, videos and backups count toward it.
            </RichTooltip>
          </TooltipTrigger>
          <TooltipTrigger defaultOpen>
            <Button variant="ghost">Backups</Button>
            <RichTooltip title="Backups" action={<Button variant="ghost">Details</Button>}>
              Copies of your devices from the last 30 days.
            </RichTooltip>
          </TooltipTrigger>
        </div>,
        options,
      );
      await expect.element(page.getByRole('tooltip').nth(1)).toBeVisible();
      await expect.element(page.getByRole('dialog', { name: 'Backups' })).toBeVisible();
      await wait(250);
      await expectNoA11yViolations(document.body);
      await screen.unmount();
    }
    document.documentElement.classList.remove('dark');
  });
});
