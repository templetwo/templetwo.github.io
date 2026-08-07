# Repairs applied

Against the `temple-of-two-site-latest` archive and the live
`templetwo/templetwo.github.io`. Every item below is a change to code in this
folder; nothing was changed in the live repo.

---

## Blockers

**B1 · The data layer was missing.** Every route imported `@/data/content`;
the folder was not in the archive, so typecheck and build failed on the first
file. Written: `src/data/content.ts` (site, nav, principles, 8 instruments with
standing/metrics/verify/wonder-arcs, record entries, 5 living questions,
lineage, essays, about, memorial, collaboration needs) and
`src/data/cocreation.ts`.

Publications are **not** hand-written there. `data/publications.json` is the
source of truth and generates `src/data/publications.ts`, which the Record route
and the JSON-LD both read.

**B2 · A server app aimed at a static host.** `vite.config.ts` rewritten:
PGLite bootstrap plugin, OAuth popup middleware, and the Nitro/Vercel preset
removed; `tanstackStart({ target: "static", prerender })` added, with instrument
detail routes enumerated from the content layer.

**B3 · Contact wrote to an ephemeral disk.** `src/lib/contact.ts` deleted.
`contact-form.tsx` now posts to the Cloudflare Worker (`site.contactEndpoint`),
with the honeypot preserved, optional Turnstile, and a real `action` attribute
so the no-JS path still reaches the Worker.

---

## Regressions closed

**R1 · Machine-readable layer restored.** New `src/lib/seo.ts`:

- `pageMeta()` — canonical link, absolute OG/Twitter image, og:url. Every route
  now builds its head through it, so a page cannot ship without a canonical.
- `siteGraph()` — Organization / Person / WebSite / CollectionPage with all 18
  publications as ScholarlyArticle, mounted once in the root route.
- `pageGraph()` — per-page WebPage node on About, Record, Instruments.

Added `public/llms.txt` (ported and updated for the new IA, with a new section
explaining the standing axes to machine readers), `public/robots.txt`, and a
`sitemap.xml` generated at build.

**R2 · Publications pipeline ported.** `scripts/sync-publications.mjs` replaces
`sync_publications.py`. `npm run sync:publications` regenerates
`src/data/publications.ts` and the AUTOGEN block in `llms.txt`;
`npm run verify:publications` runs in check mode and is the first step of
`npm run build` and of CI.

**R3 · Redirects.** `scripts/postbuild.mjs` emits a stub page (canonical +
noindex + refresh + JS replace) for `/research.html`, `/publications.html`,
`/sovereign-stack.html`, `/essays.html`, `/about.html` and the four
`/essays/*.html` paths, plus a `_redirects` file of 301s for Cloudflare.

**R4 · The answered question is back.** `LivingQuestion` now carries
`standing`, and optionally `answer` and `limit`. The compass question is marked
closed with ΔH = +0.47 nats and its scope limit, and renders as an "Answered ·
the record changed" block in both the Threshold Field and the Inquiry page.

---

## Scaffolding removed

`src/lib/auth/` (13 files) · `src/lib/multiplayer/` · `src/lib/db.ts` ·
`src/lib/contact.ts` · `migrations/` · `scripts/migrate.mjs` ·
`created-with-grok-banner.tsx` (and its mount in `__root.tsx`) ·
`package-lock.json` (regenerate after the dependency change).

`package.json` dropped `better-auth`, `pg`, `@types/pg`, `kysely`,
`@electric-sql/pglite`, `nitro`, `zod`, `@tanstack/react-query`,
`@tanstack/react-table`, `react-hook-form`, `@hookform/resolvers`, `recharts`,
`date-fns`, `cmdk`, `vaul`, `sonner`, `zustand`, `class-variance-authority`,
`react-day-picker`, `react-resizable-panels`, and all 20 Radix packages — none
were imported anywhere in the site.

---

## Polish

