/**
 * Ingest Colorado community corrections programs (halfway houses) from the
 * Division of Criminal Justice's Office of Community Corrections page.
 *
 * Run: node scripts/ingest/commcorr.mjs
 * Out: src/data/commcorr.generated.json
 *
 * Why scrape rather than call an API: DCJ publishes no API and no export. This
 * is the only authoritative statewide list of the 25 programs, and it is the
 * single most load-bearing dataset in the app — a halfway house bed is the
 * difference between release and re-arrest for a parole violation.
 *
 * The page is hand-maintained WYSIWYG HTML, so the parser is deliberately
 * line-based rather than selector-based: every field arrives as
 * `Label: value` inside a <span>, separated by <br> or </p>, and phone/email
 * sit one line below their label because they are wrapped in <a> tags.
 * A DCJ redesign WILL break this. `npm run ingest:commcorr` fails loudly with a
 * non-zero exit rather than silently writing an empty file, and the bundled
 * JSON stays valid until someone re-runs it.
 *
 * Two sections are merged:
 *  1. "Specialized Programs" (IRT) — carries the acceptance criteria that
 *     actually decide whether a person is eligible.
 *  2. The per-judicial-district roster — carries addresses and directors.
 * They overlap by program name, which is not spelled identically in both, so
 * the match is on a normalised key.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, '../../src/data/commcorr.generated.json');

const SRC = 'https://dcj.colorado.gov/dcj-offices/occ/corrections-boards-programs';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 remerg-mobile-ingest';
const GEOCODER =
  'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress' +
  '?benchmark=Public_AR_Current&format=json&address=';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Distinctive tokens of a programme name, for matching the two sections.
 *
 * The same facility is named differently in each: the roster says "ICCS -
 * Adams" and "Larimer County Residential Facility" where the specialised
 * section says "Intervention Community Corrections Services - Adams" and
 * "Larimer County Community Corrections". Nothing short of a token match
 * anchored on city joins those, so generic words are dropped and the
 * acronym-in-parentheses is stripped.
 */
const STOP = new Set([
  'inc', 'llc', 'the', 'of', 'and', 'community', 'corrections', 'correction',
  'center', 'centre', 'treatment', 'services', 'service', 'program', 'programs',
  'residential', 'facility', 'transitional', 'transition', 'county',
]);

const tokens = (s) =>
  new Set(
    s
      .toLowerCase()
      .replace(/\([^)]*\)/g, ' ')
      .replace(/[^a-z0-9]+/g, ' ')
      .split(' ')
      .filter((w) => w.length > 2 && !STOP.has(w)),
  );

const norm = (s) => (s ?? '').toLowerCase().replace(/[^a-z]/g, '');

const decode = (s) =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)));

/** HTML fragment -> array of trimmed text lines, <br> and block ends as breaks. */
function lines(html) {
  return decode(
    html
      .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|dd|dt|tr)>/gi, '\n')
      .replace(/<[^>]+>/g, ''),
  )
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

/**
 * Read `Label: value`, tolerating the value having been pushed onto the next
 * line by an <a> wrapper (which is how every phone and email on this page is
 * marked up).
 */
function field(ls, i, label) {
  const re = new RegExp(`^${label}\\s*:\\s*(.*)$`, 'i');
  const m = re.exec(ls[i]);
  if (!m) return null;
  const inline = m[1].trim();
  if (inline) return inline;
  const next = (ls[i + 1] ?? '').trim();
  // Only borrow the next line when it is a value, not another label.
  return next && !/^[A-Z][A-Za-z /]{2,24}:\s*$/.test(next) ? next : null;
}

function scanFields(ls, labels) {
  const out = {};
  for (let i = 0; i < ls.length; i++) {
    for (const [prop, label] of Object.entries(labels)) {
      if (out[prop]) continue;
      const v = field(ls, i, label);
      if (v) out[prop] = v;
    }
  }
  return out;
}

/**
 * The page is one <dl>: each <dt> is a heading, each <dd> its body. Headings
 * that name an ordinal judicial district hold the roster (addresses); the rest
 * hold the specialised-programme section (acceptance criteria).
 *
 * Both sections are segmented on the one label that appears exactly once per
 * programme — `Location:` in the criteria section, `Population Served` in the
 * roster — and the programme name is the plain line just above it. Anchoring on
 * `Program:` instead undercounts badly: districts running two programmes print
 * the label once.
 */
const IS_DISTRICT = /\d+(?:st|nd|rd|th)\s+Judicial District/i;

function sections(html) {
  const roster = [];
  const special = [];
  for (const [, dt, dd] of html.matchAll(/<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/gi)) {
    const heading = lines(dt)[0] ?? '';
    (IS_DISTRICT.test(heading) ? roster : special).push({ heading, ls: lines(dd) });
  }
  return { roster, special };
}

