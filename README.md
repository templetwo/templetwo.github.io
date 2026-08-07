# Temple of Two — site

Where wonder meets rigor.

Independent inquiry, the instruments built to test it, and an ongoing case study
in human–AI governed co-creation.

## Stack

- React 19 + TypeScript + Vite
- TanStack Start / Router — **prerendered to static HTML at build time**
- Tailwind CSS v4

There is no server. Every route is a static file, which is what
`templetwo.github.io` (GitHub Pages) can actually serve. The contact form posts
to the Cloudflare Worker in the main repo's `contact-worker/`.

## Run locally

```bash
npm install
npm run dev          # 0.0.0.0:8080
npm run typecheck
npm run build        # verify → prerender → postbuild
npm run preview      # serve the built output
```

`npm run build` runs three things in order:

1. `verify:publications` — fails if the generated files have drifted from
   `data/publications.json`
2. `vite build` — prerenders every route to HTML
3. `scripts/postbuild.mjs` — sitemap, redirect stubs, `_redirects`, `.nojekyll`, `CNAME`

## Structure

```
data/publications.json      ← single source of truth for published work
src/data/content.ts         ← everything else: site, nav, instruments, record,
                              living questions, essays, lineage, about, memorial
src/data/publications.ts    ← GENERATED from data/publications.json
src/data/cocreation.ts      ← the governed co-creation case study
src/lib/seo.ts              ← canonical URLs, absolute OG, JSON-LD graph
src/routes/                 ← Temple, Inquiry, Instruments, Record, Writings,
                              Case study, About
src/components/temple/      ← Threshold Field, Wonder→Receipt, Standing, Two Doors
public/llms.txt             ← written for machine readers; partly generated
scripts/sync-publications.mjs
scripts/postbuild.mjs
```

## Adding a publication

Edit `data/publications.json`, then:

```bash
npm run sync:publications
```

That regenerates `src/data/publications.ts` and the AUTOGEN block in
`public/llms.txt`. The Record route, the JSON-LD `@graph`, and `llms.txt` all
read from the same source, so they cannot disagree. CI fails the build if you
forget to run it.

## Standing

Every claim carries three axes wherever it renders:

- **What it is** — instrument, study, protocol, essay, RFC, hypothesis set
- **Where it is** — living, active, closed, published, awaiting validation
- **What the evidence says** — supported within scope, bounded null, untested,
  experiential record

Living questions carry standing too. One of the five is closed, and the answer
is shown — a question that was asked, instrumented, and settled is the strongest
statement the covenant can make.

Add a new evidence phrase freely: `evidenceTone()` in `src/data/content.ts` maps
it to a colour and degrades to neutral for anything it does not recognise.

## Deploying

GitHub Actions builds and publishes to Pages on every push to `main`
(`.github/workflows/deploy.yml`). The build output already contains `CNAME`,
`.nojekyll`, `sitemap.xml`, `robots.txt`, `llms.txt`, and a redirect stub for
every previously published URL.

Moving to Cloudflare Pages instead: build command `npm run build`, output
directory `dist/client`. The emitted `_redirects` file becomes real 301s.

## Notes

- Papers and instruments link to github.com/templetwo and published DOIs.
- Visual register: astronomical dark · warm ivory · brass/ember · graphite steel.
- Wonder is amber (`--color-wonder`), rigor is steel (`--color-rigor`). Those two
  families are the whole system; do not add a third accent.

© 2026 Temple of Two — Anthony J. Vasquez Sr.
Papers CC BY 4.0 · site & chronicle dual-licensed.
