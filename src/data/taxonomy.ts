/**
 * Remerg taxonomy — needs and map categories.
 *
 * Two different vocabularies live on remerg.com and they are NOT the same thing:
 *
 *  - NEEDS (16) come from the registration survey's `sur_resources_needed[]`
 *    field. They are phrased the way a person describes their own situation:
 *    "I need food", "I need my ID".
 *  - MAP_CATEGORIES (6) come from the `map_categories` WordPress taxonomy
 *    (term IDs 988–993). They are phrased the way an *institution* is filed:
 *    "UA Sites", "Halfway Houses".
 *
 * The website leads with the institutional vocabulary. This app leads with the
 * personal one and treats the institutional list as a drill-down, because
 * someone who just got out knows they need a place to sleep tonight — they do
 * not necessarily know that maps to "Re-entry Orgs".
 */

import type { IconName } from '@/components/ui/icon';

export type { IconName };

export type Need = {
  /** Matches the survey's `val_N` so answers post back unchanged. */
  id: string;
  label: string;
  /** Shorter label for the home grid tiles. */
  short: string;
  icon: IconName;
  /** Map category slugs worth showing for this need. */
  related: string[];
};

/**
 * Survey field: sur_resources_needed[]
 *
 * Icons are the sign the service itself uses — an Rx for substance use, a
 * hospital cross for health care, a badge for parole, a house for housing —
 * so the grid is readable at a glance and by someone who reads slowly or not
 * at all.
 */
export const NEEDS: Need[] = [
  { id: 'val_0',  label: 'Housing',                                  short: 'Housing',        icon: 'mci:home-city',               related: ['halfway-houses', 're-entry-orgs'] },
  { id: 'val_1',  label: 'Employment',                               short: 'Jobs',           icon: 'mci:briefcase',               related: ['job-readiness'] },
  { id: 'val_2',  label: 'Food',                                     short: 'Food',           icon: 'mci:silverware-fork-knife',   related: ['re-entry-orgs'] },
  { id: 'val_3',  label: 'Transportation',                           short: 'Transport',      icon: 'mci:bus',                     related: ['re-entry-orgs'] },
  { id: 'val_4',  label: 'Mental health services',                   short: 'Mental health',  icon: 'mci:brain',                   related: ['crisis-walk-in-centers'] },
  { id: 'val_5',  label: 'Substance use treatment',                  short: 'Substance use',  icon: 'mci:prescription',            related: ['ua-sites', 'crisis-walk-in-centers'] },
  { id: 'val_6',  label: 'ID / paperwork',                           short: 'ID & docs',      icon: 'mci:card-account-details',    related: ['re-entry-orgs'] },
  { id: 'val_7',  label: 'Legal assistance',                         short: 'Legal',          icon: 'mci:scale-balance',           related: ['re-entry-orgs'] },
  { id: 'val_8',  label: 'Health care',                              short: 'Health care',    icon: 'mci:hospital-box',            related: ['crisis-walk-in-centers'] },
  { id: 'val_9',  label: 'Benefits (Medicaid, SNAP, SSI/SSDI)',      short: 'Benefits',       icon: 'mci:cash-multiple',           related: ['re-entry-orgs'] },
  { id: 'val_10', label: 'Education / training',                     short: 'Education',      icon: 'mci:school',                  related: ['job-readiness'] },
  { id: 'val_11', label: 'Technology & phone access',                short: 'Phone & tech',   icon: 'mci:cellphone',               related: ['re-entry-orgs'] },
  { id: 'val_12', label: 'Support with parole/probation conditions', short: 'Parole help',    icon: 'mci:police-badge',            related: ['parole-offices', 'ua-sites'] },
  { id: 'val_13', label: 'Relationship or family support',           short: 'Family',         icon: 'mci:human-male-female-child', related: ['re-entry-orgs'] },
  { id: 'val_14', label: 'Re-entry peer support',                    short: 'Peer support',   icon: 'mci:hand-heart',              related: ['re-entry-orgs'] },
  { id: 'val_15', label: 'Other',                                    short: 'Something else', icon: 'mci:dots-horizontal',         related: [] },
];

export type MapCategory = {
  /** WordPress `map_categories` term ID. */
  termId: number;
  slug: string;
  name: string;
  icon: IconName;
  blurb: string;
};

/** WordPress taxonomy: map_categories */
export const MAP_CATEGORIES: MapCategory[] = [
  { termId: 993, slug: 'crisis-walk-in-centers', name: 'Crisis Walk-in Centers', icon: 'mci:hospital-box',     blurb: 'Walk in without an appointment when things are bad.' },
  { termId: 992, slug: 'halfway-houses',         name: 'Halfway Houses',         icon: 'mci:home-group',       blurb: 'Community corrections and transitional housing.' },
  { termId: 991, slug: 'job-readiness',          name: 'Job Readiness',          icon: 'mci:briefcase-search', blurb: 'Training, résumé help and fair-chance employers.' },
  { termId: 990, slug: 'parole-offices',         name: 'Parole Offices',         icon: 'mci:police-badge',     blurb: 'Find the office handling your supervision.' },
  { termId: 989, slug: 're-entry-orgs',          name: 'Re-entry Orgs',          icon: 'mci:handshake',        blurb: 'Nonprofits that help with the whole transition.' },
  { termId: 988, slug: 'ua-sites',               name: 'UA Sites',               icon: 'mci:test-tube',        blurb: 'Urinalysis testing locations for your conditions.' },
];

/** Survey field: sur_description — how the person relates to the system. */
export const JUSTICE_STATUS = [
  'I am currently on parole',
  'I am currently on probation',
  'I am pre-release (still incarcerated)',
  'I am formerly incarcerated (not on parole/probation)',
  'I work for a jail',
  'I work for the Dept. of Corrections',
  'I am a family member or support person',
  'I work in the community (service provider, nonprofit, state, county, supervision, etc.)',
  'Other',
] as const;

/** Survey field: sur_age */
export const AGE_RANGES = ['<18', '18–24', '25–34', '35–44', '45–54', '55-64', '65+'] as const;

export const needById = (id: string) => NEEDS.find((n) => n.id === id);
export const categoryBySlug = (slug: string) => MAP_CATEGORIES.find((c) => c.slug === slug);