/**
 * Segment a block on `anchor`, returning [{name, ls}] one per programme.
 *
 * Entries are packed tight — name, then five labelled lines, then the next
 * name with no separator — so the programme name is simply the line directly
 * above the anchor, and a programme's fields run from its anchor up to the
 * line before the next name. Do not widen this window: a programme's Address
 * sits two lines past its anchor, close enough to be stolen by a neighbour.
 *
 * The name is taken verbatim rather than screened for a `Label:` shape,
 * because real programmes are named things like "Project: Elevate".
 */
const IS_FIELD = /^(?:Population Served|Address|Director|Phone|Email|Location|Gender|Length)\s*:/i;

function segment(ls, anchor) {
  const starts = ls.flatMap((l, i) => (anchor.test(l) ? [i] : []));
  return starts.map((start, n) => {
    const to = starts[n + 1] != null ? starts[n + 1] - 1 : ls.length;
    const raw = (ls[start - 1] ?? '').replace(/^Programs?\s*:\s*/i, '').trim();
    const name = raw && !IS_FIELD.test(raw) ? raw : null;
    return { name, ls: ls.slice(start, to) };
  });
}

/**
 * Section 1: the specialised tracks. A programme can appear under more than
 * one (a place doing both dual-diagnosis and sex-offender treatment is listed
 * twice), so these accumulate into a list rather than overwriting — which of
 * the three tracks a bed offers is exactly what decides placement.
 */
function parseCriteria(special) {
  const out = [];
  for (const { heading, ls } of special) {
    const track = /\(([A-Z]{3,6})\)/.exec(heading)?.[1] ?? heading;
    for (const { name, ls: block } of segment(ls, /^Location\s*:/i)) {
      if (!name) continue;
      const c = scanFields(block, {
        location: 'Location',
        gender: 'Gender',
        length: 'Length',
        substanceAbuse: 'Substance Abuse',
        mentalHealth: 'Mental Health',
        medical: 'Medical',
        sexOffenders: 'Sex Offenders',
        violentOffenders: 'Violent Offenders',
        notes: 'Additional Information',
      });
      out.push({ track, name, tokens: tokens(name), ...c });
    }
  }
  return out;
}

/**
 * Attach specialised-track records to roster programmes.
 *
 * City is the anchor and the token overlap breaks ties. A specialised entry
 * that matches two programmes in one city equally well is dropped rather than
 * guessed at — a wrong "accepts sex offences" flag on a halfway house is worse
 * than a missing one.
 */
function joinCriteria(roster, criteria) {
  const unmatched = [];
  for (const c of criteria) {
    const scored = roster
      .map((p) => {
        const sameCity = norm(p.city) && norm(p.city) === norm(c.location);
        if (!sameCity) return null;
        const shared = [...c.tokens].filter((t) => p.tokens.has(t)).length;
        return shared > 0 ? { p, shared } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.shared - a.shared);

    if (!scored.length || (scored[1] && scored[1].shared === scored[0].shared)) {
      unmatched.push(`${c.name} (${c.location})`);
      continue;
    }
    scored[0].p.tracks.push(c);
  }
  return unmatched;
}

/** Section 2: the per-judicial-district roster, which carries addresses. */
function parseRoster(roster) {
  const programs = [];
  for (const { heading, ls } of roster) {
    for (const { name, ls: block } of segment(ls, /^Population Served\s*:/i)) {
      if (!name) continue;
      const f = scanFields(block, {
        population: 'Population Served',
        address: 'Address',
        director: 'Director',
        phone: 'Phone',
        email: 'Email',
      });
      programs.push({ district: heading, name, ...f });
    }
  }
  return programs;
}

/** Split "1101 H Street, Greeley, CO 80631" into parts. Tolerates no commas. */
function splitAddress(raw) {
  if (!raw) return { address: null, city: null, zip: null };
  const zip = /(\d{5})(?:-\d{4})?\s*$/.exec(raw)?.[1] ?? null;
  const body = raw.replace(/,?\s*CO\s*\d{5}(?:-\d{4})?\s*$/i, '').trim();
  const parts = body.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { address: parts.slice(0, -1).join(', '), city: parts.at(-1), zip };
  }
  // No comma before the city: "3260 Airport Rd Boulder". Cut after the last
  // street-type word, otherwise the suffix itself gets read as part of the city.
  const m = /^(.*\b(?:Rd|Road|St|Street|Ave|Avenue|Blvd|Dr|Drive|Ln|Lane|Way|Ct|Court|Pkwy|Parkway|Cir|Circle|Pl|Place|Hwy|Highway)\b\.?)\s+(.+)$/i.exec(body);
  return m ? { address: m[1], city: m[2], zip } : { address: body || null, city: null, zip };
}

