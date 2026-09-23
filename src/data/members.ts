/**
 * Remerg's organisation listings — the ones behind a free Remerg account.
 *
 * In git, members.generated.json is an EMPTY stub, so a fresh clone builds
 * and simply shows no listings. On a machine where the owner has signed in to
 * their own Remerg account, scripts/local/remerg-members-ingest.mjs fills it
 * for local testing; that copy is hidden from git (--skip-worktree) and the
 * pre-commit hook refuses to commit it. Publishing these listings needs
 * Remerg's permission.
 */

import type { Topic } from '@/data/topics';

import raw from './members.generated.json';

export type MemberOrg = {
  slug: string;
  /** The organisation's page on remerg.com. */
  url: string;
  name: string;
  regions: string[];
  city: string | null;
  description: string;
  logo: string | null;
  /** Remerg's attribute icons: "Women", "Disability-Inclusive", … */
  tags: string[];
  /** Remerg topic slugs, e.g. "essentials". */
  topics: string[];
  /** "topic/subtopic" slugs, e.g. "essentials/food". */
  subtopics: string[];
  phone?: string;
  website?: string;
  hours?: string;
  email?: string;
  /** Street address, when Remerg gives one. */
  address?: string;
  /** From the US Census geocoder, when there is a street address to look up. */
  lat?: number;
  lng?: number;
};

type Payload = { source: string; fetchedAt: string | null; count: number; orgs: MemberOrg[] };
const payload = raw as unknown as Payload;

export const MEMBER_ORGS: MemberOrg[] = payload.orgs;
export const MEMBERS_FETCHED_AT = payload.fetchedAt;
export const HAS_MEMBER_LISTINGS = MEMBER_ORGS.length > 0;

/** A topic's slug on remerg.com, which is not always the app's (shelters). */
export const remergTopicSlug = (t: Topic) => t.url.split('/category/')[1].replace(/\/+$/, '');

/** Listings for a topic, optionally narrowed to one of its subtopics. */
export function membersFor(topic: Topic, subtopicSlug?: string | null): MemberOrg[] {
  const ts = remergTopicSlug(topic);
  return MEMBER_ORGS.filter((o) =>
    subtopicSlug ? o.subtopics.includes(`${ts}/${subtopicSlug}`) : o.topics.includes(ts),
  );
}
