import { useState } from 'react';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { GroupIcon } from '@/registry/ds/lib/icons';
import {
  Avatar,
  AvatarButton,
  AvatarGroup,
  getAvatarInitials,
  getAvatarTone,
} from '@/registry/ds/ui/avatar';
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

describe('getAvatarInitials', () => {
  it('takes the first and last word', () => {
    expect(getAvatarInitials('Ayşe Nur Demir')).toBe('AD');
    expect(getAvatarInitials('  mehmet   kaya ')).toBe('MK');
  });

  it('takes one grapheme for a single name', () => {
    expect(getAvatarInitials('Madonna')).toBe('M');
  });

  it('skips words that do not start with a letter or digit', () => {
    expect(getAvatarInitials('Elif Şahin (Finance)')).toBe('EŞ');
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

describe('getAvatarTone', () => {
  it('matches the Compose library for the same name', () => {
    expect(getAvatarTone('Ayşe Demir')).toBe('primary');
    expect(getAvatarTone('Mehmet Kaya')).toBe('secondary');
    expect(getAvatarTone('Emre Koç')).toBe('tertiary');
  });

  it('ignores case and surrounding whitespace', () => {
    expect(getAvatarTone(' ayşe demir ')).toBe(getAvatarTone('Ayşe Demir'));
  });
});

describe('Avatar', () => {
  it('shows initials and is named after the person', async () => {
    const screen = await renderWithDS(<Avatar name="Ayşe Demir" />);
    const image = screen.getByRole('img', { name: 'Ayşe Demir' });
    await expect.element(image).toHaveTextContent('AD');
    const root = screen.container.querySelector('[data-slot="avatar"]');
    expect(root).toHaveAttribute('data-size', 'md');
    expect(root).toHaveAttribute('data-shape', 'circle');
    expect(root).toHaveAttribute('data-tone', 'primary');
  });

  it('uses the tone prop over the name', async () => {
    const screen = await renderWithDS(<Avatar name="Ayşe Demir" tone="tertiary" />);
    expect(screen.container.querySelector('[data-slot="avatar"]')).toHaveAttribute(
      'data-tone',
      'tertiary',
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
    const screen = await renderWithDS(<Avatar alt="Finance team" fallbackIcon={<GroupIcon />} />);
    await expect.element(screen.getByRole('img', { name: 'Finance team' })).toBeVisible();
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
    expect(screen.container.querySelector('[data-slot="avatar-status"]')).toHaveAttribute(
      'data-status',
      'online',
    );
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
        <AvatarGroup aria-label="Members of #finance" total={1284} max={1}>
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
            <Avatar name="Elif Şahin" tone="secondary" status="online" />
            <Avatar name="Can Yılmaz" tone="neutral" status="offline" />
            <Avatar alt="Finance team" fallbackIcon={<GroupIcon />} />
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
        </div>,
        options,
      );
      await settleAnimations();
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
