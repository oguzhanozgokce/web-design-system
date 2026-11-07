# Roadmap

Every component planned for the library, grouped into waves. Coordinate ownership when a wave is
explicitly assigned to parallel agents. References point at `docs/research/libraries.json`
entries and `docs/research/web-style.md`; read them before designing.

Status: ✅ built and reviewed · 🚧 in progress · ⬜ planned

## Wave 0 — Foundations

| Item                                                 | Status | Notes                                                                           |
| ---------------------------------------------------- | ------ | ------------------------------------------------------------------------------- |
| Tokens from one seed                                 | ✅     | Generated scheme, neutral layers, 3 contrast levels, spring `linear()`          |
| `theme.css`                                          | ✅     | Roles, solid and soft fills, radius families, shadows, focus ring, keyframes    |
| `utils`, `labels`, `motion`, `color-scheme`, `icons` | ✅     | 115 Material Symbols Rounded glyphs                                             |
| `DSProvider`                                         | ✅     | Locale, router, labels, icons, motion preference                                |
| Hooks                                                | ✅     | `useControllableState`, `useMediaQuery`, `useLocalStorageState`                 |
| Dynamic colour                                       | 🚧     | `DynamicTheme` (subtree or page), seeds from images, cached boot script, review |
| Button, ButtonLink                                   | ✅     | Reference implementation                                                        |
| Catalogue, registry, `check-ds`, browser tests       | ✅     | Fumadocs static export, axe in light/dark/RTL                                   |

## Wave 1 — Core primitives

| Component(s)                                   | Category     | Built on (RAC)                         | References                                                      |
| ---------------------------------------------- | ------------ | -------------------------------------- | --------------------------------------------------------------- |
| IconButton, Fab, ExtendedFab                   | actions      | Button, ToggleButton                   | Astryx IconButton; HeroUI button and FAB geometry               |
| ButtonGroup, ToggleButton, ToggleButtonGroup   | actions      | Group, ToggleButton, ToggleButtonGroup | Astryx ButtonGroup/SizeContext; HeroUI attached groups          |
| Link, CopyButton                               | actions      | Link, Button                           | Astryx LinkProvider idea                                        |
| Field parts, TextField, TextArea               | inputs       | TextField, Input, TextArea, Label      | Astryx Field contract; BoardUI Input; HeroUI field variants     |
| SearchField, PasswordField                     | inputs       | SearchField, TextField                 | Astryx SearchInput; teli password-input                         |
| NumberField (stepper / counter)                | inputs       | NumberField                            | Astryx NumberInput, BoardUI NumberField, Bencho rolling counter |
| Checkbox, CheckboxGroup, RadioGroup, Switch    | inputs       | Checkbox, RadioGroup, Switch           | HeroUI control motion; BoardUI SwitchCard                       |
| Slider, RangeSlider                            | inputs       | Slider                                 | Astryx thin rail; HeroUI thumb                                  |
| ListBox, Select, ComboBox                      | inputs       | ListBox, Select, ComboBox, Popover     | Astryx Selector/Typeahead; EasyUI Combobox keywords             |
| Tabs, SegmentedControl                         | navigation   | Tabs, ToggleButtonGroup                | BoardUI SegmentedControl measured thumb; Astryx tabs            |
| Dialog, AlertDialog                            | overlays     | Dialog, Modal, ModalOverlay            | HeroUI modal; BoardUI AlertDialog async onConfirm               |
| Sheet (side, bottom, top)                      | overlays     | Modal, Dialog                          | HeroUI Sheet snap points; EasyUI Sheet thresholds               |
| Popover, Tooltip                               | overlays     | Popover, Tooltip                       | React Bits warm tooltip group (idea only)                       |
| Menu                                           | overlays     | Menu, MenuTrigger, SubmenuTrigger      | Astryx DropdownMenu; HeroUI dropdown                            |
| Toast                                          | feedback     | UNSTABLE_Toast / own queue             | HeroUI/BoardUI toast(); Bencho toast stack                      |
| Badge, Chip                                    | feedback     | TagGroup for chips                     | Astryx Badge; HeroUI chip                                       |
| Avatar, AvatarGroup                            | data-display | —                                      | Astryx Avatar overlap; HeroUI avatar-group clip                 |
| ProgressBar, ProgressCircle, Spinner, Skeleton | feedback     | ProgressBar, Meter                     | HeroUI progress and skeleton                                    |
| Card, ClickableCard, SelectableCard, Divider   | layout       | Link, Checkbox, Separator              | Astryx card trio                                                |
| Disclosure, Accordion                          | layout       | Disclosure, DisclosureGroup            | HeroUI accordion surface                                        |
| Banner (inline message), EmptyState            | feedback     | —                                      | Astryx Banner and EmptyState                                    |
| Kbd, TagGroup                                  | data-display | TagGroup                               | Astryx Kbd, Tokenizer                                           |
| Theme builder page                             | catalogue    | —                                      | `brandColors` at runtime                                        |

