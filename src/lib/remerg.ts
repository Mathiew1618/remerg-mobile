/**
 * Client for the live remerg.com WordPress REST API.
 *
 * IMPORTANT — why every call here degrades gracefully:
 *
 * As of 2026-09-18, `GET /wp/v2/resources?per_page=1` returns `X-WP-Total: 0`.
 * The `resources` custom post type exists and is registered with the REST API
 * (the route is advertised in /wp-json), but its records are not readable
 * anonymously — the website renders them server-side behind a login. The
 * `map_categories` taxonomy IS public and returns all six terms.
 *
 * So: the network is treated as an *enhancement*. Bundled data in src/data is
 * the source of truth, and anything fetched merely layers on top. When Remerg
 * opens up the CPT (or hands over an export/API key), `fetchResources` starts
 * returning real rows and the UI fills in with no other changes.
 */

import { MAP_CATEGORIES, type MapCategory } from '@/data/taxonomy';

export const REMERG_ORIGIN = 'https://remerg.com';
const API = `${REMERG_ORIGIN}/wp-json/wp/v2`;
const TIMEOUT_MS = 8000;

/** A place a person can physically go. Shape mirrors the `resources` CPT. */
export type Resource = {
  id: number;
  name: string;
  categorySlugs: string[];
  address: string | null;
  phone: string | null;
  website: string | null;
  description: string | null;
  lat: number | null;
  lng: number | null;
};

export type FetchState<T> = {
  data: T;
  /** True when `data` came off the network rather than the bundle. */
  live: boolean;
  error: string | null;
};

async function getJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/** Strip the HTML WordPress returns in rendered fields. */
export function stripHtml(input: string | null | undefined): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/\s+/g, ' ')
    .trim();
}

type WpTerm = { id: number; slug: string; name: string; count: number };

/**
 * Refresh the six map categories. Falls back to the bundled list, which is what
 * ships and what renders on a cold, offline first launch.
 */
export async function fetchMapCategories(): Promise<FetchState<MapCategory[]>> {
  try {
    const terms = await getJson<WpTerm[]>(`${API}/map_categories?per_page=100`);
    const merged = MAP_CATEGORIES.map((local) => {
      const remote = terms.find((t) => t.slug === local.slug);
      return remote ? { ...local, name: remote.name, termId: remote.id } : local;
    });
    return { data: merged, live: true, error: null };
  } catch (err) {
    return { data: MAP_CATEGORIES, live: false, error: describe(err) };
  }
}

type WpResource = {
  id: number;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  content?: { rendered?: string };
  acf?: Record<string, unknown>;
  map_categories?: number[];
};

/**
 * Fetch resources, optionally filtered to one map category.
 *
 * Returns `[]` today because the CPT is not publicly readable — that is
 * expected, not a bug, and callers must render an honest empty state rather
 * than a spinner that never resolves.
 */
export async function fetchResources(categorySlug?: string): Promise<FetchState<Resource[]>> {
  try {
    const term = categorySlug ? MAP_CATEGORIES.find((c) => c.slug === categorySlug) : undefined;
    const qs = new URLSearchParams({ per_page: '100', _embed: '1' });
    if (term) qs.set('map_categories', String(term.termId));

    const rows = await getJson<WpResource[]>(`${API}/resources?${qs}`);
    const slugByTerm = new Map(MAP_CATEGORIES.map((c) => [c.termId, c.slug]));

    const data = rows.map<Resource>((r) => {
      const acf = r.acf ?? {};
      const pick = (...keys: string[]) => {
        for (const k of keys) {
          const v = acf[k];
          if (typeof v === 'string' && v.trim()) return v.trim();
          if (typeof v === 'number') return String(v);
        }
        return null;
      };
      const num = (...keys: string[]) => {
        const v = pick(...keys);
        const n = v ? Number(v) : NaN;
        return Number.isFinite(n) ? n : null;
      };
      return {
        id: r.id,
        name: stripHtml(r.title?.rendered) || 'Untitled',
        categorySlugs: (r.map_categories ?? [])
          .map((t) => slugByTerm.get(t))
          .filter((s): s is string => Boolean(s)),
        address: pick('address', 'street_address', 'location'),
        phone: pick('phone', 'phone_number', 'telephone'),
        website: pick('website', 'url', 'link'),
        description: stripHtml(r.excerpt?.rendered || r.content?.rendered) || null,
        lat: num('lat', 'latitude'),
        lng: num('lng', 'longitude'),
      };
    });
    return { data, live: true, error: null };
  } catch (err) {
    return { data: [], live: false, error: describe(err) };
  }
}

function describe(err: unknown): string {
  if (err instanceof Error) {
    if (err.name === 'AbortError') return 'Timed out reaching remerg.com';
    return err.message;
  }
  return 'Unknown network error';
}
