# RAAHI Design System

This document captures the current visual language, interaction patterns, and implementation details observed in the RAAHI booking experience. It should serve as the single source of truth when extending or refactoring UI inside `app-v2`.

---

## 0. How to Read This Guide

1. **Principles & Stack** – understand what the product stands for and which tooling enforces the design tokens.
2. **Foundations** – color, type, spacing and motion tokens defined in CSS and Tailwind.
3. **Component Library** – canonical usage patterns for controls, surfaces, feedback and layout primitives.
4. **Product Patterns** – how foundations + components combine inside Home, Location, and Booking flows.
5. **Implementation Checklist** – guardrails for introducing new UI or refactoring existing code.

All callouts reference the source files inside `src/` so engineers can quickly inspect or update them.

---

## 1. Brand Pillars & Voice

- **Conscious & Responsible** – the hero copy (“Conscious Travel · Responsible Tourism”) at `src/app/page.tsx:16-32` frames the tone as optimistic, community-first, and transparent.
- **Warm minimalism** – neutral beige backgrounds with terracotta and sage accents (`src/app/globals.css:8-38`) keep screens calm while highlighting key actions.
- **Trust through clarity** – helpers such as loaders, booking summaries, and error banners strive for explicit messaging instead of hiding application state (`src/components/atoms/Loader.tsx`, `src/components/molecules/BookingSummary.tsx`, `src/components/atoms/ErrorDisplay.tsx`).

---

## 2. Implementation Stack & Theming Pipeline

- **Framework** – Next.js 15 + React 19 drive the app (`package.json`). TailwindCSS 3.4 powers utility-first styling, merged via `clsx` + `tailwind-merge` (`src/lib/utils.ts`).
- **Design Tokens** – CSS custom properties defined in `src/app/globals.css:8-76` feed Tailwind via `tailwind.config.js:1-33`, enabling light/dark variants from the same class names.
- **Font delivery** – Google Fonts (`Manrope`, `Philosopher`) are imported globally (`src/app/globals.css:1-42`), while `Geist` and `Geist Mono` are preloaded through Next’s font API to keep typography consistent (`src/app/layout.tsx:1-45`).
- **Theme switching** – `next-themes` (`src/components/theme-provider.tsx:1-7`) + the `ThemeToggle` button (`src/components/ThemeToggler.tsx:3-19`) control the `class` attribute, swapping the CSS variables in `:root`/`.dark`.
- **State & data** – `@tanstack/react-query` (`src/app/ClientLayout.tsx:3-27`) hydrates data, while Supabase auth hooks appear in the header dropdown (`src/components/organisms/Header.tsx:18-135`).

---

## 3. Visual Foundations

### 3.1 Color Tokens

| Token | Light (HSL) | Dark (HSL) | Brand name / Hex | Usage |
| --- | --- | --- | --- | --- |
| `--background` | `38 26% 90%` | `0 0% 15%` | Beige ≈ `#F1E9DC` (notes mention `#D5CAB7`) | Page canvas, section fills |
| `--foreground` | `0 0% 20%` | `0 0% 100%` | Charcoal `#333333` | Primary text/icons |
| `--card` | `0 0% 100%` | `0 0% 10%` | White / near-black | Card bodies |
| `--card-foreground` | `0 0% 20%` | `38 26% 85%` |  | Text on card surfaces |
| `--primary` | `10 76% 55%` | same | Terracotta `#E35336` | Filled buttons, key highlights |
| `--primary-foreground` | `38 26% 78%` | `38 26% 85%` | Muted beige | Text on terracotta |
| `--secondary` | `214 13% 49%` | `214 13% 35%` | Slate `#6D7B8D` | Secondary buttons, toggles |
| `--accent` | `90 15% 71%` | `90 15% 40%` | Sage `#B5C0AA` | Pills, subtle highlights |
| `--muted` | `214 13% 49%` | `214 13% 30%` | Slate variants | Borders, disabled states |
| `--destructive` | `0 84% 60%` | `0 63% 31%` | Alert red | Critical actions (cancel) |
| `--border`, `--input`, `--ring` | `214 13% 49%` / `10 76% 55%` | darkened equivalents |  | Outline, focus, form states |

Guidelines:

