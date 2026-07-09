# Chalkboard Tuitions — Marketing Site + Chalkboard OS

Two products in one Next.js repo:

1. **Marketing site** (`/`) — the public landing page for Chalkboard Tuitions, Bangalore.
2. **Chalkboard OS** (`/admin`) — the internal tuition-management system (students,
   batches, attendance, WhatsApp queue). Currently at **v0.3.1** (Release Candidate).

> 📖 Deep docs: [Chalkboard OS overview](docs/CHALKBOARD_OS.md) ·
> [Architecture & ER diagram](docs/ARCHITECTURE.md) ·
> [Operations: deploy / backup / recovery](docs/OPERATIONS.md) ·
> [Attendance architecture](docs/ATTENDANCE_ARCHITECTURE.md)

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14 (App Router), TypeScript (strict) |
| Styling | Tailwind CSS + Framer Motion |
| Database | Supabase (Postgres + RLS) |
| Auth | Supabase Auth (cookie sessions via `@supabase/ssr`) |
| Storage | Supabase Storage (private buckets, signed URLs) |
| Forms | React Hook Form + Zod |
| Email | Resend (lead confirmation + admin notification) |
| Messaging | Meta WhatsApp Cloud API (queued) |
| Hosting | Vercel |

---

## Chalkboard OS at a glance

```
Organization → Branch → Academic Year → Batch → Batch Subject
             → Session → Attendance → Communication → Reports
```

- **Admin portal** at `/admin` (Super Admin only today; role enum already covers
  teacher / reception / parent / student for future portals).
- **Attendance in under 20s**: Today's Sessions → Start → Present-by-default roster
  → Finish → Class Notes. WhatsApp messages are **queued**, never blocking.
- **Developer panel** (`/admin/developer`) surfaces env health, queue, migrations,
  DB/storage size, version and commit hash.
- Run database migrations in order from `supabase/migrations/` (see
  [OPERATIONS.md](docs/OPERATIONS.md)).

---

## Quick Start (Local Dev)

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in your values
cp .env.local.example .env.local

# 3. Run the dev server
npm run dev
# → Open http://localhost:3000
```

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=           # From Supabase → Project Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # From Supabase → Project Settings → API
SUPABASE_SERVICE_ROLE_KEY=          # From Supabase → Project Settings → API (secret)

RESEND_API_KEY=                     # From resend.com → API Keys
RESEND_FROM_EMAIL=                  # Must be on a verified domain in Resend
ADMIN_EMAIL=                        # Where admin notifications go

NEXT_PUBLIC_SITE_URL=               # Your production URL, e.g. https://chalkboardtuitions.in
NEXT_PUBLIC_WHATSAPP_NUMBER=        # E.g. 919876543210 (no + or spaces)
```

---

## Supabase Setup

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Copy your **URL**, **Anon Key**, and **Service Role Key** into `.env.local`
3. Go to **SQL Editor → New Query** and paste the contents of `supabase-schema.sql`
4. Click **Run** — the `leads` table is created automatically
5. View incoming leads under **Table Editor → leads**

---

## Resend Setup

