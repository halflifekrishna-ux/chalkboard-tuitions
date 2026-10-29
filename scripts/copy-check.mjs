#!/usr/bin/env node
/**
 * copy-check — flags the writing tells we've agreed to keep out of Learning
 * Studio copy. Run: `npm run check:copy` (or pass file paths).
 *
 * It reads the source, drops comments, and searches what's left: JSX text and
 * string literals are what visitors see. It can't judge rhythm or "lists of
 * three"; those still need a person. A hit here is a prompt to rewrite, not a
 * rule the build enforces.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const DEFAULT_ROOTS = ["src/app/(studio)", "src/components/marketing/learning-studio", "src/lib/studio.ts", "src/lib/studio-og.tsx"];

const RULES = [
  { name: "em dash", re: /—/g },
  { name: "not X, it's Y", re: /\b(?:it'?s|this is|that'?s) not (?:just |only |about )?[^.?!]{1,60}[,;] (?:it'?s|but)\b/gi },
  { name: "not only / not just … but", re: /\bnot (?:only|just)\b[^.?!]{1,80}\bbut\b/gi },
  { name: "filler transition", re: /(?:^|[.!?]\s+|["'`>{]\s*)(?:Moreover|Furthermore|Additionally|In addition|In contrast|On the other hand)\b/g },
  { name: "inflated importance", re: /\b(?:plays? a (?:vital|crucial|pivotal|key) role|stands? as a testament|testament to|lasting impact|watershed|underscores?|solidif(?:y|ies)|game[- ]changer|paradigm)\b/gi },
  { name: "throat-clearing", re: /\b(?:it'?s|it is) (?:important|worth) (?:to note|noting|mentioning)|no discussion (?:would|of)/gi },
  { name: "vague attribution", re: /\b(?:industry )?(?:experts|observers|critics|studies) (?:say|agree|have noted|argue|show)\b|\bsome (?:believe|say)\b/gi },
  { name: "promotional padding", re: /\b(?:breathtaking|rich (?:cultural )?heritage|enduring legacy|deeply rooted|world[- ]class|cutting[- ]edge|state[- ]of[- ]the[- ]art|best[- ]in[- ]class|seamless(?:ly)?|unlock|empower(?:s|ing)?|elevate|supercharge|revolutioni[sz]e|transformative|groundbreaking|synerg\w*|delve|tapestry|leverage)\b/gi },
  { name: "empty -ing tail", re: /, (?:ensuring|highlighting|reflecting|underscoring|showcasing|fostering|enabling) [a-z]+(?: [a-z]+){0,3}[.!]/gi },
  { name: "cost headline", re: /\b(?:affordable|cheap|low[- ]cost|budget[- ]friendly)\b/gi },
  { name: "2018 on a Studio page", re: /\b(?:since|from) 2018\b/gi },
  { name: "placeholder left in copy", re: /\[(?:TO BE CONFIRMED|CHALKBOARD INPUT REQUIRED)\]/g },
];

function files(p) {
  const st = statSync(p);
  if (st.isFile()) return /\.(tsx?|mdx?)$/.test(p) ? [p] : [];
  return readdirSync(p).flatMap((f) => files(join(p, f)));
}

function stripComments(src) {
  // Block comments (incl. JSX {/* … */}) and line comments, keeping line count.
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:"'`])\/\/.*$/gm, (m, pre) => pre + " ".repeat(m.length - pre.length));
}

const targets = (process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_ROOTS).flatMap(files);
let hits = 0;
for (const file of targets) {
  const text = stripComments(readFileSync(file, "utf8"));
  const lines = text.split("\n");
  for (const { name, re } of RULES) {
    lines.forEach((line, i) => {
      for (const m of line.matchAll(re)) {
        hits++;
        console.log(`${file}:${i + 1}  [${name}]  …${line.slice(Math.max(0, m.index - 30), m.index + m[0].length + 30).trim()}…`);
      }
    });
  }
}
console.log(hits ? `\n${hits} hit(s) in ${targets.length} file(s).` : `copy-check: clean (${targets.length} files).`);
process.exit(hits ? 1 : 0);
