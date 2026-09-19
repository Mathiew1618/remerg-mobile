/**
 * Ingest Colorado treatment facilities from SAMHSA's findtreatment.gov locator.
 *
 * Run: node scripts/ingest/samhsa.mjs
 * Out: src/data/resources.generated.json
 *
 * Notes learned the hard way against the live API:
 *  - `sType` is CASE SENSITIVE. `sType=SA` returns zero rows silently;
 *    `sType=sa` returns the full national set. Same for `mh`.
 *  - `sState=CO` is accepted but IGNORED. There is no server-side state filter,
 *    so we page outward from Denver (results are distance-sorted) and cut once
 *    we are clearly past the state line.
 *  - `pageSize` up to 500 works.
 *  - Services arrive as [{f1: category, f2: code, f3: "a; b; c"}].
 *
 * Data is US federal government output and therefore public domain.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, '../../src/data/resources.generated.json');

const DENVER = '39.7392,-104.9903';
const PAGE_SIZE = 500;
// Colorado's furthest corner sits ~300 miles from Denver. 450 leaves headroom
// without dragging in the whole Front Range of four neighbouring states.
const MAX_MILES = 450;
const MAX_PAGES = 12;

const FACET = {
  care: 'Type of Care',
  setting: 'Service Setting',
  payment: 'Payment/Insurance/Funding Accepted',
  programs: 'Special Programs/Groups Offered',
  language: 'Language Services',
  ages: 'Age Groups Accepted',
};

function facet(row, name) {
  const hit = (row.services ?? []).find(
    (s) => s && typeof s === 'object' && String(s.f1 ?? '').trim() === name,
  );
  if (!hit) return [];
  return String(hit.f3 ?? '')
    .split(';')
    .map((v) => v.trim())
    .filter(Boolean);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchPage(sType, page) {
  const qs = new URLSearchParams({
    sAddr: DENVER,
    sType,
    page: String(page),
    pageSize: String(PAGE_SIZE),
  });
  const url = `https://findtreatment.gov/locator/exportsAsJson/v2?${qs}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'remerg-mobile/1.0 (ingest)' } });
  if (!res.ok) throw new Error(`SAMHSA HTTP ${res.status} on ${sType} page ${page}`);
  return res.json();
}

async function collect(sType) {
  const out = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const data = await fetchPage(sType, page);
    const rows = data.rows ?? [];
    if (rows.length === 0) break;

    out.push(...rows.filter((r) => r.state === 'CO'));

    const nearest = Math.min(...rows.map((r) => Number(r.miles) || 0));
    process.stdout.write(
      `  ${sType} page ${page}: ${rows.length} rows, ${out.length} CO so far (nearest ${nearest}mi)\n`,
    );
    // Every row on this page is already past Colorado — stop paging.
    if (nearest > MAX_MILES) break;
    await sleep(300); // be polite to a public service
  }
  return out;
}

function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function normalize(row, sType) {
  const programs = facet(row, FACET.programs);
  const payment = facet(row, FACET.payment);
  const language = facet(row, FACET.language);

  const street = [row.street1, row.street2].map((s) => (s ?? '').trim()).filter(Boolean).join(', ');

  return {
    id: `samhsa-${slug(row.name1)}-${row.zip}`.slice(0, 80),
    source: 'samhsa',
    kind: sType, // 'sa' = substance use, 'mh' = mental health
    name: (row.name1 ?? '').trim(),
    subtitle: (row.name2 ?? '').trim() || null,
    address: street || null,
    city: (row.city ?? '').trim() || null,
    state: row.state ?? 'CO',
    zip: (row.zip ?? '').trim() || null,
    phone: (row.phone ?? '').trim() || null,
    website: (row.website ?? '').trim() || null,
    lat: Number(row.latitude) || null,
    lng: Number(row.longitude) || null,

    // The flags that actually decide whether a place is usable for someone
    // coming out. `justiceInvolved` is the one no other dataset gives us.
    flags: {
      justiceInvolved: programs.some((p) => /criminal justice|forensic/i.test(p)),
      veterans: programs.some((p) => /veteran/i.test(p)),
      youngAdults: programs.some((p) => /young adult/i.test(p)),
      medicaid: payment.some((p) => /medicaid/i.test(p)),
      medicare: payment.some((p) => /medicare/i.test(p)),
      slidingScale: payment.some((p) => /sliding fee|payment assistance/i.test(p)),
      freeOrNoPayment: payment.some((p) => /no payment accepted/i.test(p)),
      spanish: language.some((l) => /spanish/i.test(l)),
    },

    careTypes: facet(row, FACET.care),
    settings: facet(row, FACET.setting).slice(0, 6),
    ageGroups: facet(row, FACET.ages).slice(0, 4),
  };
}

async function main() {
  console.log('Pulling Colorado facilities from findtreatment.gov …');
  const raw = [];
  for (const sType of ['sa', 'mh']) {
    const rows = await collect(sType);
    raw.push(...rows.map((r) => normalize(r, sType)));
  }

  // The same physical facility is listed under both `sa` and `mh` when it does
  // both. Merge on identity rather than shipping it twice.
  const byId = new Map();
  for (const r of raw) {
    const prior = byId.get(r.id);
    if (!prior) {
      byId.set(r.id, { ...r, kinds: [r.kind] });
      continue;
    }
    prior.kinds = [...new Set([...prior.kinds, r.kind])];
    prior.careTypes = [...new Set([...prior.careTypes, ...r.careTypes])];
    for (const k of Object.keys(r.flags)) prior.flags[k] ||= r.flags[k];
  }

  const resources = [...byId.values()]
    .map(({ kind, ...rest }) => rest)
    .filter((r) => r.name)
    .sort((a, b) => a.name.localeCompare(b.name));

  const payload = {
    source: 'SAMHSA findtreatment.gov locator (public domain, US federal data)',
    fetchedAt: new Date().toISOString().slice(0, 10),
    state: 'CO',
    count: resources.length,
    resources,
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(payload, null, 1));

  const j = resources.filter((r) => r.flags.justiceInvolved).length;
  const m = resources.filter((r) => r.flags.medicaid).length;
  const s = resources.filter((r) => r.flags.spanish).length;
  console.log(`\nWrote ${resources.length} Colorado facilities -> ${OUT}`);
  console.log(`  criminal-justice programs: ${j}`);
  console.log(`  accepts Medicaid:          ${m}`);
  console.log(`  Spanish language services: ${s}`);
}

main().catch((err) => {
  console.error('Ingest failed:', err.message);
  process.exit(1);
});
