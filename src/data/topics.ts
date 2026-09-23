/**
 * Remerg's resource topics — the same twenty, in the same order, with the same
 * subtopics as the "Search by topic and subtopic" grid on remerg.com.
 *
 * Copied from the public home page on 2026-09-22 (104 subtopics in all). The first ten are the ones
 * the website shows up front; the other ten sit behind its "Show more
 * resources" button, and the app does the same so the two feel like one
 * product. Each `url` is that topic's page on remerg.com.
 *
 * The website's topic pages are behind a free Remerg account. Their
 * organisations appear only where the owner has pulled them locally with
 * their own account (data/members.ts); everywhere else, each topic shows what
 * `content` describes: bundled crisis lines, treatment facilities and halfway
 * houses where they fit, and the related categories on Remerg's public map.
 */

import type { HotlineCategory } from '@/data/hotlines';
import type { IconName } from '@/data/taxonomy';

export type Topic = {
  slug: string;
  name: string;
  icon: IconName;
  /** Shown up front on remerg.com; the rest are behind "Show more resources". */
  main: boolean;
  url: string;
  /** Remerg's subtopics for this topic, with each one's page slug under `url`. */
  subtopics: { name: string; slug: string }[];
  content: {
    hotlines?: HotlineCategory[];
    /** Bundled SAMHSA facilities, by the survey need id resourcesForNeed() takes. */
    treatment?: 'val_4' | 'val_5' | 'val_8';
    /** Bundled Colorado community corrections (halfway house) programs. */
    halfwayHouses?: boolean;
    /** Related categories on Remerg's public map (MAP_CATEGORIES slugs). */
    mapCategories?: string[];
  };
  /** Survey needs (val_N) this topic answers, so personalized picks float up. */
  needs: string[];
};

const R = 'https://remerg.com/category';

