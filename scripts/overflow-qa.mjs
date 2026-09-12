// Responsive overflow QA — for every marketing route across the target widths:
//  1. OVERFLOW: asserts scrollWidth <= clientWidth (no horizontal page scroll).
//  2. CLIP: asserts no in-flow content sits past the viewport edge. This catches
//     content that a parent's overflow-hidden silently cuts off — invisible to
//     check 1 (e.g. a grid track blown out by a marquee's max-content width).
//     Run with prefers-reduced-motion so scroll transforms don't skew the
//     geometry. Skips absolute/fixed decoration, aria-hidden subtrees, and
//     anything inside [data-allow-overflow] (intentional, e.g. marquee rows).
// Usage: BASE=http://localhost:3000 node scripts/overflow-qa.mjs
import { chromium } from "playwright";

const widths = [320, 360, 375, 390, 393, 414, 768, 1024, 1280, 1440];
const routes = ["/", "/tuitions", "/about", "/learning-studio", "/os", "/contact"];
const base = process.env.BASE || "http://localhost:3000";

const browser = await chromium.launch();
let fail = 0;

for (const route of routes) {
  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: 820 } });
    await page.goto(base + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(250);
    const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    const overflow = r.sw > r.cw + 1;
    let offenders = [];
    if (overflow) {
      offenders = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const bad = [];
        document.querySelectorAll("*").forEach((el) => {
          const b = el.getBoundingClientRect();
          if (b.right > vw + 1) bad.push(`${el.tagName.toLowerCase()}.${String(el.className || "").split(" ").slice(0, 2).join(".")} right=${Math.round(b.right)}`);
        });
        return [...new Set(bad)].slice(0, 6);
      });
    }
    console.log(`${overflow ? "FAIL" : "ok  "} ${route.padEnd(18)} @${String(w).padStart(4)}  sw=${r.sw} cw=${r.cw}${overflow ? "  :: " + offenders.join(" | ") : ""}`);
    if (overflow) fail++;

    // CLIP check (reduced motion, fresh load so components read the media query at mount)
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(250);
    const clipped = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const bad = [];
      for (const el of document.querySelectorAll("body *")) {
        if (el.closest('[aria-hidden="true"], [data-allow-overflow], script, style, noscript, svg')) continue;
        const cs = getComputedStyle(el);
        if (cs.position === "absolute" || cs.position === "fixed" || cs.display === "none" || cs.visibility === "hidden") continue;
        const b = el.getBoundingClientRect();
        if (b.width === 0 || b.height === 0) continue;
        if (b.right > vw + 1 || b.left < -1) {
          // Deliberate single-line truncation (text-overflow: ellipsis) isn't accidental clipping.
          let truncated = false;
          for (let a = el; a && a !== document.body; a = a.parentElement) {
            if (getComputedStyle(a).textOverflow === "ellipsis") { truncated = true; break; }
          }
          if (truncated) continue;
          bad.push(`${el.tagName.toLowerCase()}.${String(el.className || "").split(" ").slice(0, 2).join(".")} [${Math.round(b.left)},${Math.round(b.right)}]`);
        }
      }
      return [...new Set(bad)].slice(0, 5);
    });
    if (clipped.length) {
      console.log(`CLIP ${route.padEnd(18)} @${String(w).padStart(4)}  :: ${clipped.join(" | ")}`);
      fail++;
    }
    await page.close();
  }
}

for (const [w, name] of [[390, "mobile"], [1440, "desktop"]]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2200); // let scroll-reveals resolve before capture
  await page.screenshot({ path: `/tmp/cb-home-${name}.png`, fullPage: true });
  await page.close();
}

await browser.close();
console.log(fail ? `\n${fail} FAILURE(S)` : "\nALL PASS — no horizontal overflow or clipped content on any route/width");
process.exit(fail ? 1 : 0);
