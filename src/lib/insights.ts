import { STUDIO_PATH } from "@/lib/studio";

/**
 * Learning Studio insights: posts grouped into topic clusters. Each cluster
 * points at the service page it supports (its "pillar"), and every post links
 * back to that pillar, so the informational searches a post wins feed the page
 * that sells.
 *
 * To add a post: append to POSTS with a new slug. The index, the post page,
 * the sitemap and the share image all read from here. Keep every fact checkable;
 * the copy rules in scripts/copy-check.mjs apply (`npm run check:copy`).
 */

export const INSIGHTS_PATH = `${STUDIO_PATH}/insights`;

export type Cluster = { id: "ai-at-work" | "college-readiness" | "course-design"; name: string; blurb: string; pillar: { href: string; label: string } };

export const CLUSTERS: Cluster[] = [
  {
    id: "ai-at-work",
    name: "AI at work",
    blurb: "Using generative AI well: drafting first, prompting with context, checking what comes back.",
    pillar: { href: `${STUDIO_PATH}/ai-training`, label: "AI training for teams" },
  },
  {
    id: "college-readiness",
    name: "College readiness",
    blurb: "Closing the gap between knowing the syllabus and doing the job on day one.",
    pillar: { href: `${STUDIO_PATH}/colleges`, label: "Programs for colleges" },
  },
  {
    id: "course-design",
    name: "Course design",
    blurb: "Turning a deck, an SOP or one expert's knowledge into something people practise.",
    pillar: { href: `${STUDIO_PATH}/custom-courses`, label: "Custom course development" },
  },
];

export type Block =
  | { p: string }
  | { h2: string }
  | { quote: string }
  | { ol: string[] }
  | { ul: string[] };

export type Post = {
  slug: string;
  title: string;
  /** Meta description and card summary. */
  description: string;
  cluster: Cluster["id"];
  published: string;
  updated: string;
  minutes: number;
  body: Block[];
};

export const POSTS: Post[] = [
  {
    slug: "write-the-first-draft-before-ai",
    title: "Write the first draft yourself, then use AI: why we teach it in that order",
    description:
      "Starting with AI gets you a fast, average draft and skips the thinking. Why our training has people write first and use AI second, and how to run it with a team.",
    cluster: "ai-at-work",
    published: "2026-10-28",
    updated: "2026-10-28",
    minutes: 5,
    body: [
      {
        p: "Ask a team to write a client email with AI and most people do the same thing. They open the chat, type something like “write an email to a client about the delay”, and edit whatever comes back. It's quick. It's also why so many of those emails sound alike.",
      },
      {
        p: "In our training the order is reversed. The learner writes the first draft. Then AI helps make it better. This post explains why, and how to run the same exercise with your own team.",
      },
      { h2: "What goes wrong when AI writes first" },
      {
        p: "A first draft is where you decide what you're saying. Who is this for? What do they already know? What should they do next? When AI writes the first version, it makes those decisions for you, and it makes them the most average way it can.",
      },
      {
        p: "Then something subtle happens. Editing feels like work, so the edited version feels like yours. But the structure, the emphasis and most of the claims came from the tool. You've approved a draft rather than written one.",
      },
      {
        p: "That matters most when the AI is wrong. Someone who never decided what the email should say has nothing to check it against.",
      },
      { h2: "What changes when people draft first" },
      {
        p: "A rough draft, even a bad one, carries the facts only you have: the customer's name, the real reason for the delay, the thing you promised last week. Give that to AI and it has something specific to improve.",
      },
      {
        p: "The prompt changes too. “Write an email about the delay” becomes “Here's my draft. Make it shorter and warmer, and keep the new delivery date exactly as it is.” The first prompt leaves AI guessing. The second tells it what to protect.",
      },
      {
        p: "And the person keeps the judgement. When the polished version quietly moves a date or softens an apology, they notice, because they wrote the original.",
      },
      { h2: "It works for resumes and code as well" },
      { p: "With students, the exercise often starts with one line of a resume. Here's a line AI wrote from a blank prompt:" },
      { quote: "Results-driven professional with strong analytical skills and a passion for leveraging data to drive impact." },
      { p: "It could describe anyone. Here's a student's own draft:" },
      { quote: "Made a Power BI dashboard for the college canteen that showed which items sold out by noon." },
      { p: "Rough, and true. Refined with AI, it keeps every fact and reads better:" },
      { quote: "Built a Power BI dashboard of canteen sales by hour, showing which items sold out before noon and when to restock." },
      {
        p: "Code follows the same pattern. Write the function, then ask AI to review it, explain it back or suggest tests. A developer who wrote it can tell a good suggestion from a confident wrong one.",
      },
      { h2: "How to run it with your team" },
      {
        ol: [
          "Pick one piece of work the team writes every week, such as a client update, a ticket reply or a weekly report.",
          "Give everyone ten minutes to write their own version with no AI open. Rough is fine.",
          "Have them paste that draft into the AI tool they're allowed to use, with one instruction about what to improve and one about what to keep.",
          "Put an AI-only version, their draft and their refined draft side by side. Ask which one a customer would believe.",
          "Next week, do it again on real work instead of a practice task.",
        ],
      },
      { h2: "When it's fine to start with AI" },
      {
        p: "Not every task needs a draft. Summarising a long document, turning notes into a table or brainstorming twenty subject lines are jobs where AI can go first, because the judgement comes afterwards, when you choose what to keep.",
      },
      {
        p: "The rule matters when the writing carries your thinking: anything a customer, a manager or an interviewer will judge you by.",
      },
      { h2: "The short version" },
      {
        p: "Write it first. Then let AI make it better. It takes a few minutes longer, and the people who work this way keep getting better at the work itself.",
      },
    ],
  },
];

export const postPath = (slug: string) => `${INSIGHTS_PATH}/${slug}`;
export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);
export const clusterOf = (post: Post) => CLUSTERS.find((c) => c.id === post.cluster)!;
