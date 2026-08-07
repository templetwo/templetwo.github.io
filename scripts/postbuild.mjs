#!/usr/bin/env node
/**
 * Post-build: everything GitHub Pages needs that Vite does not emit.
 *
 *   .nojekyll     — Pages otherwise drops _-prefixed asset folders
 *   sitemap.xml   — derived by walking the prerendered output, so it can never
 *                   list a route that was not actually built
 *   redirect stubs — the old .html URLs are cited from DOI pages and essays.
 *                   Each gets a real file with a canonical link and a refresh.
 *   _redirects    — 301s for Cloudflare Pages, ignored by GitHub Pages
 *   CNAME         — custom domain
 */

import { readdir, readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, sep } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://thetempleoftwo.com";
const DOMAIN = "thetempleoftwo.com";

/** TanStack's static output has moved between versions — take the first that exists. */
async function findOutDir() {
  for (const candidate of [".output/public", "dist/client", "dist"]) {
    const path = join(ROOT, candidate);
    try {
      const s = await stat(path);
      if (s.isDirectory()) {
        const entries = await readdir(path);
        if (entries.includes("index.html")) return path;
      }
    } catch {
      /* keep looking */
    }
  }
  throw new Error(
    "Could not find the build output (looked in .output/public, dist/client, dist).",
  );
}

const OUT = await findOutDir();
console.log(`postbuild · output at ${relative(ROOT, OUT)}`);

/* ── routes, derived from what actually got prerendered ── */

async function collectRoutes(dir, base = "") {
  const routes = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name.startsWith("_") || entry.name === "assets" || entry.name === "images") {
        continue;
      }
      routes.push(...(await collectRoutes(join(dir, entry.name), `${base}/${entry.name}`)));
    } else if (entry.name === "index.html") {
      routes.push(base === "" ? "/" : base);
    }
  }
  return routes;
}

const routes = (await collectRoutes(OUT)).sort();
console.log(`postbuild · ${routes.length} prerendered routes`);

/* ── sitemap ── */

const today = new Date().toISOString().slice(0, 10);