**P1** · `ogImage = templeOg || grokOg` was unreachable dead code, and the OG
image was relative when the hostname env was unset. All OG/canonical URLs are
now absolute from `site.origin`.

**P2** · Favicon is an inline SVG mark (~400 bytes) instead of a 670 KB JPEG.
All eight photographs re-exported as WebP at display size, and the oversized
JPEG originals deleted:

| | before | after |
| --- | --- | --- |
| `anthony-portrait-2` | 2.3 MB, 3088×2316 | 259 KB, 1125×1500 |
| `logo-temple-of-two` | 654 KB, 1416×1399 | 59 KB, 512×506 |
| `hero-temple-gate` | 355 KB | 127 KB |
| `vdac1-diagram` | 350 KB | 136 KB |
| `temple-duality` | 262 KB | 109 KB |
| `gjs-formula` | 198 KB | 69 KB |
| `father-memorial` | 116 KB | 65 KB |
| **total** | **4.6 MB** | **878 KB** |

WebP is used in-page only. Four purpose-built 1200×630 JPEG social cards
(`og-card`, `og-about`, `og-co-creation`, `og-vdac1`) serve OG and Twitter,
since some scrapers still reject WebP. The hero image also gained explicit
`width`/`height`, `fetchPriority="high"`, and `decoding="async"`.

**P3** · The Threshold Field is a real tabs widget: `role="tablist"` /
`role="tab"` / `role="tabpanel"`, roving `tabIndex`, and Arrow/Home/End keys.
Previously it declared `role="listbox"` with unfocusable options.

**P4** · `scroll-behavior: auto !important` added under
`prefers-reduced-motion` — the existing block neutralised animations and
transitions but left smooth anchor scrolling running.

---

**P6** · All eight instruments now carry a `wonderToReceipt` arc, so every
`/instruments/$slug` page is built on the six-step spine rather than a card with
a one-liner. The Instruments index shows the two arcs where rigor overturned the
original intuition (compass, entropy) and leaves the rest to the detail pages.

---

## Left alone deliberately

- **Three Principles on the homepage.** Recommended cutting it (the covenant is
  stated four times on that page) but it is an editorial call, not a defect.
- **The memorial block.** `memorial` in `content.ts` uses clearly-marked
  placeholder text rather than invented names, dates, or verses. **Replace it
  before launch** — see the `TODO(anthony)` comment.
- **`site.contactEndpoint` and `site.turnstileSiteKey`** in `content.ts` are
  set to sensible defaults; point them at the real Worker URL and sitekey.
  An empty sitekey simply runs the form without a challenge.

---

# Second pass — review repairs

Applied during final review, 2026-08-06. Every item below was verified by
building and inspecting the output, not by reading the source.

## Blockers the first pass left

**S1 · `.gitignore` was the single line `data/`.** Git matches that at any
depth, so it ignored `data/publications.json` **and** all of `src/data/` —
verified with `git check-ignore`. This is the cause of this document's own
**B1**: the data layer did not go missing from the previous archive by
accident, it was never committable. Replaced with a real ignore list
(`node_modules/`, `dist/`, `.output/`, editor and env files).

**S2 · `/instruments/$slug` rendered the Instruments index.**
`instruments.$slug.tsx` was registered as a child of `instruments.tsx`
(`getParentRoute: () => InstrumentsRoute`), which renders no `<Outlet/>`, so
the child never rendered. All eight detail pages shipped with the index `h1`,
the index body, and **two** conflicting canonicals. Fixed by renaming
`instruments.tsx` → `instruments.index.tsx`, making the routes siblings.
**Keep the `.index` name** — reverting it silently reintroduces the bug.

**S3 · `src/data/publications.ts` was hand-written, never generated.** It
carried an escaped backtick in a doc comment, so `verify:publications` failed
and the build died on step one. Regenerated.

**S4 · `deploy.yml` uploaded `.output/public`; the build emits `dist/client`.**
Fixed in the workflow and in README. (`postbuild.mjs` already probed for both.)

