# Chalkboard — Brand Architecture

The single source of truth for how the Chalkboard ecosystem is named, structured,
and presented. Every page, component, route, and future feature should reinforce
this structure rather than drift from it. When in doubt, this document wins.

---

## 0. The one rule above all others

**Parents buy trust, not beauty.** Chalkboard is an education company, not a design
showcase. Do not let this become a beautiful-but-empty corporate website. The
homepage must answer, within the first few seconds, the questions a parent actually
has:

1. Do you teach my child's grade? *(LKG–10)*
2. Which boards? *(CBSE · ICSE · State Board)*
3. Where are you located? *(Bangalore — Kammanahalli / Kalyan Nagar)*
4. How many students per batch? *(max 8)*
5. Can I book a demo / assessment? *(yes — one obvious CTA)*
6. Why should I trust you? *(since 2018, via Home Tuitions Bangalore)*

Everything else is secondary. Trust > polish. Clarity > cleverness.

---

## 1. The entity map

```
Chalkboard Learning Services LLP        ← legal entity (footer / legal / invoices only)
│
└── Chalkboard                          ← the master brand (what the public sees)
      │
      ├── Chalkboard Tuitions           ← business unit · K–10 academic learning  (the engine)
      ├── Chalkboard Learning Studio    ← business unit · college / corporate / institutional
      └── Chalkboard OS                 ← business unit · the technology platform (product)
```

- **Legal entity** — "Chalkboard Learning Services LLP." Only where legally required.
- **Master brand** — "Chalkboard." The umbrella everyone recognises.
- **Business units** — always "Chalkboard {Unit}" on first mention; short form
  ("the Studio", "the OS") allowed locally. Never a standalone brand cut off from
  Chalkboard.

---

## 2. Revenue reality → the homepage is NOT three equal cards

Revenue today is lopsided, and the homepage must reflect that honestly:

```
Tuitions        ██████████████   (the business)
Learning Studio ██               (introduced)
OS              █                (quietly present)
```

**Homepage strategy — one product drives everything (the Apple model):**

```
Hero — Chalkboard Tuitions leads (grade, boards, batch size, location, CTA)
   ↓
Why Parents Choose Us  (01–05)
   ↓
Book a Free Assessment
   ─────────────────────────────
Looking for corporate or college learning?  → Explore Chalkboard Learning Studio
   ─────────────────────────────
Already a Chalkboard student/staff?          → Login to Chalkboard OS
```

Tuitions **dominates**. Studio is **introduced**. OS **quietly exists**. This also
protects tuition SEO on `/` — the homepage stays tuition-heavy in intent and copy.

---

## 3. The trust-transfer narrative (use everywhere it fits)

This is the strongest asset and must be told consistently — homepage, Tuitions, About:

> **Since 2018, Home Tuitions Bangalore has helped hundreds of students through
> personalised academic support. Today that experience powers Chalkboard.**

Old experience → new brand → same people. It transfers credibility instantly. Never
present Chalkboard as a brand-new unproven startup; it is the evolution of a
seven-year track record.

---

## 4. The three units

### Chalkboard Tuitions — the engine
- **Audience:** parents (buyers) + children, Grades LKG–10, Bangalore.
- **Promise:** personalised learning, small batches (max 8), five days a week,
  progress tracking, proven results — built on Home Tuitions Bangalore since 2018.
- **Boards:** CBSE · ICSE · State Board.
- **Primary CTA:** Book Free Assessment (single primary; "Book Demo" secondary).
- **Voice:** warm, reassuring, parent-first.
- **Page flow (`/tuitions`):** Hero → Why Parents Choose Chalkboard (01 Personalised
  Start · 02 Small Batches · 03 Five Days a Week · 04 Progress Tracking · 05 Trusted
  Since 2018) → Courses → Subjects → Batch Timings → Locations → Testimonials → FAQ →
  Final CTA (Book Your Free Assessment).

### Chalkboard Learning Studio — audience-led, not service-led
B2B/B2I buyers think in terms of *"who are you for and what problem do you solve,"*
not a flat service list. So the Studio is organised by **audience solutions**:

```
For Colleges · For Schools · For Corporates · For NGOs · For Government · For Startups
```

Each audience follows the same B2B narrative:

```
Problems  →  Solutions  →  Programs  →  Outcomes  →  Case Studies
```

Underlying capabilities (delivered *through* the above): corporate training, campus
training, placement readiness, faculty development, e-learning, instructional design,
learning consulting, technology-enabled learning.
- **Audience:** colleges, schools, corporates, NGOs, government, startups.
- **Primary CTA:** Contact Sales / Talk to us.
- **Voice:** precise, professional, outcomes-led.
- **Structure:** a Studio hub (`/learning-studio`) introducing the six audiences +
  the Problems→Outcomes model; audience detail pages can follow as the section grows.
- **Proof policy (hard rule):** case studies, trainer bios, client names/logos, and
  outcome numbers must be REAL. Never fabricate. Until supplied, use honest,
  non-specific credibility and clearly-marked slots — never invented clients or
  testimonials.

