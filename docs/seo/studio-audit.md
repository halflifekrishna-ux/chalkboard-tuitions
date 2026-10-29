# SEO audit: Chalkboard Learning Studio (`/learning-studio/*`)

Audited 2026-10-28 with the `/seo-audit` skill (full site audit + competitor comparison).

Scope: `/learning-studio`, `/learning-studio/colleges`, `/learning-studio/trainers`, and the shared pieces they inherit (root layout metadata, marketing layout, navbar, footer, share image, sitemap, robots).

## How this was measured, and what it can't see

- **Live pages** were read through Firecrawl (direct HTTP from this environment is blocked). Head tags, canonicals, JSON-LD and the vercel.app redirect were checked against production.
- **Rendered HTML and Lighthouse** come from a local production build of `main` at `5c71d28` (`next build` + `next start`, Lighthouse 12.2.1, mobile emulation, simulated throttling).
- **Keywords** were researched from live SERPs. No SEO tool is connected (the Ahrefs connector failed with a proxy error), so there is **no search volume, keyword difficulty, ranking position or backlink data** in this audit. Difficulty and opportunity are judged from who ranks: a SERP full of Microsoft, Udemy and 40-year e-learning agencies is hard; a SERP of LinkedIn posts and small vendors is open. Treat every keyword below as a hypothesis until volume data exists. Connecting Ahrefs or Semrush, or adding Search Console data, would firm this up.
- `site:` checks used Firecrawl's index, which is close to but not the same as Google's. Search Console is the source of truth for indexation.

---

## Executive summary

The Studio's technical base is better than the brief assumes. Each page already has its own title, description, canonical and a single H1; the hub no longer shares the homepage's "Learning, differently." title (it changed in `8293db1`, though Google still shows an older Studio title); vercel.app Studio URLs already 308 to www; and Lighthouse SEO scores 100 on all three pages.

The problems are about **what the pages say and who they appear to belong to**:

1. **The Studio still looks like the tuition centre's side project.** Every Studio share card is the Tuitions card ("Kammanahalli · Small batches · Grades 1–10"), every page carries `author: Chalkboard Tuitions`, the nav and footer logo includes the "Chalkboard Tuitions" wordmark, and the footer leads with the tuition WhatsApp line and the Kammanahalli centre address. A buyer in London sees a local tuition business.
2. **Several claims on the pages go beyond the allowed proof.** Faculty development is sold as a confirmed strand, the industry tracks list (Full Stack, Cloud, Cybersecurity) doesn't match the real East Point programmes (SQL, Python, Git, Excel, Power BI, FinTech), and "Teaching since 2018" sits on a Studio page.
3. **The keyword targets point at the wrong searchers.** "Placement training … Bangalore" is a SERP of student-facing institutes selling to individuals. College buyers search for "campus recruitment training for colleges" and "training partner for colleges", where small B2B pages rank. AI training has a winnable lane ("AI training for non-technical teams"), but the hub tries to rank one page for everything.

Overall: **sound foundation, needs work.** The fixes are mostly content, structure and branding, plus three real technical faults (FAQ answers missing from HTML, hub TBT of 1.4 s on mobile, LCP around 3 s on every page).

---

## Keyword opportunity table

No volume data. Difficulty is read from the SERP. Current ranking is unknown for all (no rank tracker); none of the Studio URLs appeared in the top 10 of any query below.

