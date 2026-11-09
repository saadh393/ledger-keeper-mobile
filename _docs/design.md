# Ledger Keeper Mobile — Design

The mobile app uses the **same design system as the web app**. The full cross-platform specification lives in the web repository at `frontend/DESIGN_SYSTEM.md` and wins if anything here disagrees. This file is the mobile summary: the tokens to implement, how web patterns map to touch, and the screens.

---

## 1. Principles

1. **Ledger first, AI as input.** The book's ledger is the home screen. The AI bar is always at the bottom; results appear in the Assistant sheet as cards.
2. **Calm, Gemini-inspired surfaces.** Neutral canvas, soft rounded containers, no heavy borders. Color is reserved for meaning.
3. **Colors carry meaning.** Blue = action, info, AI. Green = income. Red = expense, destructive, error. Yellow = needs attention. Never decorative.
4. **Money is precise.** Signed amounts (`+` / `−` U+2212), tabular figures, book currency, Asia/Dhaka dates.
5. **Honest UI.** No fake controls or placeholder data shown as real.
6. **Every state is designed.** Idle, pressed, focused, disabled, pending, success, error, empty, loading.

---

## 2. Web → mobile mapping

| Web | Mobile |
| --- | --- |
| 1 CSS px | 1 dp / pt |
| Tailwind spacing `1` | 4 |
| Sidebar | Left navigation drawer, width 288 (max 100% of screen) |
| Assistant side panel | Bottom sheet (`@gorhom/bottom-sheet`): 60% height, drag to full screen |
| Popover / dropdown | Bottom sheet or anchored menu |
| Modal dialog | Bottom sheet, full width, top corners 28 |
| Hover-revealed actions | Always visible, or long-press menu |
| Right-click context menu | Long-press (450 ms) menu |
| Desktop table | `LedgerRow` list (FlashList) |
| `prefers-reduced-motion` | Android "Remove animations" / iOS "Reduce Motion" |
| Theme | Explicit user choice, **dark by default**, stored on the device. Not the system setting |

---

## 3. Color tokens

Implement as two theme objects (light, dark) exposed through Tailwind/Uniwind CSS variables. Components use tokens only, never raw hex.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `paper-100` (background) | `#ffffff` | `#131314` | Screen background |
| `paper-200` | `#f0f4f9` | `#282a2c` | User bubble, pressed fill, chips |
| `surface` | `#ffffff` | `#1e1f20` | Sheets, menus |
| `surface-container` | `#f0f4f9` | `#1e1f20` | Cards, AI bar, drawer |
| `border` | `#e3e6ea` | `#333537` | Dividers |
| `border-strong` | `#c4c7c5` | `#444746` | Focused field outline |
| `ink-900` | `#1f1f1f` | `#e3e3e3` | Primary text |
| `ink-700` | `#444746` | `#c4c7c5` | Secondary text |
| `ink-500` | `#575b5f` | `#a8abaf` | Labels, meta |
| `accent` / `on-accent` | `#1a73e8` / `#ffffff` | `#8ab4f8` / `#062e6f` | Primary buttons |
| `link` | `#1a73e8` | `#8ab4f8` | Links, focus, selection |
| `selected` / `on-selected` | `#d3e3fd` / `#041e49` | `#1f3760` / `#d3e3fd` | Active nav row, pressed toggles |
| `forest-500` | `#188038` | `#81c995` | Income amounts |
| `forest-100` | `#ceead6` | `#0f2e1a` | Income tint |
| `clay-500` | `#d93025` | `#f28b82` | Expense amounts, destructive |
| `clay-100` | `#fce8e6` | `#3c1714` | Expense/error tint |
| `wheat-500` | `#f9ab00` | `#fdd663` | Warnings, drafts |
| `wheat-200` | `#fef7e0` | `#3a2f0b` | Warning tint |

Brand hues (logo, gradient text, category colors): blue `#4285f4`, green `#34a853`, yellow `#fbbc04`, red `#ea4335` (lighter in dark: `#8ab4f8`, `#81c995`, `#fdd663`, `#f28b82`). Brand gradient: blue → green → yellow → red.

---

## 4. Typography

- **Typeface:** Manrope (400, 500, 600, 700). Replace the template's Inter. Bangla text uses Noto Sans Bengali at the same sizes.
- **Numbers:** every amount, count, date and percentage uses tabular figures (`fontVariant: ['tabular-nums']`).
- Sentence case everywhere. Support font scaling; containers grow, important text never clips.

| Style | Size | Weight | Use |
| --- | --- | --- | --- |
| Headline | 28–32 | 500 | Auth title, summary net |
| Title | 18–20 | 500 | Screen and sheet titles |
| Hero amount | 20–22 | 600 | Single-transaction amount |
| Body L | 16 | 400 | AI bar input (16 stops iOS zoom) |
| Body | 15 | 400 | Chat text, card body |
| Row title | 14–15 | 500 | List titles, buttons, menu items |
| Label | 13 | 500 | Card headers, chips, tabs |
| Meta | 12 | 400 | Secondary lines, captions |

---

## 5. Spacing, shape, elevation, motion

- **Spacing:** base 4; screen gutter 16; card padding 16 × 12–16; related items 8–12, groups 16–24.
- **Radius:** fields 12 · rows, tiles and the summary strip 16 · cards and menus 24 · sheets 28 · AI bar 32 · buttons, chips and avatars full.
- **Elevation:** mostly flat. Android elevation 1 (raised segment), 4 (menus), 12 (sheets). Sheet scrim `rgba(0,0,0,0.5)`, drawer scrim `0.4`.
- **Motion** (Reanimated, on the UI thread): standard easing `cubic-bezier(0.2, 0, 0, 1)`; press 80 ms (scale 0.98, buttons only); state 120 ms; menus 150 ms; messages 200 ms; sheets and drawer 240 ms; cards fade-rise 6 px. Reduce-motion disables loops and decorative motion.
- **Touch targets** at least 44 × 44. Respect safe areas and keep the AI bar above the keyboard.

