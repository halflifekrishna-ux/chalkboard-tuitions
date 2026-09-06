// Responsive overflow QA — asserts scrollWidth <= clientWidth on every marketing
// route across the target widths, and reports the offending elements if not.
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
console.log(fail ? `\n${fail} OVERFLOW FAILURE(S)` : "\nALL PASS — no horizontal overflow on any route/width");
process.exit(fail ? 1 : 0);
