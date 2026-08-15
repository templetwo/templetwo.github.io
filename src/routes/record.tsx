import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, Eyebrow } from "@/components/temple/section";
import { recordEntries, site, type RecordKind } from "@/data/content";
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
      // The 18-publication collection lives here rather than in the root
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
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-paper-mute">
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
              return (
              <li key={r.title} className="relative pb-10 last:pb-0">
                <span
                  className="absolute -left-[1.55rem] top-1.5 h-2.5 w-2.5 rounded-full border border-paper-accent bg-paper sm:-left-[2.05rem]"
                  aria-hidden
                />
                <div className="flex flex-wrap items-center gap-3">
                  <time className="font-mono text-xs text-paper-mute">
                    {r.date}
                  </time>
                  <span className="font-mono text-xs uppercase tracking-[0.12em] text-paper-mute">
                    {r.kind}
                  </span>
                </div>
                <a
                  href={r.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block font-serif text-xl text-paper-ink no-underline hover:underline sm:text-2xl"
                >
                  {r.title}
                </a>
                <p className="mt-2 max-w-2xl text-sm text-paper-mute">
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