---

## 6. Components

| Component | Spec |
| --- | --- |
| Button | Pill, height 44 (40 compact). Primary = `accent` fill; secondary = `surface-container`; text button = `link`. One primary per area. Pending label ends with "…" |
| Text field | Radius 12, `surface-container` fill, border appears on focus (`border-strong`). Label above, error below in `clay-500` |
| Segmented control | Pill track `paper-200`; active segment `surface` with elevation 1 |
| **AI bar** | Radius 32, `surface-container`, min height 56. Left: camera. Middle: multiline input (grows to 160). Right: mic, send (`accent`). While recording: discard, timer + credit estimate, waveform, send recording. Hint line below: "≈N credits per message · AI can make mistakes" |
| **Artifact card** | Radius 24, `surface-container`, tone-tinted gradient border and corner glow (tones: info, income, expense, warning). Optional header (tone tile + label + meta) and footer |
| **Ledger row** | Tone tile (income green / expense red) · title + meta (date, category) · signed amount right-aligned. Tap expands details (category, note, items). Long-press: Copy, Edit, Delete |
| Summary strip | One `surface-container` row, radius 16, 16 gutter, at most 64 tall at default font size. Equal cells, each a label (Label 13, `ink-500`) above a value (Row title 15, tabular, one line, shrinks to 12 before wrapping). Values: income `forest-500`, expense `clay-500`, signed net green / red / neutral at zero, others `ink-900`. Each cell is one accessibility item ("Income, ৳12,500.00"). Loading shows same-height placeholders; error shows the message with Retry in place of the strip. At large font sizes the cells wrap to two rows |
| Tone tile | 40 (r12) or 48 (r16) square with the tone tint and icon |
| Chip | Pill, `paper-200`, 12–13 label |
| Bottom sheet | Top radius 28, grabber, title row with close |
| Drawer | `surface-container`, width 288, logo row, book switcher, nav rows (min height 44, pill, active = `selected`), profile footer |
| Empty / error states | Tone tile + one-line title + short body + one action (Retry, Add) |
| Icons | Lucide (`lucide-react-native`), 1.75 stroke, sizes 16/18/20/24 |

---

## 7. Screens

### 7.1 Auth
Logo, "Your money, in plain words." headline, Google button, divider, email + password form, switch between Sign in and Create account. Then the **currency picker** sheet on first sign-in.

### 7.2 Ledger (home)
- Top bar: menu (opens drawer) · "Ledger" · **Assistant** pill button · ⋯ (Manage categories).
- Month switcher: ‹ November 2026 › with "This month" link; › disabled on the current month.
- Summary strip (secondary): Income, Expense, Net position, Avg / tx in one row, always for the whole month.
- Search field + All / Income / Expense segmented filter + sort.
- FlashList of ledger rows grouped by day (primary, takes the rest of the screen); footer with count and totals. Pull to refresh.
- **Add transaction** floating pill above the AI bar (manual mode).
- **AI bar** pinned at the bottom.

### 7.3 Assistant sheet
- Header: sparkle + chat title · History · New chat · Close.
- Thread: user bubbles (right, `paper-200`, radius 24·4·24·24) and AI text + artifact cards (left, no bubble). Day dividers. "Load earlier messages" at the top.
- Empty state: "Type, speak, or snap a receipt below." with four example phrases.
- Failure card with Retry, Buy credits, Dismiss.
- History view: chat rows (title, last-activity date, delete) and "Show older chats".

### 7.4 Loans, Installments
Same structure as the web views: totals, status tabs (Open/Settled/All, Active/Completed/All), list, add form in a bottom sheet, expandable rows.

### 7.5 Receipt flow
Camera/gallery → full-screen editor (crop, rotate left/right, reset) → "Scanning receipt…" in the Assistant → receipt draft card (items, total, tax line, Save / Discard).

### 7.6 Credits
Balance (56 / 500), Buy credits (store purchase sheet with packs), history and usage list.

### 7.7 Settings
Theme (Light / Dark), default currency, categories, **Auto-capture**, sign out, delete account (destructive, double confirm).

### 7.8 Auto-capture
- **Explanation screen:** tone tile (info) + "Add payments automatically" title + sections: *Why*, *What we read*, *What we never read or send*, *How to turn it off*. Primary **Continue**, text button **Not now**.
- **Setup:** status card (On / Off / Access removed), "Choose apps" list with checkboxes (bank, wallet, SMS and email apps suggested first), count of captured items, **Turn off** (destructive text button) with "Also delete pending items" option.
- **Detected transactions inbox:** reached from a badge on the Ledger top bar. Each item is a draft ledger row (warning tone, "Detected" pill, source app icon and time) with **Confirm**, **Edit**, **Discard**. Duplicates are marked "Possible duplicate".

---

## 8. Consistency checklist (before any screen ships)

- [ ] Only theme tokens; light and dark both checked.
- [ ] Green income, red expense/destructive, yellow warning, blue action/info — no other meanings.
- [ ] Amounts signed, tabular, in the book currency; dates in Asia/Dhaka.
- [ ] Cards follow the artifact card recipe.
- [ ] Buttons are pills; one primary per area; pending labels end with "…".
- [ ] Every state exists (idle, pressed, focused, disabled, pending, success, error, empty, loading).
- [ ] Touch targets ≥ 44; nothing hidden behind hover.
- [ ] Motion uses the tokens; reduce motion respected.
- [ ] Copy is sentence case, short and truthful.
