import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, Eyebrow } from "@/components/temple/section";
import { livingQuestions, lineage, site } from "@/data/content";
import { StandingTriple } from "@/components/temple/standing-badge";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/inquiry")({
  component: InquiryPage,
  head: () =>
    pageMeta({
      title: `Inquiry — ${site.name}`,
      description:
        "Foundational questions of Temple of Two: commitment, context, continuity, governance, and witness. Questions carry standing — one of them is closed.",
      path: "/inquiry",
    }),
});

function InquiryPage() {
  return (
    <div>
      <PageHero
        eyebrow="Inquiry"
        title="Five questions organize the work."
        lead="Each technical artifact is a different instrument pointed at a deep question."
        tone="wonder"
      />

      <Section className="pt-0">
        <div className="rounded-xl border border-border bg-surface p-6 sm:p-8">
          <p className="font-serif text-xl text-fg-soft sm:text-2xl">
            Faith opens the inquiry. Rigor governs the claim.
          </p>
          <p className="mt-4 max-w-2xl text-sm text-muted">
            We begin where the question is alive. We measure what can be
            measured. We do not pretend the measurement exhausts the mystery.
          </p>
        </div>
      </Section>

      <Section className="pt-4">
        <Eyebrow>Living questions</Eyebrow>
        <div className="mt-8 space-y-10">
          {livingQuestions.map((q, i) => (
            <article
              key={q.id}
              id={q.id}
              className="scroll-mt-24 border-t border-border pt-10 first:border-t-0 first:pt-0"
            >
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                <div>
                  <span className="font-mono text-xs text-muted">
                    Question {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="mt-2 font-serif text-3xl text-ivory sm:text-4xl">
                    {q.question}
                  </h2>
                  <p className="mt-2 text-base italic text-wonder-soft">
                    {q.brief}
                  </p>
                  <div className="mt-4">
                    <StandingTriple standing={q.standing} />
                  </div>
                  <p className="mt-5 text-base leading-relaxed text-fg-soft">
                    {q.detail}
                  </p>
                  {q.answer && (
                    <div className="mt-5 rounded-lg border border-living/35 bg-living/[0.07] p-5">
                      <p className="font-mono text-xs uppercase tracking-[0.14em] text-living">
                        Answered · the record changed
                      </p>
                      <p className="mt-2.5 text-sm leading-relaxed text-fg-soft">
                        {q.answer}
                      </p>
                      {q.limit && (
                        <p className="mt-3 text-sm leading-relaxed text-muted">
                          <span className="text-fg-soft">Limit</span> —{" "}
                          {q.limit}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-border bg-surface p-5">
                  <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                    Related work
                  </p>
                  <ul className="mt-4 space-y-2">
                    {q.projects.map((p) => (
                      <li
                        key={p}
                        className="border-b border-border/70 py-2 text-sm text-fg-soft last:border-0"
                      >
                        {p}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 font-mono text-xs text-muted">
                    {q.artifact.label} — {q.artifact.caption}
                  </p>
                  <Link
                    to="/instruments"
                    className="mt-4 inline-block font-sans text-sm text-rigor-bright no-underline hover:text-ivory"
                  >
                    See instruments →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <Eyebrow tone="rigor">Lineages</Eyebrow>
        <h2 className="mt-3 font-serif text-3xl text-ivory">
          The work developed through lineages
        </h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {lineage.map((arc) => (
            <div
              key={arc.title}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <h3 className="font-serif text-lg text-ivory">{arc.title}</h3>
              <ol className="mt-5 space-y-0">
                {arc.steps.map((step, i) => (
                  <li key={step} className="relative pl-6">
                    {i < arc.steps.length - 1 && (
                      <span
                        className="absolute left-[0.4rem] top-5 h-full w-px bg-border"
                        aria-hidden
                      />
                    )}
                    <span
                      className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-wonder/70"
                      aria-hidden
                    />
                    <p className="pb-5 text-sm text-fg-soft last:pb-0">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
