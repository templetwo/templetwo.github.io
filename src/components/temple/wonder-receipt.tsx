import { useState } from "react";
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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const arc = instrument.wonderToReceipt;
  if (!arc) return null;
  const Heading = headingLevel === 2 ? "h2" : "h3";

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    // The ✓ is a receipt: it renders only after the clipboard write resolves.
    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
      },
      () => {
        setCopiedKey(`failed:${key}`);
        setTimeout(() => setCopiedKey(null), 2000);
      },
    );
  };

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
            <div className="flex flex-col gap-2">
              <p className="text-sm leading-relaxed text-fg-soft sm:text-base">
                {arc[step.key]}
              </p>
              {step.key === "receipt" && (
                <div className="mt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(arc.receipt, `receipt-${instrument.id}`)}
                    className="inline-flex items-center gap-1.5 rounded border border-border px-2.5 py-1 font-mono text-[11px] text-muted transition-colors hover:border-rigor hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-rigor"
                  >
                    <span>
                      {copiedKey === `receipt-${instrument.id}`
                        ? "Copied receipt ✓"
                        : copiedKey === `failed:receipt-${instrument.id}`
                          ? "Copy failed — select & copy manually"
                          : "Copy receipt text"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-3 border-t border-border px-6 py-4 sm:px-8">
        {instrument.verify.map((v) => (
          <div key={v.href} className="inline-flex items-center gap-1.5">
            <a
              href={v.href}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs text-rigor-bright no-underline hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rigor"
            >
              {v.label} ↗
            </a>
            <button
              type="button"
              aria-label={`Copy link for ${v.label}`}
              onClick={() => handleCopy(v.href, v.href)}
              className="rounded px-1.5 py-0.5 font-mono text-[10px] text-muted transition-colors hover:bg-surface-raised hover:text-ivory"
            >
              {copiedKey === v.href
                ? "Copied ✓"
                : copiedKey === `failed:${v.href}`
                  ? "failed"
                  : "copy"}
            </button>
          </div>
        ))}
      </div>
    </article>
  );
}
