#!/usr/bin/env node
/**
 * Fail the build if the contact form would ship pointing at nothing.
 *
 * This guard exists because it already happened: the site shipped with
 * `https://contact.thetempleoftwo.com/submit`, a hostname that has never
 * existed (NXDOMAIN). Nothing caught it — the form rendered, the button
 * worked, and every message would have gone nowhere. A site whose whole
 * argument is that claims carry receipts should not invite collaboration
 * through a dead endpoint.
 *
 * Checks, in order:
 *   1. `contactEndpoint` is present and is not a known placeholder.
 *   2. It is either an absolute https URL or a same-origin path.
 *   3. If absolute, its hostname actually resolves in DNS.
 *
 * DNS resolution is skipped when offline or when SKIP_CONTACT_DNS=1, so a
 * flaky network cannot block a build. A hostname that resolves NXDOMAIN is a
 * hard failure; a lookup that fails for any other reason is a warning.
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Resolver } from "node:dns/promises";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(ROOT, "src", "data", "content.ts");

const PLACEHOLDERS = [
  "REPLACE_ME",
  "YOUR_WORKER",
  "example.com",
  "<subdomain>",
  "contact.thetempleoftwo.com",
];

const src = await readFile(CONTENT, "utf8");
const match = src.match(/contactEndpoint:\s*"([^"]*)"/);

if (!match) {
  console.error("contact · no `contactEndpoint` found in src/data/content.ts");
  process.exit(1);
}

const endpoint = match[1].trim();

if (!endpoint) {
  console.error("contact · `contactEndpoint` is empty — the form would post to the page itself.");
  process.exit(1);
}

const hit = PLACEHOLDERS.find((p) => endpoint.includes(p));
if (hit) {
  console.error(`contact · \`contactEndpoint\` still contains the placeholder "${hit}":`);
  console.error(`            ${endpoint}`);
  console.error("");
  console.error("          Fix it one of two ways:");
  console.error("            1. cd contact-worker && npx wrangler deploy   (workers_dev = true)");
  console.error("               then paste the workers.dev URL into src/data/content.ts");
  console.error("            2. Ship without a contact form: remove <ContactForm /> from the");
  console.error("               routes and point people at site.email instead.");
  console.error("          See REPAIRS.md — 'Fourth pass — the contact form'.");
  process.exit(1);
}

if (endpoint.startsWith("/")) {
  console.warn(`contact · same-origin endpoint "${endpoint}".`);
  console.warn("          This only works if Cloudflare holds the zone and proxies it.");
  console.warn("          thetempleoftwo.com is managed by Webador, which does not allow");
  console.warn("          changing nameservers — so this will 405 from GitHub Pages unless");
  console.warn("          the domain has since been transferred. Verify before shipping.");
  process.exit(0);
}

let url;
try {
  url = new URL(endpoint);
} catch {
  console.error(`contact · \`contactEndpoint\` is neither an absolute URL nor a path: ${endpoint}`);
  process.exit(1);
}

if (url.protocol !== "https:") {
  console.error(`contact · \`contactEndpoint\` must be https, got ${url.protocol}`);
  process.exit(1);
}

if (process.env.SKIP_CONTACT_DNS === "1") {
  console.log(`contact · ${url.hostname} (DNS check skipped)`);
  process.exit(0);
}

/*
 * Query DNS directly rather than through `dns.lookup`, which goes via the OS
 * resolver. macOS caches negative answers, so a hostname checked before it
 * existed keeps reporting NXDOMAIN locally long after it resolves everywhere
 * else — which is exactly what happened the first time this ran. A build must
 * not fail on a stale negative cache entry.
 */
const resolver = new Resolver();
resolver.setServers(["1.1.1.1", "8.8.8.8"]);

async function resolves(host) {
  for (const method of ["resolve4", "resolve6", "resolveCname"]) {
    try {
      const rec = await resolver[method](host);
      if (rec && rec.length) return true;
    } catch (err) {
      if (err?.code === "ENOTFOUND" || err?.code === "ENODATA") continue;
      throw err;
    }
  }
  return false;
}

try {
  if (await resolves(url.hostname)) {
    console.log(`contact · ${url.href} resolves`);
  } else {
    console.error(`contact · ${url.hostname} does not resolve (NXDOMAIN).`);
    console.error("          This is the exact failure that shipped before. Refusing to build.");
    process.exit(1);
  }
} catch (err) {
  console.warn(`contact · could not verify ${url.hostname} (${err.code ?? err}) — continuing`);
}