**S5 · No lockfile, but CI runs `npm ci`.** Regenerated and committed.

## Content

- **The memorial now carries the real text**, transcribed verbatim from the
  published `templetwo.github.io/index.html` — name, dates, 2 Corinthians 5:8
  in English and Spanish, and the dedication. Added `verseEnCite`/`verseEsCite`
  (the structure had no field for the citations) and `imageAlt` (alt text was
  the placeholder string "For my father"). Both render sites use `<blockquote>`
  + `<cite>`. **Anthony must read this block once before launch.**
- **Essay links were circular.** The four `href`s pointed at
  `/essays/*.html`, which `postbuild.mjs` turns into stubs redirecting to
  `/writings#anchor` — the page the link is on. Removed; the DOI is the real
  destination. Added a line noting one deposit covers all four, so the repeated
  DOI reads as intentional. Mislabelled "Repository ↗" → "Read ↗".
- **The Instruments index showed the wrong two arcs.** `filter(i =>
  i.wonderToReceipt)` is a no-op now that P6 gave all eight an arc, so
  `slice(0, 2)` returned Sovereign Stack and Compass — and entropy, the actual
  bounded null, never appeared under a heading about intuitions that did not
  survive measurement. Now selected by slug.
- **Standing restored to the machine-readable layer.** `llms.txt` stated the
  compass and VDAC1 numbers with no scope, 20 lines after promising every claim
  carries its standing; the AUTOGEN block dropped the evidence axis from all 18
  publications. Both fixed (`sync-publications.mjs` now emits the axis).
- **A venue fact no longer stands in for an evidence claim.** Four
  publications carry no `evidence`; the default was "Published, open access".
  Now "Open access · no evidence axis recorded", with a TODO.
- Dropped "and reproducible" from the entropy finding — a positive empirical
  claim with no supporting metric, in a bounded-null entry.
- Homepage compass `signal` now carries "one architecture family, one
  benchmark".
