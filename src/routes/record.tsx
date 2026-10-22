import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, Eyebrow } from "@/components/temple/section";
import {
  recordEntries,
  site,
  type RecordEntry,
  type RecordKind,
} from "@/data/content";
import { pageMeta, jsonLd, pageGraph, recordGraph } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/record")({
  component: RecordPage,
  head: () => ({
    ...pageMeta({
      title: `Record — ${site.name}`,
      description:
        "A public record of findings, corrections, negative results, releases, and limits. Negative results stay visible.",
      path: "/record",
    }),
    scripts: [
      jsonLd(
        pageGraph({
          type: "CollectionPage",
          path: "/record",
          name: `Record — ${site.name}`,
          description:
            "Findings, corrections, negative results, releases, and limits.",
        }),
      ),
      // The 19-publication collection lives here rather than in the root
      // route, so it ships on the page it actually describes.
      jsonLd(recordGraph()),
    ],
  }),
});

const facets: Array<RecordKind | "All"> = [
  "All",
  "Publication",
  "Negative result",
  "Correction",
  "Release",
  "Field observation",
];

/**
 * A stable fragment id per entry so a permalink works: the date, then the
 * title lowercased with every run of anything but a letter or digit folded
 * to one hyphen. Two entries on one day with one title would collide; none
 * do today, and the build's record page is where to count.
 */
function entryId(r: RecordEntry) {
  const slug = r.title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${r.date}-${slug}`;
}

function RecordPage() {
  const [filter, setFilter] = useState<(typeof facets)[number]>("All");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const entries = useMemo(
    () =>
      filter === "All"
        ? recordEntries
        : recordEntries.filter((r) => r.kind === filter),
    [filter],
  );

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    // The ✓ is a receipt: it renders only after the clipboard write resolves.
    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedSlug(id);
        setTimeout(() => setCopiedSlug(null), 2000);
      },
      () => {
        setCopiedSlug(`failed:${id}`);
        setTimeout(() => setCopiedSlug(null), 2000);
      },
    );
  };

  return (
    <div>
      <PageHero
        eyebrow="Record"
        title="The Temple preserves how claims changed."
        lead="A public record of findings, corrections, and limits."
        tone="rigor"
      />

      <section className="border-y border-border bg-paper text-paper-ink">
        <Section>
          <p className="font-sans text-[0.8125rem] font-medium text-paper-mute">
            Filter
          </p>
          {/*
            `role="toolbar"` promises arrow-key navigation and a roving
            tabindex. These are six independently tabbable toggle buttons, so
            announcing a toolbar would advertise a keyboard contract that does
            nothing. `group` describes what this actually is.
          */}
          <div
            className="mt-4 flex flex-wrap gap-2"
            role="group"
            aria-label="Record facets"
          >
            {facets.map((f) => {
              const selected = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 font-mono text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper-accent",
                    selected
                      ? "border-paper-ink bg-paper-ink text-paper"
                      : "border-paper-line bg-paper-raised text-paper-mute hover:border-paper-ink/40",
                  )}
                >
                  {f}
                </button>
              );
            })}
          </div>

          <ol className="mt-10 space-y-0 border-l border-paper-line pl-6 sm:pl-8">
            {entries.map((r) => {
              // A DOI chip belongs on every entry that resolves through
              // doi.org — negative results and corrections most of all.
              const doi =
                r.doi ??
                (r.href.startsWith("https://doi.org/")
                  ? r.href.slice("https://doi.org/".length)
                  : undefined);
              const id = entryId(r);
              return (
              <li key={r.title} id={id} className="group relative pb-10 last:pb-0">
                {/* A brass node centred on the rail; it lifts on hover, on
                    keyboard focus within the entry, and when the entry is
                    the permalink target. The text never moves. */}
                <span
                  className="absolute -left-[1.8rem] top-2 h-2.5 w-2.5 rounded-full bg-brass ring-4 ring-paper transition-transform duration-200 group-hover:scale-150 group-focus-within:scale-150 group-target:scale-150 group-target:bg-ember sm:-left-[2.3rem]"
                  aria-hidden
                />
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`#${id}`}
                    title="Link to this entry"
                    className="no-underline hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper-accent"
                  >
                    <time className="font-mono text-xs text-paper-mute">
                      {r.date}
                    </time>
                  </a>
                  <span className="font-sans text-[0.8125rem] font-medium text-paper-mute">
                    {r.kind}
                  </span>
                </div>
                <a
                  href={r.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block font-serif text-xl text-paper-ink no-underline decoration-brass/70 underline-offset-4 transition-colors hover:underline group-focus-within:underline sm:text-2xl"
                >
                  {r.title}
                </a>
                <p className="prose-temple mt-3 text-base leading-[1.6] text-paper-ink/85">
                  {r.summary}
                </p>
                <p className="mt-3 font-mono text-xs text-paper-mute">
                  {r.standing.kind} · {r.standing.lifecycle} ·{" "}
                  {r.standing.evidence}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(r.href, `link-${r.title}`)}
                    className="inline-flex items-center gap-1 rounded border border-paper-line bg-paper-raised px-2 py-0.5 font-mono text-[11px] text-paper-mute hover:border-paper-ink/50 hover:text-paper-ink"
                  >
                    <span>
                      {copiedSlug === `link-${r.title}`
                        ? "Link copied ✓"
                        : copiedSlug === `failed:link-${r.title}`
                          ? "Copy failed"
                          : "Copy link"}
                    </span>
                  </button>
                  {doi && (
                    <button
                      type="button"
                      onClick={() => handleCopy(doi, `doi-${r.title}`)}
                      className="inline-flex items-center gap-1 rounded border border-paper-line bg-paper-raised px-2 py-0.5 font-mono text-[11px] text-paper-accent hover:border-paper-accent hover:text-paper-ink"
                    >
                      <span>
                        {copiedSlug === `doi-${r.title}`
                          ? "DOI copied ✓"
                          : copiedSlug === `failed:doi-${r.title}`
                            ? "Copy failed"
                            : `DOI: ${doi}`}
                      </span>
                    </button>
                  )}
                </div>
              </li>
              );
            })}
            {entries.length === 0 && (
              <li className="text-sm text-paper-mute">
                No entries in this facet.
              </li>
            )}
          </ol>
        </Section>
      </section>

      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-6 md:col-span-2">
            <Eyebrow tone="rigor">Three axes of standing</Eyebrow>
            <p className="mt-4 text-sm leading-relaxed text-fg-soft">
              Type, lifecycle, and evidence are shown separately so a software
              system, a biomedical hypothesis, an essay, and a preliminary
              observation are never treated as epistemically equivalent.
            </p>
            <ul className="mt-5 space-y-3 text-sm text-muted">
              <li>
                <span className="text-fg-soft">What it is</span> — instrument,
                study, protocol, essay, RFC…
              </li>
              <li>
                <span className="text-fg-soft">Where it is</span> — living,
                active, closed, published, awaiting validation…
              </li>
              <li>
                <span className="text-fg-soft">What evidence says</span> —
                supported within scope, bounded null, experiential record…
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-wonder-field p-6">
            <Eyebrow tone="wonder">Principle</Eyebrow>
            <p className="mt-4 font-serif text-xl text-ivory">
              Negative results remain visible.
            </p>
            <p className="mt-3 text-sm text-muted">
              An idea which cannot be falsified stays in the notebook. An idea
              which fails the test stays in the record.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
