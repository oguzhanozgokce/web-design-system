import { useState } from 'react';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { GroupIcon } from '@/registry/ds/lib/icons';
import { Avatar, AvatarButton, AvatarGroup, getAvatarInitials } from '@/registry/ds/ui/avatar';
import { Menu, MenuItem, MenuTrigger } from '@/registry/ds/ui/menu';

const photo = `data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'><rect width='8' height='8'/></svg>",
)}`;
const brokenPhoto = 'data:image/png;base64,AAAA';

async function settleAnimations() {
  await Promise.all(document.getAnimations().map((animation) => animation.finished));
}

function centerX(element: Element) {
  const rect = element.getBoundingClientRect();
  return rect.left + rect.width / 2;
}

function probe(className: string, property: 'backgroundColor' | 'color' = 'backgroundColor') {
  const element = document.createElement('span');
  element.className = className;
  document.querySelector('[data-testid="ds-root"]')!.append(element);
  const value = getComputedStyle(element)[property];
  element.remove();
  return value;
}

function visualOf(root: Element) {
  return root.querySelector('[data-slot="avatar-visual"]')!;
}

describe('getAvatarInitials', () => {
  it('takes the first and last word', () => {
    expect(getAvatarInitials('Ayşe Nur Demir')).toBe('AD');
    expect(getAvatarInitials('  mehmet   kaya ')).toBe('MK');
  });

  it('takes one grapheme for a single name', () => {
    expect(getAvatarInitials('Madonna')).toBe('M');
  });

  it('skips words that do not start with a letter or digit', () => {
    expect(getAvatarInitials('Elif Şahin (Design)')).toBe('EŞ');
    expect(getAvatarInitials('@deniz')).toBe('D');
    expect(getAvatarInitials('🦊')).toBe('');
  });

  it('takes the first grapheme for scripts without initials', () => {
    expect(getAvatarInitials('李小龙')).toBe('李');
    expect(getAvatarInitials('山田 太郎')).toBe('山');
    expect(getAvatarInitials('محمد علي')).toBe('م');
    expect(getAvatarInitials('क्षमा शर्मा')).toBe('क्ष');
    expect(getAvatarInitials('Наталья Петрова')).toBe('НП');
  });

  it('uppercases with the locale', () => {
    expect(getAvatarInitials('ilkay ilhan', 'tr')).toBe('İİ');
    expect(getAvatarInitials('ilkay ilhan', 'en')).toBe('II');
  });
});