export const TOPICS: Topic[] = [
  {
    slug: 'essentials', name: 'Essentials', icon: 'mci:tshirt-crew', main: true, url: `${R}/essentials/`,
    subtopics: [{ name: "Clothing", slug: 'clothing' }, { name: "Food", slug: 'food' }, { name: "Phones & Computers", slug: 'phones-computers' }, { name: "Resource / Community Centers", slug: 'resource-community-centers' }],
    content: { hotlines: ['basic-needs'], mapCategories: ['re-entry-orgs'] },
    needs: ['val_2', 'val_11'],
  },
  {
    slug: 'family', name: 'Family', icon: 'mci:account-group', main: true, url: `${R}/family/`,
    subtopics: [{ name: "Child Care", slug: 'child-care' }, { name: "Child Custody", slug: 'child-custody' }, { name: "Child Support", slug: 'child-support' }, { name: "Family Resource Centers", slug: 'family-resource-centers' }, { name: "Parenting Resources", slug: 'parenting-resources' }, { name: "Pets", slug: 'pets' }],
    content: { hotlines: ['support', 'safety'] },
    needs: ['val_13'],
  },
  {
    slug: 'health', name: 'Health & Treatment', icon: 'mci:medical-bag', main: true, url: `${R}/health/`,
    subtopics: [{ name: "Aging Population", slug: 'aging-population' }, { name: "Community Health Centers", slug: 'community-health-centers' }, { name: "COVID-19 Health Information", slug: 'covid-19-information' }, { name: "Crisis Walk-in Centers", slug: 'crisis-walk-in-centers' }, { name: "Detox", slug: 'detox' }, { name: "Disability", slug: 'disability-health' }, { name: "Harm Reduction", slug: 'harm-reduction' }, { name: "Health Resources", slug: 'health-resources' }, { name: "HIV Care & Resources", slug: 'hiv-care-and-resources' }, { name: "Medicaid", slug: 'medicaid' }, { name: "Medication Assisted Treatment", slug: 'medication-assisted-treatment' }, { name: "Mental Health & Substance Use Treatment", slug: 'mental-health-substance-use-treatment' }, { name: "Recovery Coaching & Support Groups", slug: 'recovery-coaching-support-groups' }, { name: "Telehealth & Nurselines", slug: 'telehealth-nurselines' }],
    content: { hotlines: ['crisis', 'recovery', 'health'], treatment: 'val_8', mapCategories: ['crisis-walk-in-centers', 'ua-sites'] },
    needs: ['val_4', 'val_5', 'val_8'],
  },
  {
    slug: 'housing', name: 'Housing', icon: 'mci:home', main: true, url: `${R}/housing/`,
    subtopics: [{ name: "Find Rental Housing", slug: 'find-rental-housing' }, { name: "Purchasing a Home", slug: 'purchasing-a-home' }, { name: "Rental & Mortgage Assistance", slug: 'rental-and-mortgage-assistance' }, { name: "Renting Rights, Responsibilities, & Eviction Info", slug: 'renting-info' }, { name: "Supportive Housing", slug: 'supportive-housing' }, { name: "Transitional Housing & Sober Living Homes", slug: 'transitional-housing-and-sober-living-homes' }],
    content: { hotlines: ['basic-needs'], halfwayHouses: true, mapCategories: ['halfway-houses'] },
    needs: ['val_0'],
  },
  {
    slug: 'identification', name: 'Identification', icon: 'mci:card-account-details', main: true, url: `${R}/identification/`,
    subtopics: [{ name: "Birth Certificate", slug: 'birth-certificate' }, { name: "Help Getting Your ID", slug: 'help-getting-your-id' }, { name: "Marriage License & Divorce Decree", slug: 'marriage-license-divorce-decree' }, { name: "Social Security Card", slug: 'social-security-card' }, { name: "State ID & Driver's License", slug: 'state-id-drivers-license' }],
    content: { mapCategories: ['re-entry-orgs'] },
    needs: ['val_6'],
  },
  {
    slug: 'jobs', name: 'Jobs & Training', icon: 'mci:handshake', main: true, url: `${R}/jobs/`,
    subtopics: [{ name: "Apprenticeships & Training", slug: 'apprenticeships-training' }, { name: "Community Organizations", slug: 'community-organizations' }, { name: "Entrepreneur Info", slug: 'entrepreneur-info' }, { name: "Fair Chance Companies", slug: 'fair-chance-companies' }, { name: "Fair Chance Hiring Info", slug: 'fair-chance-hiring-info' }, { name: "Job Search Agencies", slug: 'temp-agencies' }, { name: "Vocational Rehab", slug: 'vocational-rehab' }, { name: "Workforce Centers", slug: 'workforce-centers' }],
    content: { mapCategories: ['job-readiness'] },
    needs: ['val_1'],
  },
  {
    slug: 'parole-probation', name: 'Parole & Probation', icon: 'mci:gavel', main: true, url: `${R}/parole-probation/`,
    subtopics: [{ name: "Community Corrections", slug: 'community-corrections' }, { name: "Parole Mental Health Connections", slug: 'parole-mental-health-connections' }, { name: "Parole Offices", slug: 'parole-offices' }, { name: "Parole UA Sites", slug: 'parole-collection-sites' }, { name: "Probation", slug: 'probation' }],
    content: { halfwayHouses: true, mapCategories: ['parole-offices', 'ua-sites', 'halfway-houses'] },
    needs: ['val_12'],
  },
  {
    slug: 're-entry', name: 'Re-entry', icon: 'mci:door-open', main: true, url: `${R}/re-entry/`,
    subtopics: [{ name: "Justice Organizations", slug: 'justice-organizations' }, { name: "Re-entry Organizations", slug: 're-entry-organizations' }],
    content: { hotlines: ['support'], mapCategories: ['re-entry-orgs'] },
    needs: ['val_14'],
  },
  {
    slug: 'shelters', name: 'Shelters & Safe Houses/DV Help', icon: 'mci:home-heart', main: true,
    url: `${R}/shelters-safe-houses-domestic-violence-helpl/`,
    subtopics: [{ name: "Emergency Shelters", slug: 'emergency-shelters' }, { name: "Safe Houses/DV Help", slug: 'safe-houses-domestic-violence-help' }],
    content: { hotlines: ['safety', 'basic-needs'] },
    needs: ['val_0'],
  },
  {
    slug: 'social-services', name: 'Social Services', icon: 'mci:hand-heart', main: true, url: `${R}/social-services/`,
    subtopics: [{ name: "Disability", slug: 'disability' }, { name: "Human Services", slug: 'human-services' }, { name: "Social Security", slug: 'social-security' }],
    content: { hotlines: ['basic-needs'] },
    needs: ['val_9'],
  },
  {
    slug: 'community-connections', name: 'Community Connections', icon: 'mci:account-multiple-plus', main: false,
    url: `${R}/community-connections/`,
    subtopics: [{ name: "Events", slug: 'events' }, { name: "Gyms", slug: 'gyms' }, { name: "Mentoring", slug: 'mentoring' }, { name: "Restorative Justice", slug: 'restorative-justice' }, { name: "Spirituality", slug: 'spirituality-churches-synagogues-temples-mosques' }],
    content: { hotlines: ['support'], mapCategories: ['re-entry-orgs'] },
    needs: ['val_14'],
  },
  {
    slug: 'education', name: 'Education', icon: 'mci:school', main: false, url: `${R}/education/`,
    subtopics: [{ name: "College & Trade Schools", slug: 'college-trade-schools' }, { name: "Computer Skills", slug: 'computer-skills' }, { name: "ESL", slug: 'esl' }, { name: "High School Equivalency", slug: 'high-school-equivalency' }, { name: "Learning On Your Own", slug: 'learning-on-your-own' }, { name: "Libraries", slug: 'libraries-education' }, { name: "Loan Forgiveness", slug: 'loan-forgiveness' }, { name: "Technology", slug: 'technology' }],
    content: { mapCategories: ['job-readiness'] },
    needs: ['val_10'],
  },
  {
    slug: 'finance', name: 'Finance', icon: 'mci:cash', main: false, url: `${R}/finance/`,
    subtopics: [{ name: "Banking", slug: 'banking' }, { name: "Credit Scores & Repair", slug: 'credit-scores-repair' }, { name: "Great Colorado Payback", slug: 'great-colorado-payback' }, { name: "Money Skills & Financial Help", slug: 'money-skills-and-financial-help' }, { name: "Purchasing a Home", slug: 'purchasing-a-home-finance' }, { name: "Scams", slug: 'scams' }, { name: "Taxes", slug: 'taxes' }],
    content: {},
    needs: ['val_9'],
  },
  {
    slug: 'legal', name: 'Legal', icon: 'mci:scale-balance', main: false, url: `${R}/legal/`,
    subtopics: [{ name: "DA Dashboards", slug: 'da-dashboards' }, { name: "Legal", slug: 'legal-legal' }, { name: "Record Sealing", slug: 'record-sealing' }],
    content: { mapCategories: ['re-entry-orgs'] },
    needs: ['val_7'],
  },
  {
    slug: 'lgbtqia', name: 'LGBTQIA+', icon: 'mci:looks', main: false, url: `${R}/lgbtqia/`,
    subtopics: [{ name: "LGBTQIA+", slug: 'lgbtqia-lgbtqia' }],
    content: { hotlines: ['crisis', 'support'] },
    needs: [],
  },
  {
    slug: 'sex-offenses', name: 'Sex Offense Conviction', icon: 'mci:shield-account', main: false, url: `${R}/sex-offenses/`,
    subtopics: [{ name: "Approved Treatment Providers", slug: 'approved-treatment-providers' }, { name: "Family Resource Guide", slug: 'family-resource-guide' }, { name: "Housing Connections", slug: 'housing-connections' }, { name: "Local Advocacy Organizations", slug: 'advocacy-organizations' }, { name: "National Organizations", slug: 'national-organizations' }, { name: "Possible Employers", slug: 'possible-employers' }],
    content: {},
    needs: [],
  },
  {
    slug: 'transportation', name: 'Transportation', icon: 'mci:bus', main: false, url: `${R}/transportation/`,
    subtopics: [{ name: "Bikes", slug: 'bikes' }, { name: "Public Transportation--Denver Region", slug: 'public-transportation-denver-region' }, { name: "Public Transportation--Statewide", slug: 'public-transportation' }],
    content: {},
    needs: ['val_3'],
  },
  {
    slug: 'veterans', name: 'Veterans', icon: 'mci:medal', main: false, url: `${R}/veterans/`,
    subtopics: [{ name: "Health", slug: 'health-veterans' }, { name: "Help", slug: 'help' }, { name: "Housing", slug: 'housing-veterans' }, { name: "Jobs & Training", slug: 'jobs-veterans' }],
    content: { hotlines: ['crisis'] },
    needs: [],
  },
  {
    slug: 'voting', name: 'Voting', icon: 'mci:vote', main: false, url: `${R}/voting/`,
    subtopics: [{ name: "Get Involved", slug: 'get-involved' }, { name: "Registration & Voting Info", slug: 'how-to-vote' }, { name: "Resources to Inform Voters", slug: 'resources-to-help-you-be-informed' }, { name: "Voting Rights & Criminal Record", slug: 'criminal-record-voting-rights-in-colorado' }],
    content: {},
    needs: [],
  },
  {
    slug: 'youth', name: 'Youth', icon: 'mci:human-child', main: false, url: `${R}/youth/`,
    subtopics: [{ name: "Clear Your Record", slug: 'clear-your-record' }, { name: "Education", slug: 'education-youth' }, { name: "Employment", slug: 'employment' }, { name: "Foster Care", slug: 'foster-care' }, { name: "Helplines", slug: 'helplines' }, { name: "Housing", slug: 'housing-youth' }, { name: "Know Your Rights", slug: 'know-your-rights' }, { name: "Organizations that Help", slug: 'organizations-that-help' }],
    content: { hotlines: ['crisis', 'safety'] },
    needs: [],
  },
];

export const topicBySlug = (slug: string) => TOPICS.find((t) => t.slug === slug);
