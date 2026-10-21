# Local SEO: Chalkboard Tuitions (chalkboardlearning.in/tuitions)

Audited 2026-10-21 with the claude-seo `seo-local` skill (v2.4.2).

**Business type:** Brick-and-mortar, one centre. **Vertical:** Education / tutoring (generic LocalBusiness path; schema type `EducationalOrganization` + `LocalBusiness`).

## Local SEO score

| Dimension | Weight | Before | After code fixes | What moves it |
|---|---|---|---|---|
| Google Business Profile signals | 25% | 40 | 40 | Categories, photos, posts, website link (off-site) |
| Reviews & reputation | 20% | 20 | 20 | Steady Google reviews (off-site) |
| Local on-page | 20% | 45 | 75 | Done: city in title + H1, full address on every page. Next: board/grade pages |
| NAP consistency & citations | 15% | 25 | 45 | Done on-site. Next: fix Facebook name, UrbanPro, add Justdial/Sulekha/Bing/Apple |
| Local schema | 10% | 60 | 90 | Done |
| Local links & authority | 10% | 20 | 20 | School/RWA/local press mentions (off-site) |
| **Total** | | **≈35** | **≈47** | The remaining gap is off-site: GBP and reviews are 45% of the score |

Scores are estimates from public signals. This audit could not see GBP Insights, the live review count, real map-pack positions (needs a geo-grid tool such as Local Falcon or DataForSEO), or backlink data.

## What was fixed in the code

- **One centre, stated consistently.** The site and schema claimed two centres (Kammanahalli + Kalyan Nagar). Only Kammanahalli exists. A schema branch with no real address and estimated coordinates that doesn't match any Google profile is a trust problem. Kalyan Nagar, HRBR Layout, Banaswadi, St Thomas Town and Lingarajapuram are now listed as areas served.
- **Full NAP on every page:** *Chalkboard Tuitions, 2nd Floor, Pooja Arcade, 50/2, Kammanahalli Main Rd, St Thomas Town, Kammanahalli, Bengaluru 560084, +91 74114 46381*. It's in the footer, the Tuitions contact block, the FAQ, `/contact` and the schema, all from `src/lib/tuitions-location.ts`.
- **Coordinates = the Google Business Profile pin** (13.0158889, 77.6361816). The schema had a point about 250 m away, and the map widget a third one.
- **Title:** "Tuition Centre in Kammanahalli, Bengaluru | Chalkboard". **H1** now begins "Tuition centre in Kammanahalli, Bengaluru". The brand line is unchanged.
- **Facebook link** pointed at a page that doesn't exist (`facebook.com/chalkboardtuitions`). It now points at the real page.
- **Old `chalkboard-tuitions.vercel.app` URLs**, which Google still lists, now 308-redirect to www (except `/admin` and `/api`).
- "Get directions on Google Maps" is now always visible, not hidden inside the map widget.

## Off-site actions, in order (these decide the map pack)

1. **Google Business Profile** (business.google.com):
   - Primary category **Tutoring service**. Secondary: **Coaching center**, **Educational institution**, **Learning center**.
   - Name exactly "Chalkboard Tuitions" (no keywords stuffed in, which is a suspension risk).
   - Address exactly as above. Hours Mon–Fri 4–8 PM.
   - Website: `https://www.chalkboardlearning.in/tuitions` (the tuition page, not the homepage).
   - Description: grades 1–10, CBSE/ICSE/State Board, max 8 per batch, nearby areas served.
   - **Services:** one per board and per grade band.
   - **Photos:** 10+ real ones (classroom, signboard, building entrance, a batch in session with consent). Add new ones monthly.
   - **Posts:** one a week (results, demo-class slots, exam tips).
2. **Reviews:** ask every current parent personally, a few each week, not all at once. Use the GBP "Ask for reviews" link on WhatsApp. Reply to every review. Never offer discounts for reviews and never ask only happy parents first (review gating is against Google policy). Ten reviews is the first threshold that matters.
3. **Fix your listings so they match exactly:**
   - **Facebook:** rename "ChalkBoard Tutions" to "Chalkboard Tuitions" and add the website.
   - **UrbanPro:** add the phone and website, and ask 3–5 parents to review there too.
   - **Instagram:** the bio says "Grades 1–12"; change it to 1–10, and add the address and website.
4. **New listings, with the same NAP:** Justdial, Sulekha, Bing Places (it feeds ChatGPT and Copilot answers), Apple Business Connect, and Google Maps for the building if "Pooja Arcade" isn't labelled.
5. **Local mentions:** HRBR/Kalyan Nagar Facebook and WhatsApp groups and RWAs (answer "tuition near me" posts honestly). Tie-ups with nearby schools' parent groups. Local listings such as "best tuitions in Kammanahalli" pages (Sulekha, Justdial, local blogs).

## Next on-site work (needs your input)

- **Board/grade pages** (`/tuitions/cbse`, `/tuitions/icse`, `/tuitions/state-board`, `/tuitions/class-10`). Dedicated service pages are the #1 local organic factor, but each needs real, specific content: syllabus approach, results, timetables. Do **not** create "tuitions in Kalyan Nagar" or "tuitions in HRBR" pages. With one centre those are doorway pages, which Google demotes.
- **Results and reviews on the page:** real board-exam results and real parent quotes with first name and area. `aggregateRating` schema can go in only once there are real Google reviews to mirror.

## Google Search Console checklist

See the steps in the chat reply; they're repeated here for reference:

1. After deploying, run URL Inspection → Request indexing for `/tuitions`, `/contact`, `/` (titles and H1 changed).
2. Sitemaps: leave `sitemap.xml` submitted. "No referring sitemaps detected" clears after Google re-reads it.
3. Add the old `https://chalkboard-tuitions.vercel.app` as a URL-prefix property (verify by HTML tag or file). Do **not** use the Change of Address tool: it only works between domain properties, and the 308 redirects already do the job. Watch its pages drop out over 2–6 weeks.
4. Performance → Search results → Queries: filter "kammanahalli", "kalyan nagar", "hrbr", "tuition". Check monthly: position, impressions and CTR for each.
5. Enhancements: check the FAQ and LocalBusiness markup under Enhancements / Rich results for errors, and use the Rich Results Test on `/tuitions`.
6. Page indexing: anything under "Duplicate, Google chose different canonical" should point to www. If vercel.app URLs show there, that's expected until the redirects are recrawled.
7. Link GA4 (Settings → Associations) to see which queries actually lead to demo bookings.