| Keyword | Est. difficulty | Opportunity | Intent | Recommended content type | SERP notes |
|---|---|---|---|---|---|
| AI training for non-technical teams | Moderate | **High** | Commercial | `/ai-training` landing page (primary) | Small vendors (aisfy, eyalmarcus.com, grit.asia) rank. Open lane. |
| generative AI workshop for teams | Moderate | **High** | Commercial | `/ai-training` (H2 + FAQ) | grit.asia, Faye Digital, Improving.com. No big platform dominates. |
| campus recruitment training for colleges | Moderate | **High** | Commercial (B2B) | `/colleges` (primary) | Bridge2IT's `/for-colleges` page and DIGIT rank. B2B intent confirmed. |
| training and placement partner for colleges | Easy–moderate | **High** | Commercial (B2B) | `/colleges` | Mostly LinkedIn posts inviting TPOs. Thin competition. |
| should students use AI for a first draft | Moderate | **High** | Informational | Insights post (draft-before-AI pillar) | Educator blogs (Leon Furze, Marc Watkins, Learning in Room 213). Your method is a distinct, citable answer. |
| AI-first draft vs writing it yourself at work | Easy–moderate | **High** | Informational | Insights post, links to `/ai-training` | Same cluster, workplace framing. |
| corporate AI training India | Moderate | **High** | Commercial | `/ai-training` (secondary, India mention in body) | Listicles ("Top 10 corporate AI training providers") rank. Getting listed in them is a link play. |
| hands-on / role-specific AI training for employees | Moderate–hard | Medium | Commercial | `/ai-training` | Correlation One owns "role-specific". |
| prompt writing training for employees | Moderate | Medium | Commercial | `/ai-training` section + insights post | Fits the existing PromptLesson demo. |
| AI training for teams | Hard | Medium | Mixed | `/ai-training` (title includes the phrase) | Microsoft Learn #1 and #3, Reddit, Guild. Keep in title, don't bet on it. |
| AI training for employees | Hard | Medium | Commercial | `/ai-training` | Correlation One, Guild, NAVEX, Udemy Business. |
| industry readiness program for colleges | Easy | Medium | Commercial (B2B) | `/colleges` H2 | Fragmented: college press posts, MSDC. Low demand signal, low competition. |
| employability skills training for colleges | Moderate | Medium | Commercial (B2B) | `/colleges` H2 + FAQ | NGO and MOU announcement posts. |
| BCA placement training: SQL, Python, Power BI | Easy | Medium | Commercial | `/colleges` track section + `/work` case study | Long tail that matches a real, running programme. Not SERP-checked. |
| FinTech track for B.Com students | Easy | Medium | Commercial | `/colleges` track section + `/work` | Long tail matching the real B.Com programme. Not SERP-checked. |
| turn PowerPoint / SOP into an e-learning course | Easy–moderate | Medium | Commercial | `/custom-courses` | Matches "built from your own material". Not SERP-checked. |
| custom e-learning development India | Moderate–hard | Medium | Commercial | `/custom-courses` | CommLab India, AlphaLearn, buyer's guides. |
| scenario-based e-learning development | Moderate | Medium | Commercial | `/custom-courses` H2 | Agencies; winnable only with a real sample. |
| AI upskilling workshop | Hard | Low | Informational | Insights post, not a landing page | **Hypothesis rejected for a landing page:** SERP is guides (Go1, D2L, SAP, Udemy). |
| custom e-learning development | Hard | Low | Commercial | `/custom-courses` (secondary) | **Hypothesis weak:** AllenComm, ELM, TrainingPros, listicles. No proof to compete with yet. |
| Storyline 360 development | Moderate–hard | Low (until confirmed) | Commercial | `/custom-courses` section only if Storyline is actually used | Blue Carrot (42 reviews), CommLab, IKHYA. **Is Storyline the build tool? `[TO BE CONFIRMED]`** |
| placement training for colleges (Bangalore) | Hard for B2B | Low | **Mismatched** (students) | Don't lead with it | **Hypothesis rejected as the head term:** Besant, ACTE, UrbanPro, "pay after placement" institutes. Searchers are students. |
| AI literacy training for college students | Moderate–hard | Low–medium | Mixed | `/colleges` section + insights | Google, Digital Education Council, JISC, YUVA AI. |
| how to roll out AI training for a team | Moderate | Medium | Informational | Insights post | Reddit thread ranks #4 for "AI training for teams". Practical guides win here. |

### What changes from the brief's hypotheses

- **Keep:** AI training for teams (in the title, not as the bet), industry-readiness program for colleges (as a section term).
- **Replace:** "placement training for colleges" → **"campus recruitment training for colleges"** and **"training partner for colleges"**. "AI upskilling workshop" → **"AI training for non-technical teams"** / **"generative AI workshop for teams"**.
- **Hold:** "Storyline 360 development" until you confirm the build stack, and "custom e-learning development" until there's a first client to show.

---

## On-page issues

