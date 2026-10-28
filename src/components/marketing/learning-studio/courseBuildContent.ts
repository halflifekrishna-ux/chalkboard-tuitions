/**
 * The words in CourseBuild, kept in a plain module so the server-rendered
 * static version (CourseBuildStatic) and the animated client version say
 * exactly the same thing. Search engines read the static one.
 */

export const HEADING = {
  kicker: "How it gets built",
  title: "Your raw material in. A finished course out.",
};

export const ACTS = [
  { kicker: "01 · You hand it over", line: "A deck, an SOP, or one expert who knows it all. However messy." },
  { kicker: "02 · We storyboard it", line: "You approve the flow before a single screen gets built." },
  { kicker: "03 · We build it", line: "Decisions to make, things to drag, scores to chase." },
  { kicker: "04 · You see who did what", line: "Who finished, who struggled, exactly where they dropped off." },
] as const;

/* What a buyer receives. The animation shows the process; this says what lands
   on their desk, which is what turns a nice scroll into an enquiry. */
export const DELIVERABLES = [
  { k: "You bring", v: "The expertise your people already have, and the thing they keep getting wrong." },
  { k: "You sign off", v: "A storyboard, before a single screen is built." },
  { k: "You get", v: "Working modules: branching scenarios, simulations, gamified practice." },
  { k: "It runs", v: "In your LMS, packaged as SCORM or xAPI. On a laptop or a phone." },
  { k: "You track", v: "Completions, scores, and the exact screen people quit on." },
  { k: "It's built in", v: "Storyline, Rise, Captivate or whichever tool your team already uses." },
];
