import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, Eyebrow } from "@/components/temple/section";
import { TwoDoors } from "@/components/temple/two-doors";
import { ThresholdField } from "@/components/temple/threshold-field";
import { HeroBackdrop } from "@/components/temple/hero-backdrop";
import { HeroSeal } from "@/components/temple/hero-seal";
import { WonderReceiptPanel } from "@/components/temple/wonder-receipt";
import { StandingTriple } from "@/components/temple/standing-badge";
import {
  principles,
  instruments,
  recordEntries,
  about,
  memorial,
  site,
} from "@/data/content";
import { cocreation } from "@/data/cocreation";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () =>
    pageMeta({
      title: `${site.name} — ${site.tagline}`,
      description:
        "Independent inquiry into a shared architecture of commitment across biological and computational substrates — and an ongoing case study in human–AI governed co-creation. Every claim carries its standing.",
      path: "/",
    }),
});

function HomePage() {
  const featuredArc =
    instruments.find((i) => i.id === "entropy") ?? instruments[0];
  const featuredInstruments = instruments.filter((i) =>
    [
      "sovereign-stack",
      "compass",
      "vdac1",
      "t2helix",
      "entropy",
      "cosmic-allow",
    ].includes(i.id),
  );
  const recentRecord = recordEntries.slice(0, 3);

  return (
    <div className="grain">
      {/* Scene 1 — The Door */}
      <section className="relative overflow-hidden border-b border-border">
        <HeroBackdrop />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-wonder/40 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-28">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
            Independent inquiry
            <span className="hidden sm:inline"> · {site.founder}</span>
          </p>
          <h1 className="mt-5 max-w-4xl font-serif text-[2.75rem] leading-[1.05] tracking-tight text-ivory sm:mt-6 sm:text-6xl md:text-7xl">
            Where wonder
            <br />
            <span className="italic text-wonder-glow">meets</span> rigor.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-fg-soft sm:mt-8 sm:text-xl">
            Temple of Two begins with questions felt before evidence can answer
            them — and builds the instruments required to learn what can
            honestly be known.
          </p>
          <p className="mt-4 max-w-xl text-sm text-muted sm:text-base">
            Research · infrastructure · and an ongoing case study in human–AI
            governed co-creation and trust.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 sm:mt-10">
            <a
              href="#covenant"
              className="inline-flex h-11 items-center rounded-md bg-ivory px-5 font-sans text-sm font-medium text-void no-underline transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wonder"
            >
              Enter the inquiry
            </a>
            <Link
              to="/co-creation"
              className="inline-flex h-11 items-center rounded-md border border-border-strong bg-transparent px-5 font-sans text-sm text-fg-soft no-underline transition-colors hover:border-rigor hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rigor"
            >
              Case study
            </Link>
          </div>

          <HeroSeal />
        </div>
      </section>

      <Section className="pt-12 sm:pt-16">
        <TwoDoors />
      </Section>

      {/* Covenant */}
      <section
        id="covenant"
        className="border-y border-border bg-surface-warm/40"
      >
        <Section>
          <Eyebrow tone="wonder">The covenant of the work</Eyebrow>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <blockquote className="space-y-5 font-serif text-2xl leading-snug text-ivory sm:text-3xl">
              <p>Wonder may ask beyond the evidence.</p>
              <p className="text-wonder-soft">Faith may sustain the search.</p>
              <p className="text-rigor-bright">
                Rigor governs what may be claimed.
              </p>
              <p>The record preserves both findings and limits.</p>
            </blockquote>
            <div className="flex flex-col justify-center space-y-6 border-t border-border pt-8 md:border-l md:border-t-0 md:pl-10 md:pt-0">
              <p className="font-serif text-xl text-fg-soft sm:text-2xl">
                Faith opens the inquiry. Rigor governs the claim.
              </p>
              <p className="text-sm leading-relaxed text-muted">
                Philosophical propositions, witness accounts, and open questions
                also enter the record — marked as such, never dressed as
                measured findings.
              </p>
            </div>
          </div>
        </Section>
      </section>

      {/* Method */}
      <Section>
        <Eyebrow>Method</Eyebrow>
        <h2 className="mt-3 font-serif text-3xl text-ivory sm:text-4xl">
          Three principles
        </h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {principles.map((p, i) => (
            <li
              key={p.title}
              className="rounded-xl border border-border bg-surface p-6"
            >
              <span className="font-mono text-xs text-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-serif text-xl text-ivory">{p.title}</h3>
              <p className="mt-3 text-sm text-muted">{p.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Threshold */}
      <Section className="pt-4">
        <Eyebrow tone="rigor">Encounter</Eyebrow>
        <h2 className="mt-3 max-w-2xl font-serif text-3xl text-ivory sm:text-4xl">
          Five questions organize the work
        </h2>
        <p className="mt-4 max-w-2xl text-muted">
          Each instrument points at one of these. The full exposition lives
          under Inquiry.
        </p>
        <div className="mt-10">
          <ThresholdField />
        </div>
      </Section>

      {/* Wonder → Receipt */}
      <Section>
        <WonderReceiptPanel instrument={featuredArc} />
      </Section>

      {/* Instruments */}
      <Section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow tone="rigor">Instruments</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl text-ivory sm:text-4xl">
              Load-bearing systems
            </h2>
          </div>
          <Link
            to="/instruments"
            className="font-sans text-sm text-rigor-bright no-underline hover:text-ivory"
          >
            All instruments →
          </Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredInstruments.map((inst) => (
            <Link
              key={inst.id}
              to="/instruments/$slug"
              params={{ slug: inst.slug }}
              className="group flex flex-col rounded-xl border border-border bg-surface p-5 no-underline transition-colors hover:border-border-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rigor"
            >
              <h3 className="font-serif text-xl text-ivory group-hover:text-wonder-glow">
                {inst.name}
              </h3>
              <p className="mt-2 flex-1 text-sm text-muted">{inst.oneLiner}</p>
              <div className="mt-4">
                <StandingTriple standing={inst.standing} />
              </div>
              {inst.signal && (
                <p className="mt-3 font-mono text-xs text-muted">
                  {inst.signal}
                </p>
              )}
            </Link>
          ))}
        </div>
      </Section>

      {/* Case study — governed co-creation */}
      <section className="border-y border-border bg-void">
        <Section>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <Eyebrow tone="wonder">Case study</Eyebrow>
              <h2 className="mt-3 font-serif text-3xl text-ivory sm:text-4xl">
                {cocreation.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-fg-soft">
                {cocreation.lede}
              </p>
              <p className="mt-4 text-sm text-muted">
                Trust is not assumed. It is engineered: fail-closed membranes,
                human approval at mutation, public retrospective when claims
                inflate, and receipts so the next instance can check what
                happened.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/co-creation"
                  className="inline-flex h-11 items-center rounded-md bg-ivory px-5 font-sans text-sm font-medium text-void no-underline hover:opacity-90"
                >
                  Read the case study
                </Link>
                <a
                  href={site.retrospective}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center rounded-md border border-border-strong px-5 font-sans text-sm text-fg-soft no-underline hover:border-rigor hover:text-ivory"
                >
                  Retrospective audit ↗
                </a>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-border">
              <img
                src="/images/temple-duality.webp"
                alt="Warm and cool fields meeting at a threshold"
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
                width={784}
                height={1168}
              />
            </div>
          </div>
        </Section>
      </section>

      {/* Record — paper */}
      <section className="border-b border-border bg-paper text-paper-ink">
        <Section>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-paper-mute">
                The Record
              </p>
              <h2 className="mt-3 font-serif text-3xl text-paper-ink sm:text-4xl">
                Findings, corrections, and limits
              </h2>
              <p className="mt-3 max-w-xl text-sm text-paper-mute">
                A public record — three recent entries here; the full timeline
                under Record.
              </p>
            </div>
            <Link
              to="/record"
              className="font-sans text-sm text-paper-accent no-underline hover:underline"
            >
              Full record →
            </Link>
          </div>
          <ul className="mt-10 space-y-4">
            {recentRecord.map((r) => (
              <li
                key={r.title}
                className="grid gap-2 rounded-lg border border-paper-line bg-paper-raised p-5 sm:grid-cols-[6.5rem_1fr] sm:gap-6"
              >
                <time className="font-mono text-xs text-paper-mute">
                  {r.date}
                </time>
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.12em] text-paper-mute">
                    {r.kind}
                  </p>
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block font-serif text-lg text-paper-ink no-underline hover:underline"
                  >
                    {r.title}
                  </a>
                  <p className="mt-2 text-sm text-paper-mute">{r.summary}</p>
                  <p className="mt-3 font-mono text-xs text-paper-mute">
                    {r.standing.kind} · {r.standing.lifecycle} ·{" "}
                    {r.standing.evidence}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      </section>

      {/* Anthony */}
      <Section>
        <Eyebrow>Anthony</Eyebrow>
        <div className="mt-6 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="overflow-hidden rounded-xl border border-border">
            <img
              src={about.portrait}
              alt={`${about.name} at work`}
              className="aspect-[4/5] w-full object-cover object-top"
              loading="lazy"
              width={1125}
              height={1500}
            />
          </div>
          <div>
            <h2 className="font-serif text-3xl text-ivory sm:text-4xl">
              {about.name}
            </h2>
            <p className="mt-2 text-sm text-muted">{about.role}</p>
            <blockquote className="mt-8 border-l border-wonder/50 pl-5 font-serif text-xl leading-relaxed text-fg-soft sm:text-2xl">
              {about.voice}
            </blockquote>
            <p className="mt-6 font-serif text-lg italic text-wonder-soft">
              {about.faithLine}
            </p>
            <Link
              to="/about"
              className="mt-6 inline-block font-sans text-sm text-wonder no-underline hover:text-wonder-glow"
            >
              Full story →
            </Link>
          </div>
        </div>
      </Section>

      {/* Invitation */}
      <Section className="pb-12">
        <Eyebrow tone="wonder">Invitation</Eyebrow>
        <h2 className="mt-3 max-w-2xl font-serif text-3xl text-ivory sm:text-4xl">
          Bring a question, a correction, an instrument, or a pair of hands.
        </h2>
        <p className="mt-4 max-w-xl text-muted">
          The computational side has outrun the experimental side — what we need
          is a centrifuge, not another GPU.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/about"
            hash="collaborate"
            className="inline-flex h-11 items-center rounded-md bg-ivory px-5 font-sans text-sm font-medium text-void no-underline hover:opacity-90"
          >
            Collaborate
          </Link>
          <Link
            to="/co-creation"
            className="inline-flex h-11 items-center rounded-md border border-border-strong px-5 font-sans text-sm text-fg-soft no-underline hover:border-rigor hover:text-ivory"
          >
            Join the case study
          </Link>
        </div>
      </Section>

      {/* Memorial */}
      <section className="border-t border-border bg-void">
        <Section narrow>
          <Eyebrow>{memorial.eyebrow}</Eyebrow>
          <div className="mx-auto mt-6 w-full max-w-md overflow-hidden rounded-xl border border-border">
            <img
              src={memorial.image}
              alt={memorial.imageAlt}
              className="aspect-[4/5] w-full object-cover object-center"
              loading="lazy"
              width={820}
              height={1024}
            />
          </div>
          <h2 className="mt-6 font-serif text-3xl text-ivory sm:text-4xl">
            {memorial.name}
          </h2>
          <p className="mt-2 font-mono text-xs text-muted">{memorial.dates}</p>
          <blockquote className="mt-8">
            <p className="font-serif text-lg italic leading-relaxed text-fg-soft">
              {memorial.verseEn}
            </p>
            <cite className="mt-2 block font-mono text-xs not-italic text-muted">
              {memorial.verseEnCite}
            </cite>
          </blockquote>
          <blockquote className="mt-5">
            <p className="font-serif text-base italic text-muted">
              {memorial.verseEs}
            </p>
            <cite className="mt-2 block font-mono text-xs not-italic text-muted">
              {memorial.verseEsCite}
            </cite>
          </blockquote>
          <p className="mt-8 text-sm leading-relaxed text-fg-soft">
            {memorial.dedication}
          </p>
        </Section>
      </section>
    </div>
  );
}