| Page | Issue | Severity | Recommended fix |
|---|---|---|---|
| All Studio pages | Share image is the Tuitions card: "Kammanahalli · Bengaluru / Small batches. Real attention. / Daily tuitions for Grades 1–10 / Chalkboard Tuitions / Max 8 per batch". | **Critical** (brand) | Per-page `opengraph-image.tsx` for every Studio route, Studio wordmark typeset in Playfair, no tuition copy. |
| All Studio pages | `<meta name="author" content="Chalkboard Tuitions">` inherited from root layout. | High | Override `authors` in a Studio layout: "Chalkboard Learning Studio". |
| `/learning-studio/trainers` | Inherits the root layout's **tuition keyword list** ("tuitions near me", "KSEEB coaching" …). | High | Studio layout sets `keywords` to nothing. Remove `keywords` from hub and colleges too (Google ignores it; it only tells competitors what you target). |
| All Studio pages | Nav and footer logo is `/logo-dark.png`, which includes the "CHALKBOARD TUITIONS" wordmark. | High (brand) | Emblem-only asset (crop the "C"), name typeset as "Chalkboard Learning Studio" on Studio routes. |
| All Studio pages | Footer leads with the tuition WhatsApp number and the Kammanahalli centre address with tuition hours. | High | Studio footer variant: `connect@chalkboardlearning.in`, Studio links, Bengaluru in the legal line. Tuitions footer unchanged. |
| `/learning-studio` | Hub is the **companies** page. Colleges and trainers are footnote links. There's no "who for / how we work" structure and no route to AI training or custom courses as their own pages. | High | Rebuild as the hub (see plan). Move PromptLesson to `/ai-training`, CourseBuild to `/custom-courses`. |
| `/learning-studio` | Title "Corporate Training in Bengaluru \| Chalkboard Learning Studio" puts a city in front of a global buyer. Google still shows an older title ("Corporate Training in Bangalore — Sales, Support & Team …"). | Medium | New title that leads with the offer (see plan). Request reindexing in Search Console after deploy. |
| `/learning-studio` | "Teaching since 2018 — The same teachers behind Home Tuitions Bangalore". Breaks the 2018 rule. | High (claim) | "Built on Home Tuitions Bangalore, teaching since 2018." |
| `/learning-studio` | Hero lockup says "Learning Studio · Bengaluru". City as the hero line. | Medium | Location moves to footer and About. |
| `/learning-studio` | CourseBuild act 04: "Who finished, who struggled, exactly where they dropped off." Implies learner tracking that hasn't been run for a client. Hero: "custom courses people finish". | High (claim) | Reframe as the design intent, mark the service as new ("opening to our first partners"). Tracking capability `[TO BE CONFIRMED]`. |
| `/learning-studio/colleges` | Faculty development is sold as one of "Three strands", with an FAQ answering "Yes" to training faculty. Not a confirmed offering. | **Critical** (claim) | Remove, or show as `[TO BE CONFIRMED]` until you confirm. |
| `/learning-studio/colleges` | Industry tracks listed as AI & ML, Data Analytics, Full Stack, Cloud, Cybersecurity. The running programmes are SQL, Python, Git/GitHub, Excel, Power BI (BCA) and FinTech plus a general branch (B.Com). | **Critical** (claim) | List what runs. Anything else is `[TO BE CONFIRMED]`. |
| `/learning-studio/colleges` | No proof on the page at all, although East Point is real and cleared. | High | Add the stats (2 programmes, 80 students, 0 sessions missed, both extending) with source line, the faculty quote, and a link to `/work`. |
| `/learning-studio/colleges` | Primary keyword is the student-intent "placement training". | Medium | Retarget to "campus recruitment training" / "training partner for colleges" (see table). |
| `/learning-studio/colleges` | FAQ: "live online for institutions elsewhere in India". Unverified. | Low | Keep only if true `[TO BE CONFIRMED]`. |
| Hub, colleges | Enquiry form offers "Faculty Development", "Digital Transformation", "Individual professional". | Medium (claim) | Trim to real offers; confirm "Individual professional" is wanted. |
| `/learning-studio/trainers` | Title "Freelance Trainers & Facilitators, Bengaluru" + template → "… \| Chalkboard". Fine. Only BreadcrumbList schema. | Low | Keep. Add Studio Organization reference. |
| All Studio pages | Images: decorative `alt=""` and logo `alt="Chalkboard"`. No content images. | Low | Fine for now. New pages: real alt text on any diagram. |
| All Studio pages | Internal links: hub ↔ colleges ↔ trainers exist only in footers and one-line asides. Anchors like "That's here →". | Medium | Hub links to every Studio page with descriptive anchors; every page links back to the hub and to its neighbour. |

---

## Content gap recommendations

