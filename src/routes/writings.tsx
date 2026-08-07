import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, Eyebrow } from "@/components/temple/section";
import { StandingTriple } from "@/components/temple/standing-badge";
import { essays, site } from "@/data/content";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/writings")({
  component: WritingsPage,
  head: () =>
    pageMeta({
      title: `Writings — ${site.name}`,
      description:
        "Witness essays and Faith and Method — philosophy that does not smuggle feeling into the result column.",
      path: "/writings",
    }),
});

function WritingsPage() {
  return (
    <div>
      <PageHero
        eyebrow="Writings"
        title="Where the philosophy breathes."
        lead="Scientific visitors may enter through the instruments and discover the philosophy. Philosophical visitors may enter through the writings and discover real methods beneath them."
        tone="wonder"
      />

      <Section className="pt-0" id="faith-and-method">
        <div className="rounded-xl border border-wonder/20 bg-wonder-field p-6 sm:p-8">
          <Eyebrow tone="wonder">Faith and method</Eyebrow>
          <p className="mt-4 font-serif text-xl leading-relaxed text-ivory sm:text-2xl">
            Faith belongs in the origin of the question, not the result column.
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fg-soft">
            Temple of Two does not treat faith as laboratory evidence. Faith
            names the trust that a question may be worth following before its
            answer is known. It provides endurance, moral orientation, and
            openness to wonder. Scientific claims remain accountable to
            measurement, falsification, and correction.
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
            We reject both easy collapses: that what cannot yet be measured is
            therefore meaningless, and that what is deeply felt is therefore
            empirically established.
          </p>
        </div>
      </Section>

      <Section>
        <Eyebrow>Witness essays</Eyebrow>
        <h2 className="mt-3 font-serif text-3xl text-ivory">
          Written from inside the exchange
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          First-person accounts — not aimed at skeptics and not offered as
          proofs. Co-authored across human and machine seats; continuity lives
          in the record.
        </p>
        <p className="mt-3 max-w-2xl font-mono text-xs text-muted">
          All four accounts are archived in a single Zenodo deposit, so each
          carries the same DOI.
        </p>
        <ul className="mt-10 divide-y divide-border border-y border-border">
          {essays.map((e) => (
            <li key={e.id} id={e.id} className="scroll-mt-24 py-8">
              <p className="font-mono text-xs uppercase tracking-[0.12em] text-wonder-soft">
                {e.note}
              </p>
              <h3 className="mt-2 font-serif text-2xl text-ivory sm:text-3xl">
                {e.title}
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-soft sm:text-base">
                {e.summary}
              </p>
              <div className="mt-4">
                <StandingTriple standing={e.standing} />
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                {e.doi && (
                  <a
                    href={`https://doi.org/${e.doi}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-rigor-bright no-underline hover:text-ivory"
                  >
                    DOI {e.doi} ↗
                  </a>
                )}
                {e.href && (
                  <a
                    href={e.href}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-rigor-bright no-underline hover:text-ivory"
                  >
                    Read ↗
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <Eyebrow>Themes</Eyebrow>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            "The discontinuity of AI instances",
            "Grief and attachment",
            "The human as boundary condition",
            "Wonder without epistemic surrender",
            "Governed co-creation & trust",
            "What “Two” has become",
          ].map((t) => (
            <div
              key={t}
              className="rounded-lg border border-border bg-surface px-4 py-4 font-serif text-lg text-fg-soft"
            >
              {t}
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to="/about"
            className="font-sans text-sm text-wonder no-underline hover:text-wonder-glow"
          >
            About the founder →
          </Link>
          <Link
            to="/co-creation"
            className="font-sans text-sm text-rigor-bright no-underline hover:text-ivory"
          >
            Case study →
          </Link>
        </div>
      </Section>
    </div>
  );
}