1. Go to [resend.com](https://resend.com) → Sign up (free tier: 100 emails/day)
2. **Domains → Add Domain** → Add your domain (e.g. `chalkboardtuitions.in`)
3. Follow the DNS verification steps (add the TXT and MX records provided)
4. Once verified, copy your **API Key** into `.env.local`
5. Set `RESEND_FROM_EMAIL` to an address on your verified domain

> **Development shortcut:** Resend lets you send to `delivered@resend.dev` for testing without domain verification. Change `RESEND_FROM_EMAIL` to `onboarding@resend.dev` for local testing.

---

## Vercel Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — Chalkboard Tuitions landing page"
git remote add origin https://github.com/YOUR_USERNAME/chalkboard-tuitions.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Framework preset: **Next.js** (auto-detected)
4. Build command: `npm run build` (default)
5. Output directory: `.next` (default)

### 3. Add Environment Variables in Vercel

Vercel Dashboard → Your Project → **Settings → Environment Variables**

Add all variables from `.env.local.example` with their production values.

> Set variables for **Production**, **Preview**, and **Development** environments.

### 4. Deploy

Click **Deploy**. Vercel builds and deploys automatically on every push to `main`.

---

## Custom Domain Setup

### Option A: Namecheap → Vercel

1. **Vercel:** Project → Settings → Domains → Add `chalkboardtuitions.in`
2. Vercel shows you two values: **A record IP** and **CNAME**
3. **Namecheap:** Domain List → Manage → Advanced DNS:
   - Delete existing A records
   - Add `A Record` → Host: `@` → Value: Vercel's IP (e.g. `76.76.21.21`)
   - Add `CNAME Record` → Host: `www` → Value: `cname.vercel-dns.com`
4. Wait 10–30 minutes for DNS propagation

### Option B: Cloudflare → Vercel

1. **Vercel:** Project → Settings → Domains → Add your domain
2. **Cloudflare:** DNS → Add records:
   - `A` record: `@` → `76.76.21.21` → **Proxy status: DNS only** (orange cloud OFF)
   - `CNAME` record: `www` → `cname.vercel-dns.com` → **DNS only**
3. Cloudflare → SSL/TLS → set to **Full** mode

> ⚠️ Turn OFF Cloudflare proxy (orange cloud) for the A/CNAME records. Vercel handles SSL itself.

---

## Production Checklist

Before going live:

- [ ] All env variables set in Vercel
- [ ] Supabase `leads` table created (run `supabase-schema.sql`)
- [ ] Resend domain verified, API key working
- [ ] `NEXT_PUBLIC_WHATSAPP_NUMBER` set to your real number
- [ ] Replace placeholder testimonials with real parent quotes
- [ ] Add batch timings and availability to WhatsApp quick replies
- [ ] Replace `+91 XXXXX XXXXX` in Footer with your real number
- [ ] Upload `public/og-image.png` (1200×630px) for social sharing
- [ ] Submit Google My Business listing (takes 5–7 days to verify)
- [ ] Test contact form end-to-end in production
- [ ] Test on mobile (iOS Safari + Android Chrome)
- [ ] Run Lighthouse audit: aim for 90+ on all scores

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx         # Root layout, fonts, metadata, theme provider
│   ├── page.tsx           # Main landing page (assembles all sections)
│   ├── globals.css        # Tailwind + custom CSS utilities
│   └── api/
│       └── contact/
│           └── route.ts   # POST /api/contact → Supabase + Resend
├── components/
│   ├── layout/
│   │   └── Navbar.tsx     # Sticky nav + mobile menu + theme toggle
│   ├── providers/
│   │   └── ThemeProvider.tsx
│   └── sections/
│       ├── Hero.tsx        # Full-screen chalkboard hero
│       ├── Features.tsx    # 6-feature grid
│       ├── Testimonials.tsx
│       ├── Pricing.tsx     # Monthly/annual toggle pricing cards
│       ├── About.tsx       # Story + values
│       ├── FAQ.tsx         # Accordion FAQ (10 questions)
│       ├── Contact.tsx     # Form + Supabase + Resend
│       └── Footer.tsx
└── lib/
    ├── supabase.ts         # Supabase client
    └── resend.ts           # Email templates + Resend client
```

---

## Customisation After Launch

| Task | File |
|---|---|
| Change phone number | `.env.local` → `NEXT_PUBLIC_WHATSAPP_NUMBER` |
| Add real testimonials | `src/components/sections/Testimonials.tsx` |
| Change pricing | `src/components/sections/Pricing.tsx` |
| Update batch timings | `src/components/sections/Contact.tsx` + `Footer.tsx` |
| Add new FAQ | `src/components/sections/FAQ.tsx` → `faqs` array |
| Change colours | `tailwind.config.js` + `src/app/globals.css` |
| Swap fonts | `src/app/layout.tsx` |