async function geocode(oneLine) {
  try {
    const res = await fetch(GEOCODER + encodeURIComponent(oneLine), {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const j = await res.json();
    const hit = j?.result?.addressMatches?.[0]?.coordinates;
    return hit ? { lat: hit.y, lng: hit.x } : null;
  } catch {
    return null;
  }
}

async function main() {
  console.log(`Fetching ${SRC} …`);
  const res = await fetch(SRC, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`DCJ returned HTTP ${res.status}`);
  const html = await res.text();

  const { roster: rosterBlocks, special } = sections(html);
  const criteria = parseCriteria(special);
  const roster = parseRoster(rosterBlocks).map((p) => {
    const { address, city, zip } = splitAddress(p.address);
    return { ...p, address, city, zip, tokens: tokens(p.name), tracks: [] };
  });

  console.log(`  parsed ${roster.length} programs, ${criteria.length} specialised-track listings`);

  // The page lists 25 programmes across 23 judicial districts. A big shortfall
  // means the markup moved, and a truncated halfway-house list is worse than a
  // stale one — fail instead of writing it.
  if (roster.length < 20) {
    throw new Error(
      `only ${roster.length} programs parsed — DCJ almost certainly changed the page layout. ` +
        `Refusing to overwrite ${OUT} with a truncated list.`,
    );
  }

  const unmatched = joinCriteria(roster, criteria);
  if (unmatched.length) {
    console.log(`  could not place ${unmatched.length} track listing(s):`);
    for (const u of unmatched) console.log(`    - ${u}`);
  }

  const yes = (v) => Boolean(v) && /^(yes|will be considered|on case by case|case by case)/i.test(v);
  const pick = (tracks, prop) => tracks.map((t) => t[prop]).find(Boolean) ?? null;

  const resources = [];
  for (const p of roster) {
    const oneLine = [p.address, p.city, 'CO', p.zip].filter(Boolean).join(', ');
    const geo = p.address && p.city ? await geocode(oneLine) : null;
    if (p.address && p.city) await sleep(250); // be polite to the Census geocoder

    const trackNames = p.tracks.map((t) => t.track);
    const pop = `${p.population ?? ''} ${pick(p.tracks, 'gender') ?? ''}`.toLowerCase();

    resources.push({
      id: `dcj-${[...p.tokens].sort().join('-') || norm(p.name)}-${p.zip ?? norm(p.city) ?? 'co'}`,
      source: 'dcj',
      kinds: ['housing'],
      name: p.name,
      subtitle: p.district,
      address: p.address,
      city: p.city,
      state: 'CO',
      zip: p.zip,
      phone: p.phone ?? null,
      email: p.email ?? null,
      website: null,
      director: p.director ?? null,
      lat: geo?.lat ?? null,
      lng: geo?.lng ?? null,
      flags: {
        justiceInvolved: true, // every programme here exists for this population
        men: /\bmale\b|\bmen\b/.test(pop),
        women: /female|women/.test(pop),
        // SOSTCC is the sex-offender track; being on it is the placement answer
        // regardless of how the per-track "Sex Offenders" cell is worded.
        acceptsSexOffense: trackNames.includes('SOSTCC') || p.tracks.some((t) => yes(t.sexOffenders)),
        acceptsViolentOffense: p.tracks.some((t) => yes(t.violentOffenders)),
        dualDiagnosis: trackNames.includes('RDDT'),
        residentialTreatment: trackNames.includes('IRT'),
      },
      tracks: p.tracks.map((t) => ({
        track: t.track,
        length: t.length ?? null,
        substanceAbuse: t.substanceAbuse ?? null,
        mentalHealth: t.mentalHealth ?? null,
        medical: t.medical ?? null,
        sexOffenders: t.sexOffenders ?? null,
        violentOffenders: t.violentOffenders ?? null,
        notes: t.notes ?? null,
      })),
      populationServed: p.population ?? null,
    });
  }

  resources.sort((a, b) => a.name.localeCompare(b.name));

  const payload = {
    source: 'Colorado Division of Criminal Justice, Office of Community Corrections',
    sourceUrl: SRC,
    fetchedAt: new Date().toISOString().slice(0, 10),
    state: 'CO',
    count: resources.length,
    resources,
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(payload, null, 1));

  const n = (f) => resources.filter(f).length;
  console.log(`\nWrote ${resources.length} community corrections programs -> ${OUT}`);
  console.log(`  geocoded:            ${n((r) => r.lat != null)}/${resources.length}`);
  console.log(`  on a treatment track: ${n((r) => r.tracks.length)}`);
  console.log(`  dual diagnosis:      ${n((r) => r.flags.dualDiagnosis)}`);
  console.log(`  sex-offence track:   ${n((r) => r.flags.acceptsSexOffense)}`);
  console.log(`  women:               ${n((r) => r.flags.women)}`);
}

main().catch((err) => {
  console.error('Ingest failed:', err.message);
  process.exit(1);
});
