import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, Eyebrow } from "@/components/temple/section";
import { ContactForm } from "@/components/temple/contact-form";
import {
  about,
  memorial,
  collaborationNeeds,
  site,
  principles,
} from "@/data/content";
import { pageMeta, jsonLd, pageGraph } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    ...pageMeta({
      title: `About — ${site.name}`,
      description: `${about.name} — the independent researcher behind Temple of Two: ethos, open questions, and how to collaborate.`,
      path: "/about",
      image: "/images/og-about.jpg",
      imageAlt: about.name,
    }),
    scripts: [
      jsonLd(
        pageGraph({
          type: "AboutPage",
          path: "/about",
          name: `About — ${site.name}`,
          description: `${about.name} — independent researcher behind Temple of Two.`,
        }),
      ),
    ],
  }),
});

function AboutPage() {
  return (
    <div>
      <PageHero
        eyebrow="About"
        title={about.name}
        lead={about.role}
        tone="wonder"
      />

      <Section className="pt-0">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="overflow-hidden rounded-xl border border-border">
            <img
              src={about.portrait}
              alt={`${about.name} at the console`}
              className="aspect-[4/5] w-full object-cover object-top"
              loading="eager"
              width={1125}
              height={1500}
            />
          </div>
          <div>
            <blockquote className="border-l border-wonder/50 pl-5 font-serif text-2xl leading-relaxed text-fg-soft sm:text-3xl">
              {about.voice}
            </blockquote>
            <p className="mt-8 font-serif text-xl italic text-wonder-soft">
              {about.faithLine}
            </p>
            <div className="prose-temple mt-10 space-y-4 text-base text-muted">
              {about.body.split("\n\n").map((para) => (
                <p key={para.slice(0, 40)}>{para}</p>
              ))}
            </div>
          </div>
        </div>
        <dl className="mt-10 grid gap-4 sm:grid-cols-2">
          {[
            ["Affiliation", about.affiliation],
            ["Focus", about.focus],
            ["ORCID", site.orcid],
            ["Contact", site.email],
          ].map(([k, v]) => (
            <div
              key={k}
              className="rounded-lg border border-border bg-surface px-4 py-3"
            >
              <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                {k}
              </dt>
              <dd className="mt-1 text-sm text-fg-soft">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <a
            href={site.githubProfile}
            target="_blank"
            rel="noreferrer"
            className="text-rigor-bright no-underline hover:text-ivory"
          >
            GitHub · templetwo ↗
          </a>
          <a
            href={site.orcidUrl}
            target="_blank"
            rel="noreferrer"
            className="text-rigor-bright no-underline hover:text-ivory"
          >
            ORCID ↗
          </a>
          <Link
            to="/co-creation"
            className="text-wonder no-underline hover:text-wonder-glow"
          >
            Case study →
          </Link>
        </div>
      </Section>

      <Section>
        <Eyebrow>Why Temple of Two?</Eyebrow>
        <div className="mt-6 max-w-3xl space-y-5 text-fg-soft">
          <p>
            The name began with two substrates: biological and computational. We
            were asking whether living cells and artificial systems might share
            a grammar of threshold and commitment.
          </p>
          <p>
            The work widened. “Two” now also names the pairs we refuse to
            collapse: wonder and rigor, faith and evidence, continuity and
            discontinuity, human and machine, experience and measurement.
          </p>
          <p className="font-serif text-xl text-ivory">
            The Temple is not a claim that these are identical. It is the place
            built to let them meet without either being erased.
          </p>
        </div>
      </Section>

      <Section>
        <Eyebrow>Ethos</Eyebrow>
        <h2 className="mt-3 font-serif text-3xl text-ivory">
          Rigor is how we honor the questions
        </h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {principles.map((p) => (
            <li
              key={p.title}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <h3 className="font-serif text-lg text-ivory">{p.title}</h3>
              <p className="mt-2 text-sm text-muted">{p.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="collaborate">
        <Eyebrow tone="wonder">Collaborate</Eyebrow>
        <h2 className="mt-3 font-serif text-3xl text-ivory">
          This work needs hands, not just models
        </h2>
        <ul className="mt-6 flex flex-wrap gap-2">
          {collaborationNeeds.map((n) => (
            <li
              key={n}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-fg-soft"
            >
              {n}
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <ContactForm />
        </div>
      </Section>

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
          <h2 className="mt-6 font-serif text-3xl text-ivory">
            {memorial.name}
          </h2>
          <p className="mt-2 font-mono text-xs text-muted">{memorial.dates}</p>
          <blockquote className="mt-8">
            <p className="font-serif text-lg italic text-fg-soft">
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
          <p className="mt-8 text-sm text-fg-soft">{memorial.dedication}</p>
        </Section>
      </section>
    </div>
  );
}
