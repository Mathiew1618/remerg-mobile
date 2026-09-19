# Remerg Mobile

An Expo / React Native app built from [remerg.com](https://remerg.com/about/) — the Colorado
re-entry resource hub run by Remerg, a 501(c)(3) working to "stop the revolving door of
recidivism, one resource at a time."

> **Independent client.** This app is not published, endorsed by, or affiliated with Remerg. It was
> built against their public website. Hotline numbers were verified 18 September 2026.

---

## What the site audit turned up

### Design system

The live theme is WordPress + Bootstrap 5 with the Bootstrap variables overridden:

| Token | Value | Source |
| --- | --- | --- |
| Primary (navy) | `#032256` | `--bs-primary: rgb(3, 34, 86)` |
| Secondary (mint) | `#50D193` | `--bs-secondary: rgb(80, 209, 147)` |
| Crisis red | `#DC3545` | Bootstrap `--bs-danger` ramp |
| Brand typeface | `aaux-next` | Adobe Typekit (`use.typekit.net`) |

Ported to `src/constants/theme.ts` with light and dark ramps. `aaux-next` is a licensed Typekit
face and is **not** bundled; the app uses system fonts, which is also the better accessibility
default. Swapping in a licensed copy is a `expo-font` call away.

### Integrated APIs and services

Found on the live site:

| Service | Detail | Used here |
| --- | --- | --- |
| WordPress REST | `/wp-json/wp/v2/{resources,map_categories}` | Yes — `src/lib/remerg.ts` |
| ACF | `/acf/v3/*` mirrors every post type | Field names honoured in the resource parser |
| AI Engine (Meow Apps) | `/mwai/v1/*`, OpenAI chat + realtime | No — needs a server-side key |
| Google Analytics | `G-FNQX45YW4V` | No — deliberately omitted, see Privacy |
| Constant Contact | `ctct_forms` post type | No |
| GTranslate | `cdn.gtranslate.net` | No — use native OS translation |
| Wordfence | Login security, 2FA REST routes | N/A |
| Transistor.fm | `hotlines-crj.transistor.fm` podcast | No |

### Subdomains — a false lead, documented so nobody re-runs it

`*.remerg.com` is a **wildcard DNS record** pointing at Google Cloud load balancers. Probing turns
up `app.`, `api.`, `map.`, `portal.`, `cdn.` and thirty more — but so does
`zzqx-not-a-real-host-9471.remerg.com`, and every one of them serves a byte-identical copy of the
main WordPress site. There is no separate app tier, API tier or CDN origin. Everything lives on one
host behind SiteGround's CDN.

### The data problem

`GET /wp/v2/resources?per_page=1` returns **`X-WP-Total: 0`**. The custom post type is registered
with the REST API and the route is advertised, but records are not readable anonymously — the site
renders them server-side behind a login. `map_categories` *is* public and returns all six terms.

This shaped the whole architecture: **bundled data is the source of truth, the network is an
enhancement.** `src/lib/remerg.ts` layers live data on top when it can and degrades silently when it
can't. The day Remerg exposes the CPT, `fetchResources()` starts returning rows and the UI fills in
with no other changes.

---

## What changed moving to mobile

The website is organised the way the *organisation* is organised. The app is organised the way a
person in crisis actually thinks.

1. **Crisis lines got promoted from a modal to a tab.** On the website they live inside a dialog you
   have to go find. A `CrisisBar` now sits on every primary screen: left half dials 988 instantly,
   right half opens the full list.
2. **Needs lead, institutions follow.** The home screen is the 16 *needs* from the registration
   survey ("Housing", "Food", "ID / paperwork"), not the six *institutional* map categories ("UA
   Sites", "Re-entry Orgs"). Someone who just got out knows they need a place to sleep; they don't
   know that files under "Re-entry Orgs."
3. **The signup wall came down.** The site gates its map behind registration. Here the survey is
   optional, skippable, and stored on-device only.
4. **Offline-first.** All 18 hotlines and 31 numbers ship in the binary.
5. **Maps by handoff, not embed.** Directions open Apple/Google Maps rather than an embedded
   `MapView`, which would need a Google Maps API key to render on Android. Swap-in point is
   `openDirections()` in `src/lib/dial.ts`.

## Privacy

This audience has specific, well-founded reasons to distrust an app that profiles them.

- **No analytics.** The site's GA tag was deliberately not carried over.
- **No accounts, no network writes.** Nothing the user enters leaves the device.
- **Everything local.** Needs, justice status, age, ZIP and pins live in `AsyncStorage`.
- **One-tap erase** in the Saved tab wipes all of it.

`toSurveyPayload()` in `src/lib/profile.ts` maps the local profile onto the website's survey field
names for the day real accounts are wanted — as an explicit, separate opt-in.

---

## Running it

```bash
npm install
npx expo start        # then scan the QR code with Expo Go
```

```bash
npm run android
npm run ios           # macOS only
npm run web
npx tsc --noEmit      # typecheck
```

## Layout

```
src/
  app/
    _layout.tsx              Root stack + ProfileProvider
    (tabs)/
      index.tsx              Home — needs grid
      directory.tsx          The six map categories
      crisis.tsx             Hotlines, searchable + filterable
      saved.tsx              Pinned lines + privacy controls
    need/[id].tsx            One need -> hotlines + categories
    category/[slug].tsx      One category -> live resources
    personalize.tsx          Optional local survey
    about.tsx                Mission, copied from remerg.com/about
  components/
    crisis-bar.tsx           The always-present safety net
    call-button.tsx          One tap = one call
    hotline-card.tsx
    need-tile.tsx
    ui/screen.tsx
  data/
    hotlines.ts              18 hotlines, 31 numbers — offline
    taxonomy.ts              16 needs, 6 map categories, survey options
  lib/
    remerg.ts                WP REST client, degrades gracefully
    dial.ts                  tel:, directions, links
    profile.ts               Device-local storage
    profile-context.tsx
  constants/theme.ts         Brand tokens
```

## Known gaps

- **Resource listings are empty** until Remerg exposes the `resources` CPT or provides an export.
  Category screens say so honestly and route users to 211 instead of spinning forever.
- **No embedded map** — see above.
- **`aaux-next` not bundled** — licensed Typekit font.
- **Hotlines are a point-in-time snapshot.** A `syncHotlines()` refresh path is the obvious next
  step once there's an endpoint to call.