## Wave 2 — Dates, data and navigation

The four references the owner asked for on 2026-11-06 (Bencho's stacked bars, upload dropzone,
rolling counter and dynamic island; BoardUI's data table and earnings chart card) were built first,
on 2026-11-07. `docs/research/wave-2-requests.md` has the visual study and the decisions.

| Component(s)                                                                        | Category     | Built on                               | Status |
| ----------------------------------------------------------------------------------- | ------------ | -------------------------------------- | ------ |
| Calendar, RangeCalendar                                                             | date-time    | Calendar, RangeCalendar                | ⬜     |
| DateField, TimeField, DatePicker, DateRangePicker                                   | date-time    | DatePicker, DateRangePicker, DateField | ⬜     |
| OtpField                                                                            | inputs       | own, single hidden input (Bencho idea) | ⬜     |
| TagField / MultiSelect                                                              | inputs       | ComboBox + TagGroup                    | ⬜     |
| CommandPalette                                                                      | navigation   | Autocomplete, Dialog                   | ⬜     |
| ColorPicker, ColorArea, ColorSlider, ColorSwatch                                    | inputs       | Color* components                      | ⬜     |
| FileDropzone, FileList, FileUpload (after Bencho's upload dropzone)                 | inputs       | DropZone, FileTrigger, GridList        | ✅     |
| NumberField compact layout, RollingNumber (after Bencho's rolling counter)          | inputs       | NumberField, own odometer              | ✅     |
| Rating                                                                              | inputs       | RadioGroup                             | ⬜     |
| Table, StatusTag, StatusDot                                                         | data-display | Table, Tag                             | ✅     |
| DataTable (after BoardUI's data table; no TanStack)                                 | data-display | Table, Pagination, lib/data-table      | ✅     |
| Pagination                                                                          | navigation   | Button, IconButton                     | ✅     |
| Breadcrumbs                                                                         | navigation   | Breadcrumbs                            | ⬜     |
| Sidebar, NavigationRail                                                             | navigation   | Disclosure, Link                       | ⬜     |
| NavigationBar (bottom), TopAppBar, Toolbar                                          | navigation   | Toolbar, Link                          | ⬜     |
| Stepper (wizard steps)                                                              | navigation   | —                                      | ⬜     |
| GridList (list with actions), Tree                                                  | data-display | GridList, Tree                         | ⬜     |
| Carousel                                                                            | layout       | scroll-snap                            | ⬜     |
| Timeline, DescriptionList                                                           | data-display | —                                      | ⬜     |
| StatCard                                                                            | data-display | Card, RollingNumber, Sparkline         | ⬜     |
| Chart, BarChart, LineChart, AreaChart, Sparkline, ChartCard (Bencho, BoardUI ideas) | charts       | hand-written SVG and HTML, lib/chart   | ✅     |
| DynamicIsland, ActivityBars; the stats island is an example, not a prop             | feedback     | RAC Button, motion                     | ✅     |
| Meter                                                                               | feedback     | Meter                                  | ⬜     |
| SplitButton                                                                         | actions      | Button + Menu                          | ⬜     |
| Form (validation, sections, actions)                                                | inputs       | Form                                   | ⬜     |

Not built from the proposals: DataTable column visibility, column resizing, a rows-per-page select
and virtualised rows; keyboard sort shortcuts; a bottom-of-viewport selection bar on phones.

## Wave 3 — Motion and micro-interactions

HoldToConfirmButton, SlideToConfirm, Marquee, SplitText / Typewriter / ShinyText / GradientText,
SpotlightCard, ShineBorder / BorderBeam, MagneticButton, Reveal (`data-reveal`), ScrollProgress,
LoadingIndicator (morphing shapes), DotGrid / GradientMesh / Aurora backgrounds, Confetti,
ThemeToggle with view transitions, TiltCard, LiquidSwitch variant, UndoToast. DynamicIsland and the
rolling counter moved into wave 2.

## Wave 4 — Blocks and page templates

AppShell (sidebar + top bar), DashboardOverview, DataTablePage, SettingsPage, SignIn, SignUp,
OtpVerification, ForgotPassword, AccountMenu, ActiveSessions, NotificationsPanel, SupportInbox,
FeedbackForm, DeleteAccount, Pricing, Faq, Hero, FeatureGrid, Cta, Footer, NotFound, EmptyStates,
KanbanBoard, OnboardingSteps, LegalPage with table of contents.

## Wave 5 — Distribution

Public GitHub registry, `public/r` on a static host, shadcn MCP setup, `llms.txt`, a Claude skill
consumers install, `THIRD_PARTY_NOTICES.md` from item credits, visual baselines in a Linux
container, and a first consuming application.
