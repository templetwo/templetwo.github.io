#!/usr/bin/env node
/**
 * Publications sync — the port of scripts/sync_publications.py.
 *
 * `data/publications.json` is the single source of truth. This script writes:
 *
 *   src/data/publications.ts   — what the Record route and JSON-LD render
 *   public/llms.txt            — the AUTOGEN block between the markers
 *
 * Run with --check to verify without writing. `npm run build` calls it in
 * check mode first, so the build fails when the receipts disagree with the
 * source rather than shipping a site whose structured data has drifted.
 */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(ROOT, "data", "publications.json");
const TS_OUT = join(ROOT, "src", "data", "publications.ts");
const LLMS = join(ROOT, "public", "llms.txt");

const START = "<!-- AUTOGEN:PUBLICATIONS_LLMSTXT:START -->";
const END = "<!-- AUTOGEN:PUBLICATIONS_LLMSTXT:END -->";

const check = process.argv.includes("--check");

const raw = JSON.parse(await readFile(SOURCE, "utf8"));
const pubs = raw.publications;
if (!Array.isArray(pubs) || pubs.length === 0) {
  throw new Error(`No publications found in ${SOURCE}`);
}

for (const p of pubs) {
  for (const field of ["doi", "headline", "title", "venue", "date", "blurb"]) {
    if (!p[field]) throw new Error(`Publication missing "${field}": ${JSON.stringify(p)}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date)) {
    throw new Error(`Publication date must be YYYY-MM-DD: ${p.doi} has "${p.date}"`);
  }
}

const sorted = [...pubs].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

/* ── src/data/publications.ts ── */

const lit = (s) => JSON.stringify(s);

const tsBody = sorted
  .map((p) => {
    const lines = [
      `    doi: ${lit(p.doi)},`,
      `    headline: ${lit(p.headline)},`,
      `    title: ${lit(p.title)},`,
      `    venue: ${lit(p.venue)},`,
      `    date: ${lit(p.date)},`,
      `    blurb: ${lit(p.blurb)},`,
    ];
    if (p.evidence) lines.push(`    evidence: ${lit(p.evidence)},`);
    return `  {\n${lines.join("\n")}\n  },`;
  })
  .join("\n");

const ts = `/**
 * GENERATED — do not edit by hand.
 * Source: data/publications.json  ·  Regenerate: npm run sync:publications
 *
 * The same JSON drives this module, public/llms.txt, and the JSON-LD emitted
 * by src/lib/seo.ts. \`npm run verify:publications\` fails the build if they drift.
 */

export type Publication = {
  doi: string;
  headline: string;
  title: string;
  venue: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  blurb: string;
  /** Optional override for the record's evidence axis. */
  evidence?: string;
};

export const publications: Publication[] = [
${tsBody}
];
`;

/* ── public/llms.txt ── */

// The evidence axis travels with the claim here too. llms.txt promises a
// machine reader that it can tell a bounded null from a supported result;
// dropping the axis from this block broke that promise silently.
const llmsBlock = sorted
  .map(
    (p) =>
      `- ${p.title} — ${p.venue}, ${p.date} — evidence: ${p.evidence ?? "published, open access (venue fact, not an evidence claim)"} — (${p.blurb}) — https://doi.org/${p.doi}`,
  )
  .join("\n");

const llmsCurrent = await readFile(LLMS, "utf8");
const startIdx = llmsCurrent.indexOf(START);
const endIdx = llmsCurrent.indexOf(END);
if (startIdx === -1 || endIdx === -1) {
  throw new Error(`Missing AUTOGEN markers in ${LLMS}`);
}
const llms =
  llmsCurrent.slice(0, startIdx + START.length) +
  "\n" +
  llmsBlock +
  "\n" +
  llmsCurrent.slice(endIdx);

/* ── write or check ── */

async function settle(path, next, label) {
  let current = "";
  try {
    current = await readFile(path, "utf8");
  } catch {
    /* new file */
  }
  if (current === next) return { path, label, changed: false };
  if (check) return { path, label, changed: true };
  await writeFile(path, next, "utf8");
  return { path, label, changed: true };
}

const results = [
  await settle(TS_OUT, ts, "src/data/publications.ts"),
  await settle(LLMS, llms, "public/llms.txt"),
];

const drifted = results.filter((r) => r.changed);

if (check) {
  if (drifted.length > 0) {
    console.error("Publications are out of sync with data/publications.json:");
    for (const d of drifted) console.error(`  · ${d.label}`);
    console.error("\nRun: npm run sync:publications");
    process.exit(1);
  }
  console.log(`Publications in sync — ${sorted.length} entries.`);
} else {
  if (drifted.length === 0) {
    console.log(`Publications already in sync — ${sorted.length} entries.`);
  } else {
    for (const d of drifted) console.log(`Wrote ${d.label}`);
  }
}
