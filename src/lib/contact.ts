/**
 * The one public contact email for every Chalkboard unit (Tuitions, Learning
 * Studio, trainers). Plain module so both server and client components can
 * import the string itself.
 */
export const CONTACT_EMAIL = "connect@chalkboardlearning.in";

/**
 * The routes on /contact (`/contact?for=…`). Kept here, not in the client
 * ContactRouter, so the server page can validate the query string with it.
 */
export const CONTACT_TOPICS = ["tuitions", "company", "college", "professional", "trainer", "family", "other"] as const;
export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export function isContactTopic(v: string | undefined): v is ContactTopic {
  return !!v && (CONTACT_TOPICS as readonly string[]).includes(v);
}
