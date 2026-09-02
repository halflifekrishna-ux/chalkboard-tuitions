# Website Architecture — Before → After

How the marketing site is being restructured from a single Tuitions page into the
Chalkboard ecosystem. **In-place refactor of one Next.js app** — no monorepo, no OS
changes. See [BRAND_ARCHITECTURE.md](BRAND_ARCHITECTURE.md) for the why.

---

## Routes

### Before
```
/            (one long page)
  Navbar
  Hero
  Stats
  Features
  Testimonials
  Pricing
  About
  FAQ
  Contact
  Footer
```
Everything was the Tuitions site. Marketing + OS shared the app; OS at `/admin`.

### After
```
app/
├── (marketing)/                 ← route group (shared Navbar + Footer via its layout)
│   ├── page.tsx                 /                 Ecosystem homepage (TUITION-FIRST)
│   ├── tuitions/page.tsx        /tuitions         Conversion-focused (the old homepage, reused)
│   ├── about/page.tsx           /about            Story-led
│   ├── learning-studio/page.tsx /learning-studio  Audience-led B2B/B2I
│   ├── os/page.tsx              /os               Public platform page + Login entry
│   └── contact/page.tsx         /contact          Unified contact
├── admin/                       /admin            Chalkboard OS product (UNCHANGED)
└── api/                         /api              (UNCHANGED)
```

- URLs never break: `/` stays `/`; Tuitions content moves to the **new** `/tuitions`
  (nothing lived there before). Redirects (if any legacy paths surface) go in
  `next.config.mjs` — never in middleware (OS boundary).
- The homepage is **not** three equal cards: Tuitions dominates, Studio is
  introduced, OS is a quiet Login.

---

## Shared components (reusable sections — Rule 2)

Page-specific markup becomes prop-driven components reused across pages:

| Component | Purpose |
|---|---|
| `Hero` | Headline + trust bullets + CTAs + optional visual. Homepage & sub-pages |
| `TrustBanner` | The "since 2018 · Home Tuitions Bangalore → Chalkboard" credibility strip |
| `WhyChooseUs` | Numbered value props (01–05), data-driven |
| `JourneyStrip` | A cross-sell strip (Studio intro, OS login) |
| `CTASection` | Closing call-to-action band |
| `TestimonialSection` | Wraps the existing testimonials carousel (reused, not rewritten) |
| `EcosystemNavbar` | Route-based nav; marketing links separated from OS **Login** |
| `EcosystemFooter` | Ecosystem footer (units + contact + legal entity) |

Existing components **kept and reused as-is** on `/tuitions` (Rule 1): `Hero`
(Spline), `Stats`, `Features`, `Testimonials`, `Pricing`, `About`, `FAQ`, `Contact`.

---

## Shared design system (primitives — Rule 4)

Reuse the existing identity (board-green / gold / chalk, Playfair + DM Sans, rounded
cards). New low-level primitives so every section composes consistently:

| Primitive | Purpose |
|---|---|
| `Container` | Max-width + horizontal padding wrapper |
| `Section` | Vertical rhythm + background variant (cream / white / dark) |
| `Button` | `primary` (gold gradient) / `secondary` (outline) / `ghost`; link or button |
| `SectionHeading` | Eyebrow + title + subtitle, light/dark tone, alignment |

Tokens stay in `tailwind.config.js` + `globals.css` (unchanged palette).

---

## What is NOT touched (Rule 7 / OS boundary)

Database · Supabase schema · auth · middleware · feature flags · migrations
(0001–0010) · all `/admin` logic. This refactor only **adds** marketing routes,
navigation entry points, and the public `/os` information page.

---

## Delivery

- **Sprint 1 (now):** design-system foundation · ecosystem Navbar/Footer ·
  Tuition-first homepage · move Tuitions to `/tuitions` · lean About/Studio/OS/Contact
  so nothing 404s.
- **Sprint 2:** full audience-led Learning Studio · SEO polish · performance/a11y.
- **Sprint 3:** public `/os` depth · OS product roadmap (fees, portals) behind flags.
