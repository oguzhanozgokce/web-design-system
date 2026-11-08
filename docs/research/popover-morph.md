# Morph popover

Reviewed on 2026-11-08. The [beUI popover demos](https://beui.dev/components/motion/popover)
informed the unfolding surface and the press/hover examples. The
[center morph modal](https://beui.dev/components/motion/center-morph-modal) is a separate dialog
pattern and is outside this change.

## Implementation decisions

- Extend `Popover` with `animation="morph"`; preserve its default scale animation and existing
  consumers. A separate component or registry package would duplicate the overlay contract.
- Animate a pseudo-element with transform and opacity while content fades at its natural size.
  Avoid SVG goo filters, blur, per-frame React state and additional animation dependencies.
- Use [React Aria Popover](https://react-aria.adobe.com/Popover)'s actual trigger anchor,
  collision handling and RTL positioning. Fade the root over the same duration so its animation
  lifecycle waits for the pseudo-element and content animations: React Aria only observes
  animations on the root itself. A browser regression verifies real enter and exit completion.
- Export `PopoverPreviewTrigger` around the installed
  [React Aria PreviewTrigger](https://react-aria.adobe.com/PreviewTrigger). Share the existing
  disabled/controlled-state wrapper with RichTooltip, keeping its timing defaults unchanged.
- Preview content uses ordinary elements and an accessible name on `Popover`. Nesting a
  `PopoverDialog` would move focus on mount, which is inappropriate for a hover preview.
- The preview example also opens on tap and keeps React Aria's keyboard and long-press behaviour.
  Its image is one of this project's procedural sample scenes.
- Reduced motion uses a fade; disabled motion is immediate. The content wrapper stays mounted
  when the motion preference changes, preserving consumer state.

## Verification scope

Browser regressions cover the animated surface, unscaled content, exit completion, provider motion
preferences, non-modal focus, compact-viewport overflow and accessibility. RichTooltip's existing
tests cover the shared preview wrapper. Visual checks use the actual catalogue examples.

Emulated mobile checks are not measurements on a physical phone.

A local Chromium diagnostic at 375×667 with touch input and 4× CPU throttling exercised both
catalogue examples through repeated open/close cycles. Frame intervals had a 16.7ms median and
16.8ms or better 95th percentile. The preferences example still incurred 52–60ms main-thread
tasks during mounting under this throttle; the simpler preview recorded none. This is a local
diagnostic, not a device-independent frame-rate guarantee or a timing threshold in CI.

## Provenance

The demos informed the interaction direction; no beUI code was copied or adapted. The CSS animation
and component composition were written for this repository.
