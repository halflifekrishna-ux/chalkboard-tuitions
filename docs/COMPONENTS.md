# Shared Components & Design System

Reference for the reusable marketing layer built in Sprint 1. Each entry lists
**purpose · key props · where used**. Keep this updated as components evolve (Rule 6).

> OS admin components live under `src/components/admin/` and are out of scope here.

---

## Design-system primitives — `src/components/ui/`

### `Container` — `container.tsx`
- **Purpose:** max-width + horizontal padding wrapper for consistent gutters.
- **Props:** `size` `"default"`(7xl) | `"narrow"`(4xl) | `"wide"`; `className`; `children`.
- **Used in:** every marketing section/page.

### `Section` — `section.tsx`
- **Purpose:** vertical rhythm + background band variant; alternating page bands.
- **Props:** `bg` `"cream"`|`"white"`|`"dark"`|`"transparent"`; `size` `"sm"|"default"|"lg"`; `id`; `className`; `children`.
- **Used in:** About, Learning Studio, OS, WhyChooseUs, JourneyStrip.

### `Button` — `button.tsx`
- **Purpose:** the single CTA primitive; renders `<Link>`/`<a>` when `href` set, else `<button>`.
- **Props:** `variant` `"primary"`(gold gradient)|`"secondary"`(outline)|`"ghost"`; `size` `"md"|"lg"`; `href?`; `external?`; standard anchor/button attrs.
- **Used in:** Hero, CTASection, JourneyStrip, OS page, navbars.

### `SectionHeading` — `section-heading.tsx`
- **Purpose:** eyebrow + title + subtitle opener for sections.
- **Props:** `eyebrow?`; `title`; `subtitle?`; `align` `"center"|"left"`; `tone` `"light"|"dark"`; `as` `"h1"|"h2"`; `className`.
- **Used in:** WhyChooseUs, About, Learning Studio, OS.

---

## Marketing sections — `src/components/marketing/`

### `EcosystemNavbar` — `EcosystemNavbar.tsx` (client)
- **Purpose:** route-based top nav; marketing links grouped, OS **Login** kept as a
  quiet utility, one primary **Book Free Demo** CTA; theme toggle; mobile menu.
- **Props:** none (reads `usePathname` for active state).
- **Used in:** `(marketing)/layout.tsx`.

### `EcosystemFooter` — `EcosystemFooter.tsx` (server)
- **Purpose:** site-wide footer — master brand, the three units, contact, legal entity.
- **Props:** none.
- **Used in:** `(marketing)/layout.tsx`.

### `Hero` — `Hero.tsx` (server)
- **Purpose:** reusable hero band (no client JS). On the homepage it answers the six
  parent questions via `chips` + subtitle + CTAs.
- **Props:** `eyebrow?`; `title`; `highlight?`; `subtitle`; `chips?: string[]`;
  `primary?`/`secondary?: { label, href, external? }`; `note?`.
- **Used in:** `/`, `/about`, `/learning-studio`, `/os`.

### `TrustBanner` — `TrustBanner.tsx` (server)
- **Purpose:** the "since 2018 · Home Tuitions Bangalore → Chalkboard" credibility strip.
- **Props:** `stats?: { value, label }[]` (defaults to four).
- **Used in:** `/`, `/about`.

### `WhyChooseUs` — `WhyChooseUs.tsx` (server)
- **Purpose:** numbered (01…) value-prop grid, data-driven.
- **Props:** `eyebrow?`; `title?`; `subtitle?`; `items?: { title, body }[]` (defaults to the 5 reasons).
- **Used in:** `/` (reusable on `/tuitions`).

### `JourneyStrip` — `JourneyStrip.tsx` (server)
- **Purpose:** cross-sell band introducing a secondary journey (Studio) or the quiet OS login.
- **Props:** `eyebrow?`; `title`; `description`; `cta: { label, href, external? }`; `tone` `"light"|"dark"`; `icon?`.
- **Used in:** `/`.

### `CTASection` — `CTASection.tsx` (server)
- **Purpose:** closing call-to-action band.
- **Props:** `eyebrow?`; `title`; `subtitle?`; `primary`; `secondary?`.
- **Used in:** `/`, `/about`, `/learning-studio`.

---

## Reused as-is (Rule 1) — `src/components/sections/`

`Hero` (Spline), `Stats`, `Features`, `Testimonials`, `Pricing`, `About`, `FAQ`,
`Contact` — the proven Tuitions sections, now composed on **`/tuitions`** and
**`/contact`**. Not rewritten. (`layout/Navbar` and `sections/Footer` are the older
tuition-only nav/footer, superseded by the Ecosystem versions for marketing pages.)

---

## Conventions
- Marketing pages are **server components** by default; only `EcosystemNavbar` and the
  legacy interactive sections ship client JS. Keep new sections server-first (Rule 5).
- Compose pages from `Section` + `Container` + `SectionHeading` + the marketing
  sections — avoid page-specific bespoke markup (Rule 2).
- Palette/typography come from `tailwind.config.js` + `globals.css` — never hardcode a
  new brand colour (Rule 4).
