# Roadmap

Every component planned for the library, grouped into waves. A wave is built in parallel, one agent
per row, each followed by an independent review. References point at `docs/research/libraries.json`
entries and the Compose library; read them before designing.

Status: ✅ built and reviewed · 🚧 in progress · ⬜ planned

## Wave 0 — Foundations

| Item                                               | Status | Notes                                                                            |
| -------------------------------------------------- | ------ | -------------------------------------------------------------------------------- |
| Tokens from one seed                               | ✅     | MaterialKolor-identical scheme, 3 contrast levels, spring `linear()`             |
| `theme.css`                                        | ✅     | Roles, type scale, shapes, elevation, state layer, focus ring, overlay keyframes |
| `utils`, `i18n`, `motion`, `color-scheme`, `icons` | ✅     | 115 Material Symbols Rounded glyphs                                              |
| `DSProvider`                                       | ✅     | Locale, router, messages, icons, motion preference                               |
| Hooks                                              | ✅     | `useControllableState`, `useMediaQuery`, `useLocalStorageState`                  |
| Dynamic colour                                     | 🚧     | `DynamicTheme` (subtree or page), seeds from images, cached boot script, review  |
| Button, ButtonLink                                 | ✅     | Reference implementation                                                         |
| Catalogue, registry, `check-ds`, browser tests     | ✅     | Fumadocs static export, axe in light/dark/RTL                                    |

## Wave 1 — Core primitives

| Component(s)                                   | Category     | Built on (RAC)                         | References                                                        |
| ---------------------------------------------- | ------------ | -------------------------------------- | ----------------------------------------------------------------- |
| IconButton, Fab, ExtendedFab                   | actions      | Button, ToggleButton                   | DSIcon, DSFab; Astryx IconButton; M3 icon buttons                 |
| ButtonGroup, ToggleButton, ToggleButtonGroup   | actions      | Group, ToggleButton, ToggleButtonGroup | DSButtonGroup; Astryx ButtonGroup/SizeContext; M3 connected group |
| Link, CopyButton                               | actions      | Link, Button                           | Astryx LinkProvider idea                                          |
| Field parts, TextField, TextArea               | inputs       | TextField, Input, TextArea, Label      | Astryx Field contract; BoardUI Input; M3 filled/outlined fields   |
| SearchField, PasswordField                     | inputs       | SearchField, TextField                 | DSSearchField; teli password-input                                |
| NumberField (stepper / counter)                | inputs       | NumberField                            | Astryx NumberInput, BoardUI NumberField, Bencho rolling counter   |
| Checkbox, CheckboxGroup, RadioGroup, Switch    | inputs       | Checkbox, RadioGroup, Switch           | DSCheckbox, DSRadioButton; BoardUI SwitchCard                     |
| Slider, RangeSlider                            | inputs       | Slider                                 | M3 sliders                                                        |
| ListBox, Select, ComboBox                      | inputs       | ListBox, Select, ComboBox, Popover     | DSDropdown; Astryx Selector/Typeahead; EasyUI Combobox keywords   |
| Tabs, SegmentedControl                         | navigation   | Tabs, ToggleButtonGroup                | BoardUI SegmentedControl measured thumb; M3 tabs                  |
| Dialog, AlertDialog                            | overlays     | Dialog, Modal, ModalOverlay            | DSDialog; BoardUI AlertDialog async onConfirm                     |
| Sheet (side, bottom, top)                      | overlays     | Modal, Dialog                          | DSBottomSheet; HeroUI Sheet snap points; EasyUI Sheet thresholds  |
| Popover, Tooltip                               | overlays     | Popover, Tooltip                       | React Bits warm tooltip group (idea only)                         |
| Menu                                           | overlays     | Menu, MenuTrigger, SubmenuTrigger      | DSDropdown; Astryx DropdownMenu                                   |
| Toast                                          | feedback     | UNSTABLE_Toast / own queue             | DSMessageHost; HeroUI/BoardUI toast(); Bencho toast stack         |
| Badge, Chip                                    | feedback     | TagGroup for chips                     | DSBadge, DSChip; M3 chips                                         |
| Avatar, AvatarGroup                            | data-display | —                                      | DSAvatar, DSAvatarGroup                                           |
| ProgressBar, ProgressCircle, Spinner, Skeleton | feedback     | ProgressBar, Meter                     | DSProgress, DSLoadingIndicator                                    |
| Card, ClickableCard, SelectableCard, Divider   | layout       | Link, Checkbox, Separator              | DSCard; Astryx card trio; HeroUI SurfaceContext                   |
| Disclosure, Accordion                          | layout       | Disclosure, DisclosureGroup            | DSExpandableItem                                                  |
| Banner (inline message), EmptyState            | feedback     | —                                      | DSInlineMessage, DSAnnouncement, screen states                    |
| Kbd, TagGroup                                  | data-display | TagGroup                               | Astryx Kbd, Tokenizer                                             |
| Theme builder page                             | catalogue    | —                                      | `brandColors` at runtime                                          |