| Topic / keyword | Why it matters | Format | Priority | Effort |
|---|---|---|---|---|
| AI training for non-technical teams | Open SERP; the draft-before-AI rule is a real differentiator; flagship of the brief | Landing page `/ai-training` with FAQ | High | Substantial (multi-day) |
| Campus recruitment training / training partner for colleges | B2B intent, weak competition, and you have real proof | Rewrite of `/colleges` with proof | High | Moderate (half day) |
| East Point case study | The only real proof the Studio has. Competitors (Bridge2IT, CommLab) lead with case studies | `/work/east-point-college` | High | Moderate |
| Draft before AI: why learners write first | Informational SERP where educators rank with opinions; yours has a practice behind it | Insights pillar post | High | Moderate |
| Courses built from your own material | Consideration-stage; "convert SOP/deck to e-learning" long tail | `/custom-courses` | Medium | Moderate |
| How to roll out AI training for a team | Reddit ranks for this, which means no good guide exists | Insights post | Medium | Moderate |
| What a placement programme looks like week by week | Placement officers need to justify an MOU internally | Insights post linked from `/colleges` | Medium | Moderate |
| Sales, support, leadership training | Listed in the brief as company capabilities. Separate pages would be thin with no proof | Sections on the hub only (no own pages yet) | Low | Quick win |
| Country pages (US/UK/CA) | Out of scope; doorway risk until content differs | Routing prepared, nothing built | — | — |

Funnel gaps today: no awareness content at all (no posts), consideration content is thin (no case study, no method page), decision content is the enquiry form only.

---

## Technical SEO checklist

| Check | Status | Details |
|---|---|---|
| Unique titles | Pass | Hub, colleges and trainers each unique. Hub ≠ homepage on the live site. |
| Meta descriptions | Pass | Present, 140–160 chars. |
| One H1 per page | Pass | 1 each. |
| Canonicals | Pass | Self-referencing, absolute, www. |
| `meta keywords` | Fail | Present on all three; trainers inherits the tuition list. |
| vercel.app duplicates | Pass (Studio) / Warning (site) | `chalkboard-tuitions.vercel.app/learning-studio` 308s to www (verified live). The vercel.app homepage, `/tuitions` and `/about` still appear in the index; `/` is deliberately not redirected (Search Console verification), its canonical points to www. No Studio URL showed up on vercel.app. Nothing to change for the Studio. |
| robots.txt | Pass | Allows all, blocks `/admin` and `/api`. `Host:` line is ignored by Google (harmless). |
| sitemap.xml | Warning | Studio hub, colleges, trainers listed. `lastModified` is the build time on every URL, which teaches Google to ignore it. New pages need adding. |
| hreflang | N/A | None yet. Correct while there's one English version. Routing to be prepared. |
| Structured data: Organization | Warning | Defined only on the homepage. Studio nodes point at `/#organization` but the node isn't on Studio pages. No address anywhere for the organisation. `foundingDate: 2018` + `legalName: Chalkboard Learning Services LLP` implies the LLP dates from 2018. |
| Structured data: Service | Warning | Hub uses `ProfessionalService` with an offer catalogue. Colleges uses `Service` with `areaServed: Bengaluru, India` only. No per-offer Service nodes. |
| Structured data: FAQPage | **Fail** | Markup lists 5 Q&As per page, but the accordion unmounts closed answers, so 4 of 5 answers are **not in the HTML** (checked: "storyboarded end to end" appears 0 times outside JSON-LD). Google requires FAQ content to be visible on the page. Note: since 2023 Google shows FAQ rich results only for government and health sites, so this markup won't produce a rich result here either way; it still feeds AI answers and must match the page. |
| Breadcrumbs | Pass | BreadcrumbList on all three. No visible breadcrumb trail (optional). |
| Open Graph images | **Fail** | One Tuitions card for every page. |
| HTTPS / mixed content | Pass | |
| Mobile viewport, tap targets | Pass | |
| Lighthouse mobile: hub | Warning | Perf **66**, A11y 94, BP 100, SEO 100. LCP 3.3 s, **TBT 1,410 ms**, CLS 0. PromptLesson + CourseBuild + framer-motion hydrate on load. |
| Lighthouse mobile: colleges | Warning | Perf 94, A11y 95, SEO 100. LCP 3.0 s, TBT 70 ms, CLS 0. |
| Lighthouse mobile: trainers | Warning | Perf 93, A11y 87, SEO 100. LCP 3.2 s, TBT 30 ms, CLS 0. |
| LCP (all) | Warning | ~3 s against a 2.5 s target. Text LCP waits on fonts: three families preloaded on every page, including Special Elite, which only the Tuitions page uses. |
| Colour contrast | Fail | Gold numerals `text-gold/70` on cream (hub), small gold label on cream (trainers), `text-gray-400` in TransformBoring (colleges), `text-chalk/50` in footer. |
| Fonts via `next/font` | Pass | Playfair Display, DM Sans (and Special Elite) via `next/font/google`. |
| Images via `next/image` | Pass | Logo uses `next/image`. Source PNGs are 1.3–1.6 MB; Next resizes them, but an emblem SVG or small WebP is better. |
| Orphan pages | Pass | No orphans, but Studio pages are mostly linked from the footer. |
| Broken links | Pass | No broken internal links found in rendered HTML. |
| `html lang` | Pass | `en-IN`. Fine for now; hreflang handles country targeting later. |

