import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Section, Eyebrow } from "@/components/temple/section";
import { StandingTriple } from "@/components/temple/standing-badge";
import { WonderReceiptPanel } from "@/components/temple/wonder-receipt";
import { getInstrument, site } from "@/data/content";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/instruments/$slug")({
  component: InstrumentDetailPage,
  loader: ({ params }) => {
    const inst = getInstrument(params.slug);
    if (!inst) throw notFound();
    return { inst };
  },
  head: ({ loaderData }) => {
    const inst = loaderData?.inst;
    return pageMeta({
      title: inst ? `${inst.name} — ${site.name}` : `Instrument — ${site.name}`,
      description: inst?.oneLiner ?? "An instrument of the Temple of Two.",
      path: inst ? `/instruments/${inst.slug}` : "/instruments",
      image: inst?.ogImage,
      imageAlt: inst?.image?.alt,
      type: "article",
    });
  },
});

function InstrumentDetailPage() {
  const { inst } = Route.useLoaderData();

  return (
    <div>
      <Section className="pb-8 pt-14 sm:pt-20">
        <Link
          to="/instruments"
          className="font-mono text-xs text-muted no-underline hover:text-ivory"
        >
          ← Instruments
        </Link>
        <div className="mt-6">
          <Eyebrow tone="rigor">{inst.standing.kind}</Eyebrow>
        </div>
        <h1 className="mt-3 font-serif text-4xl text-ivory sm:text-5xl">
          {inst.name}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-fg-soft">{inst.oneLiner}</p>
        <div className="mt-5">
          <StandingTriple standing={inst.standing} />
        </div>
        {inst.signal && (
          <p className="mt-4 font-mono text-xs text-muted">{inst.signal}</p>
        )}
      </Section>

      {inst.image && (
        <Section className="pt-0 pb-4">
          <div className="overflow-hidden rounded-xl border border-border">
            <img
              src={inst.image.src}
              alt={inst.image.alt}
              className="max-h-[28rem] w-full object-contain bg-void"
              loading="eager"
              width={inst.image.width}
              height={inst.image.height}
            />
          </div>
        </Section>
      )}

      <Section className="pt-0">
        <article className="rounded-xl border border-border bg-surface">
          <dl className="divide-y divide-border">
            {(
              [
                ["The question", inst.question],
                ["The instrument", inst.instrument],
                ["The finding", inst.finding],
                ["What failed", inst.failed],
              ] as const
            ).map(([label, body]) => (
              <div
                key={label}
                className="grid gap-2 px-6 py-5 sm:grid-cols-[10rem_1fr] sm:gap-6 sm:px-8"
              >
                <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                  {label}
                </dt>
                <dd className="text-sm leading-relaxed text-fg-soft sm:text-base">
                  {body}
                </dd>
              </div>
            ))}
            <div className="grid gap-2 px-6 py-5 sm:grid-cols-[10rem_1fr] sm:gap-6 sm:px-8">
              <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                Standing
              </dt>
              <dd>
                <StandingTriple standing={inst.standing} />
              </dd>
            </div>
            <div className="grid gap-2 px-6 py-5 sm:grid-cols-[10rem_1fr] sm:gap-6 sm:px-8">
              <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                Verify it
              </dt>
              <dd className="flex flex-wrap gap-4">
                {inst.verify.map((v) => (
                  <a
                    key={v.href}
                    href={v.href}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-rigor-bright no-underline hover:text-ivory"
                  >
                    {v.label} ↗
                  </a>
                ))}
              </dd>
            </div>
          </dl>
        </article>
      </Section>

      {inst.metrics.length > 0 && (
        <Section>
          <Eyebrow tone="rigor">Metrics with scope</Eyebrow>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Every number names what was measured, on what sample, and as of
            when.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {inst.metrics.map((m) => (
              <li
                key={m.label}
                className="rounded-xl border border-border bg-surface p-5"
              >
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                  {m.label}
                </p>
                <p className="mt-2 font-serif text-2xl text-ivory">{m.value}</p>
                <p className="mt-2 text-sm text-fg-soft">{m.scope}</p>
                <p className="mt-3 font-mono text-xs text-muted">
                  As of {m.asOf}
                  {m.source ? (
                    <>
                      {" · "}
                      <a
                        href={m.source}
                        target="_blank"
                        rel="noreferrer"
                        className="text-rigor-bright no-underline hover:text-ivory"
                      >
                        source
                      </a>
                    </>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {inst.wonderToReceipt && (
        <Section>
          {/* Sits directly under the page h1 — must not skip to h3. */}
          <WonderReceiptPanel instrument={inst} headingLevel={2} />
        </Section>
      )}
    </div>
  );
}
