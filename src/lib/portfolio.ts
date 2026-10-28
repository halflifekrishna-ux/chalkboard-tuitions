/**
 * The Studio's portfolio: programs our team has designed and run. Every
 * entry comes from a delivery report or a running program; every number is a
 * figure from that program's own feedback survey or schedule. Nothing here is
 * rounded up, summed across cohorts or estimated.
 *
 * Sources (kept by the team): East Point executive summaries dated
 * 10 Oct 2023 (cybersecurity; Advanced Excel), 23 Jan 2025 (Advanced Excel)
 * and 30 Mar 2026 (Advanced Excel), plus the 2026 MOU programs.
 *
 * To add a program: append an entry. /work, the hub and the colleges page all
 * read from here. Newest first.
 */

export type Audience = "college" | "company";

export type Program = {
  id: string;
  title: string;
  client: string;
  audience: Audience;
  /** Human-readable period, e.g. "Mar 2026". */
  period: string;
  year: number;
  summary: string;
  topics: string[];
  /** Short facts about the delivery (length, format). */
  facts?: string[];
  /** One headline result from the program's own feedback, with its basis. */
  result?: { value: string; label: string; basis: string };
};

export const PROGRAMS: Program[] = [
  {
    id: "bca-placement-accelerator-2026",
    title: "BCA Placement Accelerator",
    client: "East Point College of Management",
    audience: "college",
    period: "2026",
    year: 2026,
    summary: "The tools technical rounds test, learned hands-on alongside the degree, under an MOU with the college.",
    topics: ["SQL", "Python", "Git & GitHub", "Excel", "Power BI"],
    result: { value: "0", label: "sessions missed", basis: "Across this program and the B.Com Industry Accelerator, 80 students in all. Continuing next semester." },
  },
  {
    id: "bcom-industry-accelerator-2026",
    title: "B.Com Industry Accelerator",
    client: "East Point College of Management",
    audience: "college",
    period: "2026",
    year: 2026,
    summary: "A FinTech track with a specialist trainer, and a general branch, run under an MOU alongside the degree.",
    topics: ["FinTech", "General branch"],
    facts: ["Continuing next semester"],
  },
  {
    id: "advanced-excel-2026",
    title: "Advanced Excel, with AI-assisted analysis",
    client: "East Point College of Management",
    audience: "college",
    period: "Mar 2026",
    year: 2026,
    summary: "From worksheet basics to lookups, data cleansing and AI-assisted analysis, built around real case studies and a final assessment.",
    topics: ["XLOOKUP", "Logical functions", "Data cleansing", "AI-assisted analysis"],
    facts: ["15 sessions", "30 hours", "Mock test and final assessment"],
  },
  {
    id: "advanced-excel-2025",
    title: "Advanced Excel",
    client: "East Point College of Management",
    audience: "college",
    period: "Jan–Feb 2025",
    year: 2025,
    summary: "Sixteen modules from formatting to lookups, data analysis and macros, taught hands-on over five weeks.",
    topics: ["Lookups", "Data analysis", "Data cleansing", "Macros"],
    facts: ["16 modules", "5 weeks"],
    result: { value: "97%", label: "rated it 4 or 5 out of 5", basis: "75 of 77 students who answered the feedback survey." },
  },
  {
    id: "cybersecurity-2023",
    title: "Cybersecurity and ethical hacking",
    client: "East Point College of Management",
    audience: "college",
    period: "Sep–Oct 2023",
    year: 2023,
    summary: "Networking fundamentals through reconnaissance, scanning, system hacking and social engineering, with live labs in Kali Linux.",
    topics: ["Networking", "Kali Linux", "Reconnaissance", "Social engineering"],
    facts: ["7 modules", "Hands-on labs"],
    result: { value: "100%", label: "said the sessions were engaging", basis: "All 22 students who answered the feedback survey. 95% were satisfied or very satisfied with the content." },
  },
  {
    id: "advanced-excel-2023",
    title: "Advanced Excel",
    client: "East Point College of Management",
    audience: "college",
    period: "Oct–Nov 2023",
    year: 2023,
    summary: "The first Excel program at the college: sixteen modules from worksheets to lookups, logic and macros.",
    topics: ["Formulae", "Lookups", "Logical functions", "Macros"],
    facts: ["16 modules", "6 weeks"],
  },
];

export const FIRST_YEAR = Math.min(...PROGRAMS.map((p) => p.year));
export const programsFor = (a: Audience) => PROGRAMS.filter((p) => p.audience === a);
