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

/** SPDX identifiers seen on the deposits so far; extend when a new one is read. */
const LICENSES = new Set(["CC-BY-4.0", "Apache-2.0", "MIT"]);

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
  // Optional, copied from the deposit's own metadata and never invented:
  // `authors` is the archive's creators list verbatim; `license` is the
  // ARCHIVE DEPOSIT's license id (Zenodo metadata.license.id, OSF license),
  // as an SPDX id. It is the license of the deposit itself, not of a
  // repository or text the deposit points at; where those differ,
  // `license_note` states both side by side (HQ ruling 2026-10-22, on the
  // Where It Lands entry: deposit CC BY 4.0, repository text The Witness
  // License v1.0). A row that names authors must also carry its license, so
  // a half-filled entry cannot ship; an unknown license id fails here rather
  // than in a crawler. Entries whose deposit has not been read carry neither.
  if (p.authors !== undefined) {
    if (!Array.isArray(p.authors) || p.authors.length === 0 || !p.authors.every((a) => typeof a === "string" && a.trim())) {
      throw new Error(`Publication "authors" must be a non-empty list of names: ${p.doi}`);
    }
    if (!p.license) throw new Error(`Publication names authors but no license: ${p.doi}`);
  }
  if (p.license !== undefined && !LICENSES.has(p.license)) {
    throw new Error(`Unknown license id "${p.license}" on ${p.doi}; known: ${[...LICENSES].join(", ")}`);
  }
  if (p.license_note !== undefined && (typeof p.license_note !== "string" || !p.license_note.trim())) {
    throw new Error(`Publication "license_note" must be a non-empty string: ${p.doi}`);
  }
  // A blurb that names a license is naming one the deposit field may not
  // carry; it must say which is which, or the two silently contradict.
  if (/\blicense\b/i.test(p.blurb) && !p.license_note) {
    throw new Error(
      `Publication blurb names a license but has no "license_note" stating it beside the deposit's: ${p.doi}`,
    );
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
    if (p.authors) lines.push(`    authors: ${lit(p.authors)},`);
    if (p.license) lines.push(`    license: ${lit(p.license)},`);
    if (p.license_note) lines.push(`    license_note: ${lit(p.license_note)},`);
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
  /** The deposit's creators, verbatim from the archive, when more than one. */
  authors?: string[];
  /** The archive deposit's own license, as an SPDX id. Absent when unread. */
  license?: string;
  /** Where a repository or text carries a different license than its deposit, both, stated. */
  license_note?: string;
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
      `- ${p.title} — ${p.venue}, ${p.date} — evidence: ${p.evidence ?? "published, open access (venue fact, not an evidence claim)"}${p.license ? ` — license: ${p.license}${p.license_note ? ` (${p.license_note})` : ""}` : ""}${p.authors ? ` — authors: ${p.authors.join("; ")}` : ""} — (${p.blurb}) — https://doi.org/${p.doi}`,
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