- Never hard-code RGB/hex values; consume Tailwind semantic classes (`bg-primary`, `text-muted-foreground`, etc.) so dark mode stays automatic.
- Use `accent` for subtle chips (vehicle features, facility badges) and `secondary` for interactive but non-primary actions (e.g., decrement buttons in `GroupSizeSelector`).
- Destructive red is only used via `variant="destructive"` on `ButtonV2` or alert banners.

### 3.2 Typography

- **Primary body** – `Manrope` via `--font-common` is enforced on `body`, headings, and paragraphs (`src/app/globals.css:88-95`). Use Tailwind weights `font-medium`, `font-semibold`, `font-extrabold` to differentiate hierarchy.
- **Display/serif accent** – `Philosopher` is exposed as `--font-special`; reserve it for editorial moments, long-form storytelling, or quotes.
- **Utility fonts** – `Geist` (`--font-geist-sans`) and `Geist Mono` are injected in the root layout to support system text or data tables (`src/app/layout.tsx:7-35`).
- **Scale** – Use Tailwind sizing already present in the app:
  - Hero titles: `text-3xl sm:text-4xl` (`src/app/page.tsx:16-21`).
  - Section headings: `text-xl`/`text-2xl` (`ResourceLocationList`, Booking Summary).
  - Supporting copy: `text-sm`/`text-base` with `leading-relaxed`.
  - Mono details: `font-mono` when showing IDs (`src/app/booking/page.tsx:183-187`).

### 3.3 Layout & Spacing

- **Grid system** – rely on Tailwind’s default breakpoints; no custom screens are defined in `tailwind.config.js`, so `sm`, `md`, `lg`, etc., provide responsive hooks.
- **Containers** – major flows center content inside constrained widths:
  - Home list: `max-w-2xl` stack (`src/components/organisms/ResourceLocationList.tsx:24-63`).
  - Location details: `max-w-lg` modal card with sticky CTA (`src/app/location/[id]/page.tsx:56-166`).
  - Booking forms: `min-h-screen` column with evenly spaced sections (`src/app/booking/page.tsx`).
- **Spacing scale** – Tailwind’s 4px baseline is evident (`p-4`, `gap-6`, `px-6`). When inventing new spacing, prefer existing tokens before custom values.
- **Radius** – `--radius: 0.5rem` (8px) is the minimum. Hero cards frequently use `rounded-2xl/3xl` for a softer, premium feel; match adjacent components to avoid mixed radii inside the same block.
- **Borders & separators** – apply `border border-border` for cards, `divide-border` for lists, ensuring dark mode parity.

### 3.4 Elevation & Surfaces

- Combine light borders + subtle `shadow-md` to keep cards legible on beige backgrounds (`ResourceLocationList`, `Header`, `Footer`).
- Outline accents (e.g., `border-primary`, `ring-2 ring-primary/30`) signal selection in pickers like `VehicleTypeSelector` (`src/components/molecules/VehicleTypeSelector.tsx:28-83`).
- Use `bg-card` for elevated panels, `bg-background` for page surfaces, `bg-popover` for floating layers (`Header` dropdown).

### 3.5 Iconography

- `@heroicons/react` provides the majority of pictograms (Sun/Moon toggles, Star/Heart in location cards, user/profile icons). Keep stroke widths consistent (`24/outline` or `24/solid` per component).
- Supplemental emoji or inline SVGs are acceptable for low-stakes icons (vehicle emojis, time-of-day icons), but wrap them inside fixed containers so alignment stays coherent.

### 3.6 Imagery

- `CustomImage` (`src/components/atoms/CustomImage.tsx:1-39`) standardizes lazy loading, blur-up transitions, and placeholder fallbacks. Always prefer it over raw `<Image>` to get the animation and error handling for free.
- Hero banners layer a gradient overlay (`from-black/60 to-transparent`) and pinned metadata buttons (`src/app/location/[id]/page.tsx:82-121`). Reuse this recipe for any immersive media.
- Thumbnail grids use `rounded-xl` edges with thin borders to echo the premium material palette.

### 3.7 Motion

- Global loader animations live in CSS (`src/app/globals.css:97-127`) and are consumed by `Loader` + `FullScreenLoader`.
- Micro-interactions lean on Tailwind utilities—scale nudges (`scale-[1.03]`) in selectors, `transition-all duration-200`, and `hover:bg-primary/90` on buttons.
- Keep motion purposeful: selection toggles should convey state (e.g., `ThemeToggle` cross-fades icons, `VehicleTypeSelector` lifts the active card).

### 3.8 Theming & Accessibility

