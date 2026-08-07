import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, Eyebrow } from "@/components/temple/section";
import { StandingTriple } from "@/components/temple/standing-badge";
import { WonderReceiptPanel } from "@/components/temple/wonder-receipt";
import { instruments, site } from "@/data/content";
import { pageMeta, jsonLd, pageGraph } from "@/lib/seo";

export const Route = createFileRoute("/instruments/")({
  component: InstrumentsPage,
  head: () => ({
    ...pageMeta({
      title: `Instruments — ${site.name}`,
      description:
        "Instruments built to test consequential questions — each with standing, findings, failures, and verification paths.",
      path: "/instruments",
    }),
    scripts: [
      jsonLd(
        pageGraph({
          type: "CollectionPage",
          path: "/instruments",
          name: `Instruments — ${site.name}`,
          description:
            "Instruments with question, finding, what failed, standing, and verification.",
        }),
      ),
    ],
  }),
});

function InstrumentsPage() {
  // Every instrument carries the arc, so filtering on its presence selects
  // nothing. Name the two where rigor overturned the original intuition: the
  // compass (a filter could not have moved token-level entropy) and entropy
  // itself (the kinetic separation dissolved under a longer horizon). The rest
  // live on their detail pages.
  const ARC_SLUGS = ["phenomenological-compass", "entropy-as-equilibrium"];
  const withArc = ARC_SLUGS.map((slug) =>
    instruments.find((i) => i.slug === slug),
  ).filter((i): i is (typeof instruments)[number] =>
    Boolean(i?.wonderToReceipt),
  );

  return (
    <div>
      <PageHero
        eyebrow="Instruments"
        title="Instruments built to test consequential questions."
        lead="Each carries the same anatomy: the question, the instrument, the finding, what failed, current standing, and a path to verify."
        tone="rigor"
      />

      <Section className="pt-0">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {instruments.map((inst) => (
            <Link
              key={inst.id}
              to="/instruments/$slug"
              params={{ slug: inst.slug }}
              className="rounded-lg border border-border bg-surface px-4 py-4 no-underline transition-colors hover:border-border-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rigor"
            >
              <p className="font-serif text-base text-ivory">{inst.name}</p>
              <p className="mt-2 font-mono text-xs text-muted">
                {inst.standing.kind} · {inst.standing.lifecycle}
              </p>
              <p className="mt-1 font-mono text-xs text-rigor-bright">
                {inst.standing.evidence}
              </p>
            </Link>
          ))}
        </div>
      </Section>

      <Section className="pt-4">
        <Eyebrow tone="rigor">Overview</Eyebrow>
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {instruments.map((inst) => (
            <li
              key={inst.id}
              className="grid gap-4 py-8 lg:grid-cols-[1fr_auto]"
            >
              <div>
                <Link
                  to="/instruments/$slug"
                  params={{ slug: inst.slug }}
                  className="font-serif text-2xl text-ivory no-underline hover:text-wonder-glow"
                >
                  {inst.name}
                </Link>
                <p className="mt-2 max-w-2xl text-sm text-muted">
                  {inst.oneLiner}
                </p>
                <div className="mt-3">
                  <StandingTriple standing={inst.standing} />
                </div>
              </div>
              <Link
                to="/instruments/$slug"
                params={{ slug: inst.slug }}
                className="self-center font-mono text-xs text-rigor-bright no-underline hover:text-ivory"
              >
                Open →
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {withArc.length > 0 && (
        <Section>
          <Eyebrow tone="wonder">From wonder to receipt</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl text-ivory">
            How a question traveled
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            Including where the original intuition did not survive contact with
            measurement.
          </p>
          <div className="mt-10 space-y-10">
            {withArc.map((inst) => (
              <WonderReceiptPanel key={inst.id} instrument={inst} />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