const sitemapXml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routes.map((r) => {
    const loc = r === "/" ? `${ORIGIN}/` : `${ORIGIN}${r}`;
    const priority = r === "/" ? "1.0" : r.split("/").length > 2 ? "0.6" : "0.8";
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority}</priority>\n  </url>`;
  }),
  "</urlset>",
  "",
].join("\n");

await writeFile(join(OUT, "sitemap.xml"), sitemapXml, "utf8");
console.log("postbuild · wrote sitemap.xml");

/* ── redirects for every previously published URL ── */

const REDIRECTS = [
  ["/research.html", "/instruments"],
  ["/publications.html", "/record"],
  ["/sovereign-stack.html", "/instruments/sovereign-stack"],
  ["/essays.html", "/writings"],
  ["/about.html", "/about"],
  ["/index.html", "/"],
  ["/essays/where-it-lands.html", "/writings#where-it-lands"],
  ["/essays/the-color-of-a-voice.html", "/writings#the-color-of-a-voice"],
  ["/essays/the-conditional-seat.html", "/writings#the-conditional-seat"],
  ["/essays/a-rented-seat.html", "/writings#a-rented-seat"],
];

function stub(to) {
  const target = `${ORIGIN}${to}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved — Temple of Two</title>
<link rel="canonical" href="${target}">
<meta name="robots" content="noindex, follow">
<meta http-equiv="refresh" content="0; url=${target}">
<style>
  html { color-scheme: dark; }
  body { margin: 0; min-height: 100dvh; display: grid; place-items: center;
         background: #0b0d12; color: #c8c2b4;
         font-family: "Source Sans 3", system-ui, sans-serif; text-align: center; padding: 2rem; }
  a { color: #c9955a; }
</style>
</head>
<body>
<main>
  <p>This page has moved.</p>
  <p><a href="${target}">${target}</a></p>
</main>
<script>window.location.replace(${JSON.stringify(target)});</script>
</body>
</html>
`;
}

/*
 * A stub must never shadow a real route.
 *
 * GitHub Pages resolves an extension-less request by trying `<name>.html`
 * BEFORE `<name>/index.html`. So writing a stub at `about.html` that redirects
 * to `/about` makes /about serve the stub, which redirects to /about — an
 * infinite reload on a page linked from the main nav. This shipped live on
 * 2026-08-07 and was caught by requesting the deployed URL.
 *
 * Where the legacy path collides with a real page, copy the real page there
 * instead of a stub: /about.html and /about then serve identical content, and
 * the old URL still resolves for anything citing it.
 */
let stubs = 0;
let copies = 0;
for (const [from, to] of REDIRECTS) {
  if (from === "/index.html") continue; // the real homepage lives there
  const dest = join(OUT, from.replace(/^\//, "").split("/").join(sep));
  await mkdir(dirname(dest), { recursive: true });

  const routeName = from.replace(/^\//, "").replace(/\.html$/, "");
  const realPage = join(OUT, routeName, "index.html");
  let shadows = false;
  try {
    await readFile(realPage, "utf8");
    shadows = true;
  } catch {
    shadows = false;
  }

  if (shadows) {
    await writeFile(dest, await readFile(realPage, "utf8"), "utf8");
    copies++;
  } else {
    await writeFile(dest, stub(to), "utf8");
    stubs++;
  }
}
console.log(
  `postbuild · wrote ${stubs} redirect stubs, ${copies} shadow-safe copies`,
);

/* Cloudflare Pages honours this file with real 301s; Pages ignores it. */
const redirectsFile = REDIRECTS.filter(([from]) => from !== "/index.html")
  .map(([from, to]) => `${from}  ${to}  301`)
  .join("\n");
await writeFile(join(OUT, "_redirects"), `${redirectsFile}\n`, "utf8");

/* ── Pages housekeeping ── */

await writeFile(join(OUT, ".nojekyll"), "", "utf8");
await writeFile(join(OUT, "CNAME"), `${DOMAIN}\n`, "utf8");

/*
 * GitHub Pages serves its own generic 404 for any unmatched path, so a typo'd
 * or stale URL leaves the site entirely. `notFound()` in the $slug route can
 * never run on a static host. Ship a 404 that still looks like the Temple and
 * points back in.
 */
const notFoundPage = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Not found — Temple of Two</title>
<meta name="robots" content="noindex, follow">
<style>
  html { color-scheme: dark; }
  body { margin: 0; min-height: 100dvh; display: grid; place-items: center;
         background: #0b0d12; color: #f4efe6;
         font-family: ui-serif, Georgia, "Times New Roman", serif; text-align: center; }
  main { padding: 2rem; max-width: 34rem; }
  p.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
           font-size: .8rem; letter-spacing: .12em; text-transform: uppercase;
           color: #a79b8b; }
  h1 { font-size: 2rem; font-weight: 500; margin: .75rem 0 0; }
  p.lede { color: #cdc3b6; line-height: 1.6; }
  a { color: #e8b563; }
  nav a { margin: 0 .6rem; font-size: .9rem; }
</style>
</head>
<body>
<main>
  <p class="mono">404</p>
  <h1>This threshold does not open.</h1>
  <p class="lede">The page you asked for is not here. It may have moved, or it
  may never have existed. Nothing is deleted from the record — if you followed
  a citation, the work is still findable below.</p>
  <nav>
    <a href="${ORIGIN}/">Temple</a>
    <a href="${ORIGIN}/instruments">Instruments</a>
    <a href="${ORIGIN}/record">Record</a>
  </nav>
</main>
</body>
</html>
`;
await writeFile(join(OUT, "404.html"), notFoundPage, "utf8");
console.log("postbuild · wrote 404.html");

/* Sanity: llms.txt and robots.txt must have survived from public/. */
for (const required of ["llms.txt", "robots.txt"]) {
  try {
    await readFile(join(OUT, required), "utf8");
  } catch {
    throw new Error(`${required} is missing from the build output — check public/`);
  }
}

console.log("postbuild · done");