- Dark mode is opt-in per user via the toggle; ensure new components only reference semantic colors so the `.dark` variables apply automatically.
- Provide `sr-only` labels for icon-only buttons (Theme toggle, loader) and ensure focus rings rely on `ring-ring` for consistent contrast.

---

## 4. Component Library

### 4.1 Buttons & Action Controls

- **`Button`** (`src/components/atoms/Button.tsx:1-40`) – rounded-full CTAs with `primary`, `secondary`, and `ghost` variants. Use this for simple client actions without loading states.
- **`ButtonV2`** (`src/components/atoms/ButtonV2.tsx:1-43`) – same anatomy but adds `destructive` + inline loading (`ThreeDotLoader`). Preferred for form submissions, sign-in, and cancel actions because it disables itself during async work.
- **`ThemeToggle`** (`src/components/ThemeToggler.tsx:3-19`) – wraps a secondary icon button. Follow its approach (stack Sun/Moon icons, `sr-only` label) when creating new toggles.

Usage tips:

1. Default size is `h-10`; use `size="lg"` for hero CTAs or `size="sm"` inside dense cards.
2. When disabling, rely on the built-in opacity state to guarantee contrast compliance.

### 4.2 Input Primitives

- **`Input`** (`src/components/ui/input.tsx:1-25`) – base text field with consistent border, radius, and focus rings. Extend via `className` for width tweaks only.
- **`DatePicker`** (`src/components/molecules/DatePicker.tsx:1-20`) – wraps `<input type="date">` with the same styling. Keep heights aligned at `h-12`.
- **`ContactInfo`** (`src/components/molecules/ContactInfo.tsx:1-120`) – demonstrates how validation messaging, dual-input phone fields, and regex configs should behave. Reuse its pattern for future multi-field validation (touch states, inline error text).

### 4.3 Selection Controls & Pickers

- **`VehicleTypeSelector`** (`src/components/molecules/VehicleTypeSelector.tsx:1-86`) – card-based radio buttons with image/icon, price pill, chip list, and animated checkmark. Ideal for any mutually exclusive card selection.
- **`TimeSlotPicker`** (`src/components/molecules/TimeSlotPicker.tsx:1-131`) – 3-column grid of pill buttons keyed by value. Highlight active states with solid primary backgrounds; show descriptive text beneath the grid.
- **`GroupSizeSelector`** (`src/components/molecules/GroupSizeSelector.tsx:3-169`) – counter widgets with +/- buttons, tooltips, and secondary messaging. Use its `CounterInput` blueprint if new numeric selectors are needed.
- **`PickupOption`** (`src/components/atoms/PickupOption.tsx`) and **`PickupLocationInput`** (file too large to inline) – combine custom radio rows with Google Maps autocomplete and map preview. Keep new transport options consistent by reusing these components rather than recreating the markup.
- **Radix Tabs** (`src/components/ui/tabs.tsx:1-55`) – base for multi-panel forms; they already support focus states and disabled styling.

### 4.4 Cards & Data Surfaces

- **Card primitive** (`src/components/ui/card.tsx:1-87`) – exposes `Card`, `CardHeader`, `CardTitle`, etc. Always compose data surfaces from these primitives to inherit padding and typography.
- **`ResourceLocationCard`** + **`ResourceLocationList`** (`src/components/molecules/ResourceLocationCard.tsx`, `src/components/organisms/ResourceLocationList.tsx:20-65`) – pattern for list tiles with media, stacked text, and arrow buttons.
- **`BookingSummary`** (`src/components/molecules/BookingSummary.tsx:20-62`) – demonstrates definition lists using `divide-y` and semantic labels.
- **`BookingCard`** (`src/components/molecules/BookingCard.tsx:1-95`) – status-aware card with colored left borders and contextual destructive actions. Follow its approach for timeline/history views: color-coded border, status typography, and disable rules.

### 4.5 Navigation & Layout

- **`Header`** (`src/components/organisms/Header.tsx:1-135`) – sticky top bar combining branding, theme toggle, auth-aware CTA, and dropdown menus. When adding items, respect the `container mx-auto` width and keep icon buttons 40x40px minimum.
- **`Footer`** (`src/components/organisms/Footer.tsx:3-11`) – sticky bottom bar mirroring the header’s border/shadow to “frame” the page.
- **`ClientLayout`** (`src/app/ClientLayout.tsx:1-27`) – wraps pages with QueryClient, Google Maps script, header/footer, and flexible main content. Any new global providers (e.g., analytics) should hook in here.

