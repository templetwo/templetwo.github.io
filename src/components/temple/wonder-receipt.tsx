import type { Instrument } from "@/data/content";
import { StandingTriple } from "./standing-badge";

const steps = [
  { key: "wonder", label: "Wonder" },
  { key: "hypothesis", label: "Hypothesis" },
  { key: "instrument", label: "Instrument" },
  { key: "encounter", label: "Encounter" },
  { key: "standing", label: "Standing" },
  { key: "receipt", label: "Receipt" },
] as const;

/**
 * `headingLevel` exists so the panel does not skip a level. On an instrument
 * detail page it sits directly under the page `h1` and must be an `h2`; on the
 * Instruments index it sits under the section `h2` and stays an `h3`.
 */
export function WonderReceiptPanel({
  instrument,
  headingLevel = 3,
}: {
  instrument: Instrument;
  headingLevel?: 2 | 3;
}) {
  const arc = instrument.wonderToReceipt;
  if (!arc) return null;
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="border-b border-border bg-surface-warm/60 px-6 py-5 sm:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-wonder-soft">
          From wonder to receipt
        </p>
        <Heading className="mt-2 font-serif text-2xl text-ivory sm:text-3xl">
          {instrument.name}
        </Heading>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Wonder initiated the search. Rigor changed the answer.
        </p>
        <div className="mt-4">
          <StandingTriple standing={instrument.standing} />
        </div>
      </div>
      <ol className="divide-y divide-border">
        {steps.map((step, i) => (
          <li
            key={step.key}
            className="grid gap-2 px-6 py-5 sm:grid-cols-[8rem_1fr] sm:gap-6 sm:px-8"
          >
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xs text-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={
                  step.key === "wonder"
                    ? "font-serif text-wonder"
                    : step.key === "receipt"
                      ? "font-mono text-xs uppercase tracking-wide text-rigor-bright"
                      : "font-sans text-sm text-muted"
                }
              >
                {step.label}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-fg-soft sm:text-base">
              {arc[step.key]}
            </p>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-3 border-t border-border px-6 py-4 sm:px-8">
        {instrument.verify.map((v) => (
          <a
            key={v.href}
            href={v.href}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs text-rigor-bright no-underline hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rigor"
          >
            {v.label} ↗
          </a>
        ))}
      </div>
    </article>
  );
}