### Chalkboard OS — the product, with a public face
Not just a login. A lightweight public page establishes it as a real platform (and
is already in place if OS is ever SaaS-enabled later).
- **`/os`** — public: "The platform powering Chalkboard." A capability list
  (Admissions · Attendance · Fees · Parent Communication · Analytics · Learning
  Management · more coming) + a single **[Login]**. No screenshots, no product tour —
  just enough to show this isn't a random login page.
- **`/admin`** — the actual product (login → app). Already built (v0.4.0). NOT
  marketing. Untouched by this refactor.
- **Audience:** internal staff today; parents/students later via portals.
- **Voice:** functional, quiet, product-like.

### About — story-led, not a timeline
People buy stories, not "we started in…". Flow (`/about`):

```
Why Chalkboard Exists  →  Our Philosophy  →  Our Journey (Home Tuitions Bangalore → Chalkboard)
  →  The Three Pillars (Tuitions · Studio · OS)  →  Meet the Team  →  Our Future
```

---

## 5. Information architecture (URL map)

```
/                     Ecosystem homepage — Tuitions-dominant (see §2)
/about                About Chalkboard — story-led (§4)
/tuitions             Chalkboard Tuitions — conversion-focused (parents)
/learning-studio      Chalkboard Learning Studio — audience-led B2B/B2I
/os                   Chalkboard OS — public platform page + Login entry
/contact              Unified contact (routes enquiries by unit)
/admin                Chalkboard OS product (login → app). Not a marketing page.
```

- **Marketing pages** live in a `(marketing)` route group; **OS** stays under
  `/admin`. Nav visually separates marketing links from the OS "Login".
- **Redirect policy (SEO-safe):** never break an existing URL without a **301**.
  The current tuition-focused content that moves to `/tuitions` keeps a redirect from
  any old path; `/` stays `/` but becomes the Tuitions-dominant hub, preserving intent.
  Confirm the live domain's ranking/ads before finalising; when unknown, redirect
  defensively and keep Tuitions front-and-centre on `/`.

---

## 6. SEO ownership (no keyword cannibalisation)

| Page | Owns | Does NOT target |
|---|---|---|
| `/` | brand + tuition-intent ("Chalkboard", "tuition Bangalore") | corporate/college terms |
| `/tuitions` | "CBSE/ICSE tuition Bangalore", "small batch tuition", grade+subject | corporate/college terms |
| `/learning-studio` | "corporate training", "faculty development", "campus/placement training" | parent/tuition terms |
| `/os` | "Chalkboard OS", platform/product terms | tuition/corporate keywords |
| `/about` | brand story, entity, trust | transactional terms |

Each page: its own `metadata` (title/description/canonical/OG), one `<h1>`.

---

## 7. Visual & voice guardrails

- **Reuse the existing design language** — board-green / gold / chalk palette,
  Playfair display + sans body, rounded cards. Do not re-theme.
- **Shared design system:** primitives (Button, Card, Section, Container, Badge, nav,
  footer) live in one place, reused across all marketing pages. No one-off styling.
- **Voice by unit:** Tuitions = warm/parent-first · Studio = professional/outcomes-led
  · OS = functional/quiet. All three still sound like one brand.
- **Principles:** modern, minimal, trustworthy, generous whitespace, strong type,
  mobile-first, fast — but always in service of trust, never decoration for its own sake.

---

## 8. Governance — where does a new thing go?

1. **Who is it for?** Parent → Tuitions. Institution/corporate → Studio. Internal →
   OS.
2. **Marketing or product?** Marketing → `(marketing)` route + shared design system.
   Product → `/admin` (OS), behind auth + feature flag.
3. **Needs real proof (logos, testimonials, case studies)?** If not real yet, ship a
   credible placeholder — never fabricate.

Future OS modules (Homework, Assessments, LMS, Certificates, Analytics, Corporate
Learning Portal, Fees receipts/reminders, Parent/Student portals) attach to
**Chalkboard OS** behind feature flags — no redesign required.

---

## 9. Delivery sequence (business-priority order)

- **Sprint 1 — Conversion first:** brand architecture · shared design-system
  foundation · ecosystem homepage (Tuitions-dominant) · Tuitions page · About ·
  Contact.
- **Sprint 2 — Institutional presence:** Learning Studio (audience-led) · finish
  shared components · per-section SEO · performance / Core Web Vitals / a11y.
- **Sprint 3 — Platform:** public `/os` page · login integration · then OS product
  work (fee receipts, fee reminders, student portal, parent portal) — the existing OS
  roadmap, behind flags, OS internals otherwise stable.

> Sequencing note: the shared design-system primitives are built at the **start** of
> Sprint 1 (the homepage depends on them), not deferred to Sprint 2.

---

## 10. What this refactor is (and isn't)

- **Is:** an in-place refactor of one Next.js app — new Tuitions-dominant homepage,
  story-led About, conversion-focused Tuitions, an audience-led Learning Studio, a
  public `/os` page, a shared design system, per-section SEO, redirects.
- **Isn't:** a monorepo, a re-platform, or any change to the working OS internals,
  IAM, or database migrations (0001–0010). Those stay exactly as they are.