---

## Competitor comparison

No backlink or traffic data. This compares what's on the page, and is a qualitative read.

Chosen for overlap with each Studio offer: **Correlation One** (AI training for employees, US), **CommLab India** (custom e-learning and Storyline, India), **Bridge2IT** (campus recruitment training for colleges, India).

| Dimension | Chalkboard Studio | Correlation One | CommLab India | Bridge2IT | Winner |
|---|---|---|---|---|---|
| Keyword coverage | 3 pages, no posts | Dedicated GenAI-for-employees page plus resources | Service pages per tool and format, large blog ranking for "Storyline 360 development" | Dedicated `/for-colleges` page ranking for CRT queries | CommLab |
| Content depth | Interactive demos, short copy; no case study | Role-based tracks, outcomes copy | Case studies, process, tool pages | Programme detail, "8 years" track record | CommLab |
| Publishing frequency | None | Regular | High (blog) | Low | CommLab |
| Backlink signals | Very low (new domain, a few directories) | Strong (funded, press) | Strong (listicles, eLearning Industry directory) | Low–moderate | Correlation One / CommLab |
| Technical | Lighthouse SEO 100, perf 66–94 mobile | Not measured | Not measured | Not measured | Unknown |
| SERP features | None | Top 3 organic for AI-for-employees queries | Ranks in listicles and own blog | Organic only | Correlation One |
| Proof | 1 real college partner, cleared quote and stats | Enterprise logos | 1,000s of projects, named clients | Hiring partners, years | Competitors |
| Distinct method | **Draft-before-AI; interactive lesson in the hero** | Role-specific workflows | Rapid development | Aptitude + mock drives | **Chalkboard** |

Where Chalkboard can win: open AI-for-non-technical-teams and college-partner SERPs, a method nobody else states, and one honest case study with numbers. Where it can't yet: head e-learning terms and anything that needs client logos.

---

## Prioritised action plan

### Quick wins (this week)

| Action | Impact | Effort | Depends on |
|---|---|---|---|
| Studio layout: drop `keywords`, set `authors` to the Studio | Medium | <1 h | — |
| Per-page OG images for Studio routes | High (sharing, brand) | 2 h | — |
| Render all FAQ answers in the HTML (keep the accordion behaviour) | High | 1 h | — |
| Fix contrast failures | Medium | 1 h | — |
| Remove faculty development and unconfirmed tracks from colleges; fix the 2018 line on the hub | High (risk) | 1 h | Your confirmation |
| Real `lastModified` dates in the sitemap | Low | <1 h | — |
| Search Console: request reindex of hub and colleges after deploy | Medium | 15 min | Deploy |

### Strategic investments (this quarter)

| Action | Impact | Effort | Depends on |
|---|---|---|---|
| Studio footer and nav variant, emblem-only logo | High | Half day | Emblem asset |
| Organization + Service + Course JSON-LD on every Studio page | Medium | Half day | Address decision |
| Hub rebuilt as a hub (what we do, who for, how we work) | High | 1–2 days | — |
| `/ai-training` flagship landing page with FAQ | High | 2 days | — |
| `/colleges` rewritten around CRT / training-partner intent, with proof | High | 1 day | — |
| `/work` + East Point case study | High | 1 day | Your sign-off on the story |
| `/custom-courses` ("opening to first partners") | Medium | 1 day | Storyline/tracking answers |
| `/insights` scaffold with topic clusters, first pillar post on draft-before-AI | Medium | 1 day scaffold, posts ongoing | Your review of each post |
| Hub TBT: lazy-hydrate heavy demos below the fold; stop preloading Special Elite on Studio | Medium | Half day | — |
| Get listed in "top corporate AI training providers India" listicles and eLearning Industry's directory | Medium (links) | Ongoing | Case study live |
| Connect an SEO tool or share Search Console data to replace the hypotheses here with volumes | High (decisions) | 1 h | You |