- Name, licence, and repo count made consistent (`llms.txt` said "Anthony
  Vasquez Sr." twice and "~80"/"75+" disagreed across files).

## Code

- **Turnstile would have broken the form the moment a sitekey was set.** The
  effect returned early when `window.turnstile` was truthy — true forever after
  first load — so on any second mount the widget never rendered and submit was
  blocked. Now renders directly when the API is present, dedupes the script
  tag, and removes the widget on unmount. Added a `<noscript>` route for the
  no-JS path, which cannot satisfy a challenge.
- **JSON-LD**: articles gained `@id`/`url`/`name`, `publisher` is an
  `Organization` rather than a bare string, `identifier` is a `PropertyValue`.
  The 18-article collection moved off the root route to `/record` — it was
  shipping ~9.7 KB in the head of every page. Homepage head is now 1.3 KB.
- **Accessibility**: `WonderReceiptPanel` takes `headingLevel` so detail pages
  no longer skip `h1` → `h3`; `role="toolbar"` on the Record facets became
  `role="group"` (six plain buttons, no arrow-key contract); `:target` gets
  `scroll-margin-top` so anchors stop landing under the sticky header.
- **`404.html`** is now emitted — `notFound()` cannot run on a static host.
- **Removed sandbox scaffolding**: `browser-smoke.mjs`, `browser-guard.mjs`,
  `preview-thumbnail.mjs`, `startup.sh` — all hardcoded to `/workspace`, one
  referencing `/root/.grok/auth.json`. Dropped the `playwright` and
  `eslint-plugin-prettier` devDependencies, the unused
  `anthony-github-avatar.webp`, `--color-faint`, and the dead `EvidenceBadge` /
  deprecated `StandingBadge`.

## Verified

`npm install` clean · `npm run lint` clean · `npm run typecheck` zero errors ·
`npm run build` exit 0 · 15 routes prerendered · 8/8 instrument pages serving
their own content under exactly one correct canonical · JSON-LD parses ·
memorial renders with the real name, dates, and both verses.

## Still needs Anthony

- Read the memorial block once and confirm every character.
- Set `evidence` for the four publications that have none.
- Point `site.contactEndpoint` / `turnstileSiteKey` at the real Worker, and
  test it against **both** the JSON and form-encoded paths — `contact-worker/`
  is referenced but is not in this repo.
- `llms.txt` lists "grief science (real-time field witness)" as a research
  area with no instrument, publication, or question behind it on the site.
  Left alone deliberately: that is an editorial call, not a defect.

---

# Third pass — data accuracy

Every factual claim checked against a live source, 2026-08-06. Sources named so
each can be re-run.

**Verified correct:** all 18 DOIs resolve; all 18 dates match the registry
exactly (Zenodo API, OSF API, Research Square); `headline` matches the full
deposited title on every record checked; `4KNQR` and `T65VS` really are OSF
registrations while the other five OSF items are projects, matching their
evidence axes; ORCID `0009-0000-6440-1506` carries the credit-name "Anthony J
Vasquez Sr."; 28/28 external links in the built output resolve.

**Corrected:**

- Sovereign Stack `v1.12.0` / `96 MCP tools` → **`v1.15.0` / `97`**, read from
  `stack.templetwo.com/api/heartbeat`. The metric's `scope` now names the
  heartbeat, so the number can be re-checked instead of trusted.
- T2Helix `v0.11.0` / `13 MCP tools` → **`v0.13.0` / `15`**, from `package.json`
  on `main` and the `TOOLS` array in `mcp/server.js`.
- `github.com/templetwo/sovereign-stack` **404s** — no public repo by that name
  exists; only `sovereign-stack-chronicle` is public. It was linked from five
  places including a "Verify → Repository" entry. Repointed to the chronicle
  and the live heartbeat, with a TODO to restore a Repository link if the code
  is published.
- Public repo count: GitHub reports **exactly 80**. The second pass had
  standardised `~80` and `75+` onto `75+`, which was the less accurate of the
  two. Both now read `~80`.

**Confirmed broken, left for Anthony:** `contact.thetempleoftwo.com` is
**NXDOMAIN** — it does not resolve at all, so the contact form posts nowhere.
This needs the real Worker hostname before launch.

**Flagged, not changed:** `10.5281/zenodo.21797326` — "ECS v1 Preregistration",
published **2026-08-05** — is live and resolving but absent from
`publications.json`, whose newest entry is 2026-07-29. Adding it is an
editorial decision about the sealed ECS work, not a repair.

---

# Fourth pass — the contact form

## Diagnosis

`site.contactEndpoint` was `https://contact.thetempleoftwo.com/submit`. That
host **does not exist** (NXDOMAIN) and never did. The real contract, already in
your repo at `contact-worker/`, is:

```
POST /api/contact      same-origin, no CORS, no exposed workers.dev URL
```

which is what the current live `index.html` already posts to. Changed to
`/api/contact`.

**But that path cannot answer yet, and the reason is DNS, not the Worker.**

```
thetempleoftwo.com  NS  → ns1/ns2/ns3.openprovider.{nl,be,eu}
thetempleoftwo.com  A   → 185.199.108–111.153   (GitHub Pages)
response headers    → server: GitHub.com, no cf-ray
```

The zone is at Openprovider and the apex resolves straight to GitHub Pages.
Cloudflare never sees the request, so the route binding in `wrangler.toml`
(`pattern = "thetempleoftwo.com/api/contact", zone_name = "thetempleoftwo.com"`)
has nothing to attach to. Probing the live path confirms it: `GET` → 404,
`POST` → 405, both served by GitHub, not by a Worker.

## Two ways to fix it

### Path A — move the zone to Cloudflare (what the Worker was designed for)

1. Add `thetempleoftwo.com` as a site in Cloudflare; it imports the DNS.
2. At Openprovider, change the nameservers to the two Cloudflare gives you.
3. Keep the four GitHub Pages A records **proxied** (orange cloud), plus the
   `www` CNAME. GitHub Pages behind Cloudflare is a standard setup.
4. `cd contact-worker && npx wrangler deploy`
5. Configure delivery and the anti-abuse gate (below).

Keeps `/api/contact` same-origin. No CORS. No workers.dev URL exposed. This is
what the config and its comments were written for.

### Path B — deploy to workers.dev (no DNS change, works today)

1. In `wrangler.toml`, comment out the `routes = [...]` block and add
   `workers_dev = true`.
2. `npx wrangler deploy` → `https://templeoftwo-contact.<subdomain>.workers.dev`
3. Put that absolute URL in `site.contactEndpoint`.

The Worker already returns the CORS headers this needs, and `ALLOWED_ORIGINS`
already contains `https://thetempleoftwo.com` and the `www` variant, so this
works unmodified. The trade-off is the public workers.dev hostname, which the
`wrangler.toml` comments were explicitly trying to avoid.

**Recommendation:** Path A. Path B is the escape hatch if you want the form live
before touching nameservers — switching later is a one-line change to
`contactEndpoint`.

## Required either way — the Worker fails closed

`src/worker.js` returns **503 `not_configured`** unless at least one anti-abuse
control exists. Pick one:

- **KV rate limiter** (simplest, no site change):
  `npx wrangler kv namespace create RL`, paste the id into the
  `[[kv_namespaces]]` block, redeploy. 5 submissions per IP per 10 minutes.
- **Turnstile** (stronger): put the real site key in `site.turnstileSiteKey`
  and deploy the site **first**, then
  `npx wrangler secret put TURNSTILE_SECRET`. Order matters — the secret makes
  the challenge mandatory, and if the page has no site key, no widget renders,
  no token is sent, and every submission is rejected 403.

And for delivery: verify `thetempleoftwo.com` in Resend, then
`npx wrangler secret put RESEND_API_KEY`. Mail goes to
`info@thetempleoftwo.com` with the visitor's address as `reply_to`.

## Also fixed

`messageFor()` in `contact-form.tsx` only mapped three of the Worker's nine
error codes. Added `too_large`, `not_configured`, and `send_failed` — the last
two matter because they are exactly what a half-configured Worker returns
during the setup above, and the old fallback said "Could not send" with no hint
that the service, not the visitor, was the problem.

**Good news from reading the Worker:** it already accepts *both*
`application/json` and form-encoded bodies (`src/worker.js` lines 128 and 139),
so the earlier concern about the no-JS native POST sending a different content
type than the fetch path is resolved — the Worker handles both.

## Note — do NOT swap the KV limiter for Cloudflare's native Rate Limiting binding

A plausible suggestion, checked against the code and rejected. It would break
the form in a way that looks configured.

`src/worker.js` uses `RL` as a **KV namespace**:

```js
if (!env.TURNSTILE_SECRET && !env.RL) { ...503 not_configured... }   // line 70
...
const count = parseInt((await env.RL.get(key)) || '0', 10) + 1;      // line 87
await env.RL.put(key, String(count), { expirationTtl: RL_WINDOW_SECONDS });
```

Cloudflare's Rate Limiting binding exposes **only `limit({ key })`** — it has
no `get`/`put` (confirmed in the Workers runtime API docs). So binding a rate
limiter as `RL`:

1. **satisfies the fail-closed guard on line 70**, because `env.RL` is truthy —
   the Worker looks correctly configured and stops returning 503; then
2. **throws a TypeError on line 87** on the first real submission, because
   `.get` does not exist.

The failure surfaces as an exception, not as `rate_limited`, so the symptom
points at the form rather than at the binding.

The window is also unrepresentable: the native binding requires `period` to be
**10 or 60 seconds**, and this Worker's policy is `RL_MAX = 5` per
`RL_WINDOW_SECONDS = 600` (10 minutes). Even rewritten to use `limit()`, the
native binding cannot express a 10-minute window.

**Use the KV namespace as documented.** `npx wrangler kv namespace create RL`,
paste the id under `[[kv_namespaces]]`, redeploy. Moving to the native limiter
is a deliberate rewrite of the rate-limit block plus a policy change, not a
binding swap.

## RESOLVED — Path A is impossible. Path B it is.

The Webador DNS editor was read directly on 2026-08-07. **Webador does not
permit changing nameservers**, so the zone cannot move to Cloudflare without a
full registrar transfer away from Webador. Path A as scoped is off the table.

The full record set was also captured, and every record was independently
re-verified against public DNS from here — all 16 confirmed:

```
A     apex             185.199.108–111.153        GitHub Pages
CNAME www              templetwo.github.io
MX    apex             mail.webador.com  (prio 0)
TXT   apex             v=spf1 include:_spf.webador.com ~all
TXT   apex             mistral-domain-verification=c552bc4e…
TXT   _dmarc           v=DMARC1; p=none
TXT   mandrill._domainkey    v=DKIM1; k=rsa; p=MIGfMA0…
CNAME sparkpost._domainkey   sparkpost._domainkey.webador.com
CNAME jouwweb._domainkey     website-rendering._domainkey.jouwweb.nl
CNAME mail / autoconfig / autodiscover → *.mail.webador.com
SRV   _autodiscover._tcp     0 0 443 autoconfig.mail.webador.com
```

**Three** DKIM selectors, an SRV record, and autodiscover/autoconfig — all
load-bearing for Webador mail. Even if nameserver delegation were available,
hand-migrating this set is precisely how a domain silently loses email, and the
mailbox at risk (`info@thetempleoftwo.com`) is the one the contact form
delivers to. Path B is not merely the remaining option; it is the better one.

### The decision

`site.contactEndpoint` is now an **absolute workers.dev URL**, currently the
placeholder `https://templeoftwo-contact.<subdomain>.workers.dev`.

To finish:

1. In `contact-worker/wrangler.toml`, comment out the `routes = [...]` block
   and add `workers_dev = true`.
2. `cd contact-worker && npx wrangler deploy`
3. Paste the printed hostname into `contactEndpoint` in `src/data/content.ts`.
4. `npx wrangler kv namespace create RL`, paste the id under
   `[[kv_namespaces]]`, redeploy — otherwise the Worker stays fail-closed (503).
5. Resend: verify the **subdomain** `send.thetempleoftwo.com`, not the apex,
   and set `CONTACT_FROM` to `contact@send.thetempleoftwo.com`. The apex SPF,
   MX, and all three DKIM records stay untouched, so Webador mail is never at
   risk. Then `npx wrangler secret put RESEND_API_KEY`.

No DNS change is required for the form itself. Only step 5 touches DNS, and
only under a new subdomain.

### New guard — `npm run verify:contact`

The dead endpoint shipped once and nothing caught it: the form rendered, the
button worked, and every message went nowhere. `scripts/verify-contact.mjs`
now runs before `vite build` and in CI, and fails the build when
`contactEndpoint` is a placeholder, is not https, or points at a hostname that
does not resolve. Verified in both directions — it rejects the original
`contact.thetempleoftwo.com` value and passes a hostname that resolves.

Set `SKIP_CONTACT_DNS=1` to skip only the DNS lookup when building offline.
The placeholder check still runs.

**The build currently fails on purpose.** That is the guard doing its job: the
site cannot ship until the Worker is deployed and its URL is pasted in, or the
contact form is deliberately removed in favour of `site.email`.

## REVISED — use the Cloudflare zone you already have

Anthony asked "doesn't the stack already use Cloudflare?" It does, and it
changes the answer.

`stack.templetwo.com` serves through Cloudflare (`server: cloudflare`, live
`cf-ray`), and **`templetwo.com` is a Cloudflare zone** — nameservers
`michelle.ns.cloudflare.com` / `bart.ns.cloudflare.com`. That is a *different*
domain from `thetempleoftwo.com`, which is why the earlier DNS work didn't
surface it.

So the Worker does not need a `workers.dev` hostname. It gets a custom domain
on a zone that is already controlled:

```
https://contact.templetwo.com
```

Checked and free, as are `form`, `api`, `www`, and the apex; only
`stack.templetwo.com` is in use on that zone.

**What this improves over plain Path B:**

- No exposed `*.workers.dev` hostname — the thing `wrangler.toml`'s comments
  were trying to avoid in the first place.
- Resend verification moves to `send.templetwo.com`, a zone with **no mail
  records at all**, so there is nothing to collide with and no SPF to merge.
  The earlier plan had us editing the Webador zone that carries the live
  mailbox; that risk is now gone entirely.
- `thetempleoftwo.com` DNS is never touched. Its SPF, MX, and all three DKIM
  selectors stay exactly as they are.

`site.contactEndpoint` is now `https://contact.templetwo.com`, and
`verify:contact` fails until that hostname resolves — so the build going green
*is* the proof the deploy landed.

Route config:

```toml
routes = [
  { pattern = "contact.templetwo.com", custom_domain = true }
]
```

`ALLOWED_ORIGINS` in the Worker already contains `https://thetempleoftwo.com`
and the `www` variant, so cross-origin from the site works unmodified.

**Lesson worth keeping:** two passes of DNS forensics went into
`thetempleoftwo.com` before anyone checked whether an adjacent domain already
solved it. The infrastructure inventory was never taken — only the failing
path was investigated.

## FINAL — contact form is live, and Resend is gone

Anthony: "we already have the email with webador." Correct, and it reframed the
problem.

**Why the Webador mailbox could not simply be used:** Cloudflare Workers cannot
open SMTP connections. There is no way for a Worker to authenticate to
Webador's mail server and send. The mailbox is fine for *receiving* — that
never changed and never needed to.

**What shipped instead:** Cloudflare Email Routing's `send_email` binding. No
third-party account, no API key to rotate, free.

```
site (thetempleoftwo.com)
  └─POST──▶ contact.templetwo.com          Worker, custom domain, cert issued
              env.EMAIL  → Send Email, restricted to info@thetempleoftwo.com
              env.RL     → KV, 5 per IP per 10 min
              from: contact@templetwo.com  (sender must be a zone on the account)
                └──▶ info@thetempleoftwo.com   the existing Webador inbox
```

Receiving is untouched. `thetempleoftwo.com` DNS was never modified — no SPF
edit, no MX change, all three Webador DKIM selectors intact.

The send path was added *alongside* Resend rather than replacing it:
`deliver()` prefers `env.EMAIL` when bound and falls back to the Resend call if
a key is ever set. The fail-closed gate now accepts either transport.

Written by hand rather than pulled from a dependency: RFC 2047 subject
encoding, chunked UTF-8 base64 bodies, and CR/LF stripping on every header
value so a crafted name or topic cannot inject headers.

### Verified live, not inferred

- Destination address verified 2026-08-07T18:34:56Z
- JSON submission → `{"ok":true}` 200
- Form-encoded no-JS submission → styled HTML confirmation page, 200
- UTF-8 payload (em dashes, Spanish accents, curly quotes) → 200
- CORS preflight → 204, `access-control-allow-origin: https://thetempleoftwo.com`
- Foreign origin → `403 forbidden_origin`
- Honeypot → `{"ok":true}` with nothing sent

Not yet exercised in production: the KV rate limiter. The binding is confirmed
active (it is what cleared the 503 fail-closed gate), but tripping it requires
five real sends, so it was left alone rather than filling the inbox to prove
arithmetic.

### The newer "Email Sending" service is not enabled on this account

`GET /accounts/{id}/email/sending/zones` returns `Unauthorized [2036]` despite
the token carrying `email_sending:write`. That is the 2025 product, still open
beta and evidently not entitled here. The Email Routing binding used instead is
generally available and is the right shape for a form with exactly one
recipient.
