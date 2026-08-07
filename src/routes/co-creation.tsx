import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, Eyebrow } from "@/components/temple/section";
import { ContactForm } from "@/components/temple/contact-form";
import { cocreation } from "@/data/cocreation";
import { site } from "@/data/content";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/co-creation")({
  component: CoCreationPage,
  head: () =>
    pageMeta({
      title: `Case study — ${site.name}`,
      description: cocreation.lede,
      path: "/co-creation",
      image: "/images/og-co-creation.jpg",
      imageAlt: "Two fields meeting at a threshold",
    }),
});

function CoCreationPage() {
  return (
    <div>
      <PageHero
        eyebrow="Case study"
        title={cocreation.title}
        lead={cocreation.lede}
        tone="wonder"
      />

      <Section className="pt-0">
        <div className="overflow-hidden rounded-xl border border-border">
          <img
            src="/images/temple-duality.webp"
            alt="Two fields meeting at a threshold — the visual register of the Temple"
            className="max-h-[28rem] w-full object-cover"
            loading="eager"
            width={784}
            height={1168}
          />
        </div>
      </Section>

      <Section>
        <Eyebrow tone="rigor">What is under study</Eyebrow>
        <div className="mt-6 max-w-3xl space-y-5 text-fg-soft">
          {cocreation.thesis.map((p) => (
            <p key={p.slice(0, 48)} className="text-base leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </Section>

      <Section className="pt-4">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-6">
            <Eyebrow>What it is not</Eyebrow>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              {cocreation.whatItIsNot.map((x) => (
                <li
                  key={x}
                  className="border-b border-border/60 pb-3 last:border-0"
                >
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-surface p-6">
            <Eyebrow tone="wonder">What it is</Eyebrow>
            <ul className="mt-4 space-y-3 text-sm text-fg-soft">
              {cocreation.whatItIs.map((x) => (
                <li
                  key={x}
                  className="border-b border-border/60 pb-3 last:border-0"
                >
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section>
        <Eyebrow tone="rigor">Four seats</Eyebrow>
        <h2 className="mt-3 font-serif text-3xl text-ivory">
          Governance of the collaboration itself
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {cocreation.seats.map((s) => (
            <li
              key={s.seat}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-wonder-soft">
                {s.seat}
              </p>
              <p className="mt-2 text-sm text-fg-soft">{s.role}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-xl border border-border bg-wonder-field p-6 sm:p-8">
            <Eyebrow tone="wonder">{cocreation.pivot.title}</Eyebrow>
            <p className="mt-4 text-sm leading-relaxed text-fg-soft">
              {cocreation.pivot.body}
            </p>
            <a
              href={cocreation.pivot.href}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-block font-mono text-xs text-wonder no-underline hover:text-wonder-glow"
            >
              templetwo-retrospective ↗
            </a>
          </article>
          <article className="rounded-xl border border-border bg-rigor-field p-6 sm:p-8">
            <Eyebrow tone="rigor">{cocreation.letter.title}</Eyebrow>
            <p className="mt-4 text-sm leading-relaxed text-fg-soft">
              {cocreation.letter.body}
            </p>
            <a
              href={cocreation.letter.href}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-block font-mono text-xs text-rigor-bright no-underline hover:text-ivory"
            >
              Open letter · sovereign-stack-chronicle ↗
            </a>
          </article>
        </div>
      </Section>

      <Section>
        <Eyebrow>Primary public artifacts</Eyebrow>
        <h2 className="mt-3 font-serif text-3xl text-ivory">
          From github.com/templetwo
        </h2>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {cocreation.repos.map((r) => (
            <li key={r.name}>
              <a
                href={r.href}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl border border-border bg-surface p-5 no-underline transition-colors hover:border-border-strong"
              >
                <p className="font-mono text-sm text-rigor-bright">{r.name}</p>
                <p className="mt-2 text-sm text-muted">{r.blurb}</p>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted">
          Full org:{" "}
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer"
            className="text-rigor-bright no-underline hover:text-ivory"
          >
            github.com/templetwo
          </a>
          {" · "}
          ~80 public repositories · papers CC BY 4.0
        </p>
      </Section>

      <Section>
        <Eyebrow tone="wonder">Enter the work</Eyebrow>
        <p className="mt-3 max-w-2xl font-serif text-2xl text-ivory">
          Bring a correction, an instrument, a wet-lab seat, or a question about
          governed co-creation.
        </p>
        <div className="mt-8">
          <ContactForm />
        </div>
        <Link
          to="/instruments"
          className="mt-8 inline-block font-sans text-sm text-rigor-bright no-underline hover:text-ivory"
        >
          Or begin with the instruments →
        </Link>
      </Section>
    </div>
  );
}