### 4.6 Feedback & System Status

- **`Loader` + CSS keyframes** (`src/components/atoms/Loader.tsx:3-13`, `src/app/globals.css:97-127`) – orb spinner for inline loading states.
- **`FullScreenLoader`** (`src/components/atoms/FullScreenLoader.tsx:1-10`) – modal overlay for route-level fetches (used in booking/location guard clauses).
- **`ThreeDotLoader`** (`src/components/atoms/ThreeDotLoader.tsx:3-11`) – button-sized indicator for micro waits.
- **`ErrorDisplay`** (`src/components/atoms/ErrorDisplay.tsx:1-118`) – severity-aware banner with optional retry/sign-in CTA. Set `showAction`/`dismissible` per context to keep errors visible until resolved.

### 4.7 Overlays & Dialogs

- **Radix Dialog wrapper** (`src/components/ui/dialog.tsx:1-121`) – handles overlay blur, animation, and focus trapping. Compose modals with `DialogHeader`, `DialogContent`, `DialogFooter`.
- **Popover menus** (auth dropdown in `Header`) – follow the same border, shadow, and padding values when creating new contextual menus.

### 4.8 Imagery Utilities

- **`CustomImage`** (`src/components/atoms/CustomImage.tsx:1-39`) – ensures placeholders + blur transitions. Always provide alt text; the component inserts a fallback copy if omitted.
- **Media overlays** – for hero sections, use gradient overlays and pinned metadata blocks as in `src/app/location/[id]/page.tsx:82-121`.

---

## 5. Application Patterns

### 5.1 Home Resource Discovery

- Layout: columnar hero + stacked cards centered inside `max-w-2xl`.
- Components: `Loader` for initial fetch, `ResourceLocationList` for the cards (`src/app/page.tsx:16-32` + `src/components/organisms/ResourceLocationList.tsx:20-65`).
- Behavior: each card is a full-width link with keyboard-friendly buttons. Keep new list types consistent by reusing the same organism.

### 5.2 Location Detail Sheet

- Container: `max-w-lg` card with rounded corners and sticky CTA (`src/app/location/[id]/page.tsx:56-166`).
- Hero: `CustomImage` fill + gradient overlay + pinned controls (back button, favorite heart).
- Content: about copy, horizontal media gallery, facilities chips.
- CTA: `ButtonV2` anchored in a sticky footer for mobile ergonomics.
- When designing new detail views, borrow this structure—hero media, content body, sticky action.

### 5.3 Booking Flow

- Multi-step form defined in `src/app/booking/page.tsx:1-200`, orchestrating molecules (`VehicleTypeSelector`, `TimeSlotPicker`, `PickupLocationInput`, `GroupSizeSelector`, `ContactInfo`).
- Validation & submission:
  - Local state keeps inputs controlled.
  - `ContactInfo` exposes validation booleans; combine them into `isFormValid` before enabling the confirm button (`src/app/booking/page.tsx:166-174`).
  - `BookingSummary` echoes the chosen data before payment.
- Persistence: localStorage prefill and React Query handle asynchronous updates.
- When adding new booking steps, respect the current pattern: section cards with headings, consistent padding, and summary cards on the right or bottom for smaller viewports.

---

## 6. Implementation Checklist

1. **Use semantic Tailwind tokens** – never reference raw hex values; rely on `bg-primary`, `text-muted-foreground`, etc., so dark mode stays automatic.
2. **Wrap media in `CustomImage`** – ensures graceful loading and fallback states.
3. **Honor spacing & radius** – align to the 4px Tailwind scale and use at least `rounded-lg` (prefer `rounded-2xl` on hero cards).
4. **Propagate accessibility** – provide `sr-only` labels for icon-only buttons, maintain `focus-visible` rings, and keep contrast by pairing `text-foreground` with `bg-background`.
5. **Prefer existing molecules** – booking forms, selectors, and cards already solve most layout problems; extend them via props before inventing new patterns.
6. **Keep feedback persistent** – loaders for data fetches, `ErrorDisplay` for failures, and disabled buttons while `loading` to avoid double submissions.
7. **Document additions** – whenever you add a new token or component, update this file with its purpose, anatomy, and source path.

By adhering to these guidelines the team can evolve RAAHI’s UI without regressing on consistency, accessibility, or brand expression.