## Wave 2 — Dates, data and navigation

| Component(s)                                      | Category     | Built on                               |
| ------------------------------------------------- | ------------ | -------------------------------------- |
| Calendar, RangeCalendar                           | date-time    | Calendar, RangeCalendar                |
| DateField, TimeField, DatePicker, DateRangePicker | date-time    | DatePicker, DateRangePicker, DateField |
| OtpField                                          | inputs       | own, single hidden input (Bencho idea) |
| TagField / MultiSelect                            | inputs       | ComboBox + TagGroup                    |
| CommandPalette                                    | navigation   | Autocomplete, Dialog                   |
| ColorPicker, ColorArea, ColorSlider, ColorSwatch  | inputs       | Color* components                      |
| FileDropzone, FileList                            | inputs       | DropZone, FileTrigger                  |
| Rating                                            | inputs       | RadioGroup                             |
| Table                                             | data-display | Table, ResizableTableContainer         |
| DataTable (sorting, filters, pagination, columns) | data-display | TanStack Table + Table                 |
| Pagination, Breadcrumbs                           | navigation   | Breadcrumbs, Button                    |
| Sidebar, NavigationRail                           | navigation   | Disclosure, Link                       |
| NavigationBar (bottom), TopAppBar, Toolbar        | navigation   | Toolbar, Link                          |
| Stepper (wizard steps)                            | navigation   | —                                      |
| GridList (list with actions), Tree                | data-display | GridList, Tree                         |
| Carousel                                          | layout       | scroll-snap                            |
| Timeline, DescriptionList                         | data-display | —                                      |
| StatCard, AnimatedNumber                          | data-display | NumberFlow                             |
| Meter, StatusDot                                  | feedback     | Meter                                  |
| SplitButton                                       | actions      | Button + Menu                          |
| Form (validation, sections, actions)              | inputs       | Form                                   |

## Wave 3 — Expressive

HoldToConfirmButton, SlideToConfirm, DynamicIsland (live activity), RollingCounter, Marquee,
SplitText / Typewriter / ShinyText / GradientText, SpotlightCard, ShineBorder / BorderBeam,
MagneticButton, Reveal (`data-reveal`), ScrollProgress, LoadingIndicator (M3 Expressive morphing
shapes), DotGrid / GradientMesh / Aurora backgrounds, Confetti, ThemeToggle with view transitions,
TiltCard, LiquidSwitch variant, UndoToast.

## Wave 4 — Blocks and page templates

AppShell (sidebar + top bar), DashboardOverview, DataTablePage, SettingsPage, SignIn, SignUp,
OtpVerification, ForgotPassword, AccountMenu, ActiveSessions, NotificationsPanel, SupportInbox,
FeedbackForm, DeleteAccount, Pricing, Faq, Hero, FeatureGrid, Cta, Footer, NotFound, EmptyStates,
KanbanBoard, OnboardingSteps, LegalPage with table of contents.

## Wave 5 — Distribution

Public GitHub registry, `public/r` on a static host, shadcn MCP setup, `llms.txt`, a Claude skill
consumers install, `THIRD_PARTY_NOTICES.md` from item credits, visual baselines in a Linux
container, and cosum-web as the first consumer.