describe('Avatar', () => {
  it('shows initials and is named after the person', async () => {
    const screen = await renderWithDS(<Avatar name="Ayşe Demir" />);
    const image = screen.getByRole('img', { name: 'Ayşe Demir' });
    await expect.element(image).toHaveTextContent('AD');
    const root = screen.container.querySelector('[data-slot="avatar"]')!;
    expect(root).toHaveAttribute('data-size', 'md');
    expect(root).toHaveAttribute('data-shape', 'circle');
    expect(root).toHaveAttribute('data-tone', 'neutral');
  });

  it('shows initials on a neutral soft fill by default', async () => {
    const screen = await renderWithDS(<Avatar name="Ayşe Demir" />);
    const style = getComputedStyle(
      visualOf(screen.container.querySelector('[data-slot="avatar"]')!),
    );
    expect(style.backgroundColor).toBe(probe('bg-neutral-soft'));
    expect(style.color).toBe(probe('text-on-surface', 'color'));
    expect(style.fontWeight).toBe('500');
  });

  it('paints a toned fallback with the soft role and its on-role', async () => {
    const screen = await renderWithDS(
      <>
        {(['primary', 'success', 'warning', 'error', 'info'] as const).map((tone) => (
          <Avatar key={tone} name="Ayşe Demir" tone={tone} data-testid={tone} />
        ))}
      </>,
    );
    for (const tone of ['primary', 'success', 'warning', 'error', 'info'] as const) {
      const root = screen.getByTestId(tone).element();
      expect(root).toHaveAttribute('data-tone', tone);
      const style = getComputedStyle(visualOf(root));
      expect(style.backgroundColor).toBe(probe(`bg-${tone}-soft`));
      expect(style.color).toBe(probe(`text-on-${tone}-soft`, 'color'));
    }
  });

  it('sizes the avatar at 24, 32, 40, 48 and 64px with matching initials', async () => {
    const sizes = { xs: [24, 12], sm: [32, 12], md: [40, 14], lg: [48, 16], xl: [64, 20] };
    const screen = await renderWithDS(
      <>
        {Object.keys(sizes).map((size) => (
          <Avatar
            key={size}
            name="Ayşe Demir"
            size={size as keyof typeof sizes}
            data-testid={size}
          />
        ))}
      </>,
    );
    for (const [size, [box, font]] of Object.entries(sizes)) {
      const root = screen.getByTestId(size).element();
      expect(root.getBoundingClientRect().width).toBe(box);
      expect(root.getBoundingClientRect().height).toBe(box);
      expect(getComputedStyle(visualOf(root)).fontSize).toBe(`${font}px`);
    }
  });

  it('rounds the rounded shape by 8px up to 32px and 12px above', async () => {
    const screen = await renderWithDS(
      <>
        <Avatar name="Design team" shape="rounded" size="sm" data-testid="sm" />
        <Avatar name="Design team" shape="rounded" size="md" data-testid="md" />
        <Avatar name="Design team" shape="rounded" size="xl" data-testid="xl" />
      </>,
    );
    expect(getComputedStyle(visualOf(screen.getByTestId('sm').element())).borderTopLeftRadius).toBe(
      '8px',
    );
    expect(getComputedStyle(visualOf(screen.getByTestId('md').element())).borderTopLeftRadius).toBe(
      '12px',
    );
    expect(getComputedStyle(visualOf(screen.getByTestId('xl').element())).borderTopLeftRadius).toBe(
      '12px',
    );
  });

  it('uppercases initials in the current locale', async () => {
    const screen = await renderWithDS(<Avatar name="ilkay şahin" />, { locale: 'tr' });
    await expect.element(screen.getByRole('img', { name: 'ilkay şahin' })).toHaveTextContent('İŞ');
  });

  it('shows the photo once it loads', async () => {
    const screen = await renderWithDS(<Avatar name="Ayşe Demir" src={photo} />);
    const root = screen.container.querySelector('[data-slot="avatar"]')!;
    await expect.poll(() => root.getAttribute('data-image-state')).toBe('loaded');
    expect(root.querySelector('img')).toHaveAttribute('data-loaded');
    expect(root.querySelector('[data-slot="avatar-initials"]')).toBeNull();
    await expect.element(screen.getByRole('img', { name: 'Ayşe Demir' })).toBeVisible();
    expect(getComputedStyle(root.querySelector('img')!).transitionDuration).toBe('0.25s');
  });

  it('falls back to initials when the photo fails', async () => {
    const onError = vi.fn();
    const screen = await renderWithDS(
      <Avatar name="Mehmet Kaya" src={brokenPhoto} imageProps={{ onError }} />,
    );
    const root = screen.container.querySelector('[data-slot="avatar"]')!;
    await expect.poll(() => root.getAttribute('data-image-state')).toBe('error');
    expect(root.querySelector('img')).toBeNull();
    await expect.element(screen.getByRole('img', { name: 'Mehmet Kaya' })).toHaveTextContent('MK');
    expect(onError).toHaveBeenCalledOnce();
  });

  it('starts loading again when src changes', async () => {
    function ProfilePhoto() {
      const [src, setSrc] = useState(brokenPhoto);
      return (
        <>
          <Avatar name="Mehmet Kaya" src={src} />
          <button type="button" onClick={() => setSrc(photo)}>
            Upload photo
          </button>
        </>
      );
    }
    const screen = await renderWithDS(<ProfilePhoto />);
    const root = screen.container.querySelector('[data-slot="avatar"]')!;
    await expect.poll(() => root.getAttribute('data-image-state')).toBe('error');
    await screen.getByRole('button', { name: 'Upload photo' }).click();
    await expect.poll(() => root.getAttribute('data-image-state')).toBe('loaded');
    expect(screen.container.querySelector('[data-slot="avatar"]')).toBe(root);
  });

  it('shows the person glyph without a name and hides itself from assistive tech', async () => {
    const screen = await renderWithDS(<Avatar />);
    const root = screen.container.querySelector('[data-slot="avatar"]')!;
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root).toHaveAttribute('data-tone', 'neutral');
    expect(root.querySelector('[data-slot="avatar-icon"] svg')).not.toBeNull();
  });

  it('names a glyph avatar with alt and accepts a custom icon', async () => {
    const screen = await renderWithDS(<Avatar alt="Design team" fallbackIcon={<GroupIcon />} />);
    await expect.element(screen.getByRole('img', { name: 'Design team' })).toBeVisible();
  });

  it('is decorative with an empty alt', async () => {
    const screen = await renderWithDS(
      <p>
        <Avatar name="Ayşe Demir" alt="" size="xs" /> Ayşe Demir
      </p>,
    );
    expect(screen.container.querySelector('[data-slot="avatar"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(screen.container.querySelectorAll('[role="img"]')).toHaveLength(0);
  });

  it('keeps the status announced when the avatar is decorative', async () => {
    const screen = await renderWithDS(
      <p>
        <Avatar name="Ayşe Demir" alt="" status="busy" /> Ayşe Demir
      </p>,
    );
    const root = screen.container.querySelector('[data-slot="avatar"]')!;
    expect(root).not.toHaveAttribute('aria-hidden');
    expect(root.querySelector('[data-slot="avatar-visual"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(screen.container.querySelectorAll('[role="img"]')).toHaveLength(0);
    await expect.element(screen.getByText('Busy')).toBeInTheDocument();
  });

  it('takes its name from aria-labelledby', async () => {
    const screen = await renderWithDS(
      <figure>
        <Avatar name="Ayşe Demir" aria-labelledby="owner-caption" />
        <figcaption id="owner-caption">Workspace owner</figcaption>
      </figure>,
    );
    await expect.element(screen.getByRole('img', { name: 'Workspace owner' })).toBeVisible();
    expect(screen.container.querySelector('[data-slot="avatar"]')).not.toHaveAttribute(
      'aria-labelledby',
    );
  });

  it('puts the status dot at the bottom-end corner in both directions', async () => {
    for (const locale of ['en', 'ar']) {
      for (const shape of ['circle', 'rounded'] as const) {
        const screen = await renderWithDS(
          <Avatar name="Ayşe Demir" size="xl" shape={shape} status="online" />,
          { locale },
        );
        const root = screen.container.querySelector('[data-slot="avatar"]')!;
        const dot = root.querySelector('[data-slot="avatar-status"]')!;
        const isEndRight = locale === 'en';
        expect(centerX(dot) > centerX(root)).toBe(isEndRight);
        expect(dot.getBoundingClientRect().bottom).toBeGreaterThan(
          root.getBoundingClientRect().top + root.getBoundingClientRect().height * 0.75,
        );
        await screen.unmount();
      }
    }
  });

  it('announces the status in English by default', async () => {
    const screen = await renderWithDS(
      <>
        <Avatar name="Ayşe Demir" status="online" />
        <Avatar name="Mehmet Kaya" status="away" />
        <Avatar name="Elif Şahin" status="busy" />
        <Avatar name="Can Yılmaz" status="offline" />
      </>,
    );
    for (const status of ['Online', 'Away', 'Busy', 'Offline']) {
      await expect.element(screen.getByText(status, { exact: true })).toBeInTheDocument();
    }
    const dots = screen.container.querySelectorAll('[data-slot="avatar-status"]');
    expect(dots[0]).toHaveAttribute('data-status', 'online');
    expect(getComputedStyle(dots[0]).backgroundColor).toBe(probe('bg-success-solid'));
    expect(getComputedStyle(dots[1]).backgroundColor).toBe(probe('bg-warning-solid'));
    expect(getComputedStyle(dots[2]).backgroundColor).toBe(probe('bg-error-solid'));
  });

  it('cuts the status dot out with the canvas, or the colour a container sets', async () => {
    const screen = await renderWithDS(
      <>
        <Avatar name="Ayşe Demir" status="online" data-testid="page" />
        <div className="bg-surface-raised [--ds-avatar-ring:var(--surface-raised)]">
          <Avatar name="Mehmet Kaya" status="online" data-testid="card" />
        </div>
      </>,
    );
    const ring = (id: string) =>
      getComputedStyle(
        screen.getByTestId(id).element().querySelector('[data-slot="avatar-status"]')!,
      ).boxShadow;
    expect(ring('page')).toContain(probe('bg-canvas'));
    expect(ring('card')).toContain(probe('bg-surface-raised'));
  });

  it('takes the status text from labels, then DSProvider, then the English default', async () => {
    const screen = await renderWithDS(
      <>
        <Avatar name="Ayşe Demir" status="online" />
        <Avatar name="Mehmet Kaya" status="busy" labels={{ busy: 'In a meeting until 14:00' }} />
        <AvatarButton name="Elif Şahin" status="away" labels={{ away: 'Back at 15:00' }} />
        <Avatar name="Can Yılmaz" status="offline" />
      </>,
      { provider: { labels: { avatar: { online: 'Çevrimiçi', busy: 'Meşgul' } } } },
    );
    await expect.element(screen.getByText('Çevrimiçi', { exact: true })).toBeInTheDocument();
    await expect
      .element(screen.getByText('In a meeting until 14:00', { exact: true }))
      .toBeInTheDocument();
    await expect.element(screen.getByText('Meşgul', { exact: true })).not.toBeInTheDocument();
    await expect
      .element(screen.getByRole('button', { name: 'Elif Şahin Back at 15:00' }))
      .toBeVisible();
    await expect.element(screen.getByText('Offline', { exact: true })).toBeInTheDocument();
  });
});

describe('AvatarButton', () => {
  it('is a button named after the person and fires onPress', async () => {
    const onPress = vi.fn();
    const screen = await renderWithDS(
      <AvatarButton name="Ayşe Demir" status="away" onPress={onPress} />,
    );
    const button = screen.getByRole('button', { name: 'Ayşe Demir Away' });
    await button.click();
    expect(onPress).toHaveBeenCalledOnce();

    await userEvent.keyboard('{Enter}');
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it('prefers aria-label for the accessible name', async () => {
    const screen = await renderWithDS(
      <AvatarButton name="Ayşe Demir" aria-label="Account menu for Ayşe Demir" />,
    );
    await expect
      .element(screen.getByRole('button', { name: 'Account menu for Ayşe Demir' }))
      .toBeVisible();
  });

  it('does not fire when disabled', async () => {
    const onPress = vi.fn();
    const screen = await renderWithDS(
      <AvatarButton name="Ayşe Demir" isDisabled onPress={onPress} />,
    );
    await screen.getByRole('button', { name: 'Ayşe Demir' }).click({ force: true });
    expect(onPress).not.toHaveBeenCalled();
  });

  it('opens a menu as its trigger', async () => {
    const onAction = vi.fn();
    const screen = await renderWithDS(
      <MenuTrigger>
        <AvatarButton name="Ayşe Demir" aria-label="Account" />
        <Menu onAction={onAction}>
          <MenuItem id="profile">Profile</MenuItem>
          <MenuItem id="sign-out">Sign out</MenuItem>
        </Menu>
      </MenuTrigger>,
    );
    const trigger = screen.getByRole('button', { name: 'Account' });
    await trigger.click();
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
    await page.getByRole('menuitem', { name: 'Sign out' }).click();
    expect(onAction).toHaveBeenCalledOnce();
    expect(onAction.mock.calls[0][0]).toBe('sign-out');
    await expect.element(trigger).toHaveFocus();
  });

  it('shows a neutral overlay on hover, a pointer cursor, and half opacity when disabled', async () => {
    const screen = await renderWithDS(
      <>
        <AvatarButton name="Ayşe Demir" />
        <AvatarButton name="Mehmet Kaya" isDisabled />
      </>,
    );
    const button = screen.getByRole('button', { name: 'Ayşe Demir' });
    const overlay = () => getComputedStyle(button.element(), '::after').backgroundColor;
    expect(getComputedStyle(button.element()).cursor).toBe('pointer');
    expect(overlay()).toBe('rgba(0, 0, 0, 0)');
    await button.hover();
    await expect.poll(overlay).toBe(probe('bg-neutral-soft'));

    const disabled = getComputedStyle(
      screen.getByRole('button', { name: 'Mehmet Kaya' }).element(),
    );
    expect(disabled.opacity).toBe('0.5');
    expect(disabled.cursor).toBe('not-allowed');
  });

  it('drops the press scale when motion is reduced', async () => {
    const screen = await renderWithDS(<AvatarButton name="Ayşe Demir" />, {
      provider: { motion: 'reduced' },
    });
    const button = screen.getByRole('button', { name: 'Ayşe Demir' }).element();
    expect(getComputedStyle(button).transitionProperty).not.toContain('scale');
  });
});

describe('AvatarGroup', () => {
  const team = [
    'Ayşe Demir',
    'Mehmet Kaya',
    'Elif Şahin',
    'Can Yılmaz',
    'Zeynep Arslan',
    'Emre Koç',
  ];

  it('shows max avatars and a labelled overflow avatar', async () => {
    const screen = await renderWithDS(
      <AvatarGroup aria-label="Project approvers" max={3}>
        {team.map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </AvatarGroup>,
    );
    const group = screen.getByRole('group', { name: 'Project approvers' });
    await expect.element(group).toBeVisible();
    expect(group.element().querySelectorAll('[data-slot="avatar-group-item"]')).toHaveLength(4);
    await expect.element(screen.getByRole('img', { name: 'Ayşe Demir' })).toBeVisible();
    await expect.element(screen.getByRole('img', { name: 'Can Yılmaz' })).not.toBeInTheDocument();
    await expect.element(screen.getByRole('img', { name: '3 more' })).toHaveTextContent('+3');
  });

  it('overlaps each avatar by a quarter of its size and seams it with a ring', async () => {
    const screen = await renderWithDS(
      <AvatarGroup aria-label="Team" size="md">
        <Avatar name="Ayşe Demir" />
        <Avatar name="Mehmet Kaya" />
      </AvatarGroup>,
    );
    const group = screen.getByRole('group', { name: 'Team' }).element();
    expect(group).toHaveAttribute('data-seam', 'ring');
    const [first, second] = group.querySelectorAll('[data-slot="avatar-group-item"]');
    expect(second.getBoundingClientRect().left - first.getBoundingClientRect().left).toBeCloseTo(
      30,
      0,
    );
    expect(getComputedStyle(first).boxShadow).toContain(probe('bg-canvas'));
    expect(getComputedStyle(second).backgroundColor).toBe(probe('bg-canvas'));
    expect(getComputedStyle(first).maskImage).toBe('none');
  });

  it('cuts a transparent seam with a mask when seam is clip', async () => {
    for (const locale of ['en', 'ar']) {
      for (const shape of ['circle', 'rounded'] as const) {
        const screen = await renderWithDS(
          <AvatarGroup aria-label="Team" size="md" shape={shape} seam="clip" max={2}>
            <Avatar name="Ayşe Demir" />
            <Avatar name="Mehmet Kaya" />
            <Avatar name="Elif Şahin" />
          </AvatarGroup>,
          { locale },
        );
        const group = screen.getByRole('group', { name: 'Team' }).element();
        expect(group).toHaveAttribute('data-seam', 'clip');
        const items = [...group.querySelectorAll('[data-slot="avatar-group-item"]')];
        expect(items).toHaveLength(3);
        const gradient = shape === 'circle' ? 'radial-gradient' : 'linear-gradient';
        for (const item of items.slice(0, -1)) {
          expect(getComputedStyle(item).maskImage).toContain(gradient);
          expect(getComputedStyle(item).boxShadow).toBe('none');
        }
        expect(getComputedStyle(items.at(-1)!).maskImage).toBe('none');
        await screen.unmount();
      }
    }
  });

  it('lifts the mask off a focused avatar so its focus ring shows', async () => {
    const screen = await renderWithDS(
      <>
        <button type="button">Before</button>
        <AvatarGroup aria-label="Assign to" seam="clip">
          <AvatarButton name="Ayşe Demir" />
          <AvatarButton name="Mehmet Kaya" />
        </AvatarGroup>
      </>,
    );
    await screen.getByRole('button', { name: 'Before' }).click();
    await userEvent.keyboard('{Tab}');
    const first = screen.getByRole('button', { name: 'Ayşe Demir' });
    await expect.element(first).toHaveFocus();
    const item = first.element().closest('[data-slot="avatar-group-item"]')!;
    expect(getComputedStyle(item).maskImage).toBe('none');
    expect(Number(getComputedStyle(item).zIndex)).toBeGreaterThan(0);
  });

  it('passes its size and shape to every avatar', async () => {
    const screen = await renderWithDS(
      <AvatarGroup size="lg" shape="rounded">
        <Avatar name="Ayşe Demir" />
        <Avatar name="Mehmet Kaya" />
      </AvatarGroup>,
    );
    for (const avatar of screen.container.querySelectorAll('[data-slot="avatar"]')) {
      expect(avatar).toHaveAttribute('data-size', 'lg');
      expect(avatar).toHaveAttribute('data-shape', 'rounded');
    }
    expect(screen.container.querySelector('[data-slot="avatar-overflow"]')).toBeNull();
  });

  it('counts the overflow from total', async () => {
    const screen = await renderWithDS(
      <AvatarGroup total={1284} max={2}>
        <Avatar name="Ayşe Demir" />
        <Avatar name="Mehmet Kaya" />
      </AvatarGroup>,
    );
    await expect.element(screen.getByRole('img', { name: '1,282 more' })).toHaveTextContent('99+');
  });

  it('shows no overflow avatar when everyone fits', async () => {
    const screen = await renderWithDS(
      <AvatarGroup max={4} total={2}>
        <Avatar name="Ayşe Demir" />
        <Avatar name="Mehmet Kaya" />
        <Avatar name="Elif Şahin" />
      </AvatarGroup>,
    );
    expect(screen.container.querySelectorAll('[data-slot="avatar-group-item"]')).toHaveLength(3);
    expect(screen.container.querySelector('[data-slot="avatar-overflow"]')).toBeNull();
  });

  it('stacks from the start edge in both directions', async () => {
    for (const locale of ['en', 'ar']) {
      const screen = await renderWithDS(
        <AvatarGroup max={2}>
          <Avatar name="Ayşe Demir" />
          <Avatar name="Mehmet Kaya" />
          <Avatar name="Elif Şahin" />
        </AvatarGroup>,
        { locale },
      );
      const [first, second, overflow] = screen.container.querySelectorAll(
        '[data-slot="avatar-group-item"]',
      );
      const forward = locale === 'en' ? 1 : -1;
      expect(Math.sign(centerX(second) - centerX(first))).toBe(forward);
      expect(Math.sign(centerX(overflow) - centerX(second))).toBe(forward);
      expect(Math.abs(centerX(second) - centerX(first))).toBeLessThan(
        (first as HTMLElement).offsetWidth,
      );
      expect(overflow.querySelector('[data-slot="avatar"]')).toHaveAttribute(
        'data-tone',
        'neutral',
      );
      await screen.unmount();
    }
  });

  it('plays the entrance only when spatial motion is on', async () => {
    const approvers = team.slice(0, 3);
    const animated = await renderWithDS(
      <AvatarGroup>
        {approvers.map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </AvatarGroup>,
    );
    const items = animated.container.querySelectorAll<HTMLElement>(
      '[data-slot="avatar-group-item"]',
    );
    expect(items[2].style.transitionDelay).toBe('90ms');
    expect(getComputedStyle(items[0]).transitionProperty).toContain('scale');
    await animated.unmount();

    const still = await renderWithDS(
      <AvatarGroup>
        {approvers.map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </AvatarGroup>,
      { provider: { motion: 'reduced' } },
    );
    const stillItem = still.container.querySelector<HTMLElement>(
      '[data-slot="avatar-group-item"]',
    )!;
    expect(stillItem.style.transitionDelay).toBe('');
    expect(getComputedStyle(stillItem).transitionDuration).toBe('0s');
  });

  it('takes the overflow text from labels, then DSProvider, then the English default', async () => {
    const screen = await renderWithDS(
      <>
        <AvatarGroup
          aria-label="Project approvers"
          max={1}
          labels={{ more: ({ count }) => `${count} more approvers` }}
        >
          <Avatar name="Ayşe Demir" />
          <Avatar name="Mehmet Kaya" />
          <Avatar name="Elif Şahin" />
        </AvatarGroup>
        <AvatarGroup aria-label="Members of #general" total={1284} max={1}>
          <Avatar name="Zeynep Arslan" />
        </AvatarGroup>
        <AvatarGroup aria-label="Reviewers" max={1} labels={{ more: '{count} more' }}>
          <Avatar name="Can Yılmaz" />
          <Avatar name="Emre Koç" />
        </AvatarGroup>
      </>,
      { provider: { labels: { avatar: { more: '{count} kişi daha', overflowCap: '+{max}' } } } },
    );
    await expect
      .element(screen.getByRole('img', { name: '2 more approvers' }))
      .toHaveTextContent('+2');
    await expect
      .element(screen.getByRole('img', { name: '1,283 kişi daha' }))
      .toHaveTextContent('+99');
    await expect.element(screen.getByRole('img', { name: '1 more' })).toHaveTextContent('+1');
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
              <Avatar key={size} name="Ayşe Demir" size={size} />
            ))}
            <Avatar name="Mehmet Kaya" shape="rounded" status="busy" />
            <Avatar name="Emre Koç" status="away" />
            {(['primary', 'success', 'warning', 'error', 'info'] as const).map((tone) => (
              <Avatar key={tone} name="Elif Şahin" tone={tone} />
            ))}
            <Avatar name="Elif Şahin" status="online" shape="rounded" size="xs" />
            <Avatar name="Can Yılmaz" tone="neutral" status="offline" />
            <Avatar alt="Design team" fallbackIcon={<GroupIcon />} />
            <Avatar name="Zeynep Arslan" src={photo} />
            <Avatar name="Selin Aydın" alt="" status="away" />
            <AvatarButton name="Ayşe Demir" status="online" />
            <AvatarButton name="Burak Öztürk" isDisabled />
          </div>
          <AvatarGroup aria-label="Project approvers" max={3} size="md">
            {team.map((name) => (
              <Avatar key={name} name={name} />
            ))}
          </AvatarGroup>
          <AvatarGroup aria-label="Reviewers" max={2} size="xs" seam="clip">
            {team.map((name) => (
              <Avatar key={name} name={name} />
            ))}
          </AvatarGroup>
        </div>,
        options,
      );
      await settleAnimations();
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
