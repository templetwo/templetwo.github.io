import { cn } from "@/lib/utils";
import { type StandingAxes, evidenceTone } from "@/data/content";

const toneClass = {
  living: "border-living/45 text-living bg-living/10",
  active: "border-rigor/45 text-rigor-bright bg-rigor/10",
  uncertain: "border-uncertain/45 text-uncertain bg-uncertain/10",
  bounded: "border-bounded/45 text-bounded bg-bounded/10",
  witness: "border-witness/45 text-witness bg-witness/10",
  neutral: "border-border-strong text-muted bg-surface",
} as const;

export function StandingTriple({
  standing,
  className,
}: {
  standing: StandingAxes;
  className?: string;
}) {
  const tone = evidenceTone(standing.evidence);
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.75rem] leading-snug tracking-wide text-muted",
        className,
      )}
    >
      <span className="text-fg-soft">{standing.kind}</span>
      <span className="text-border-strong" aria-hidden>
        ·
      </span>
      <span>{standing.lifecycle}</span>
      <span className="text-border-strong" aria-hidden>
        ·
      </span>
      <span
        className={cn(
          "rounded-full border px-2 py-0.5 text-[0.6875rem] uppercase tracking-wide",
          toneClass[tone],
        )}
      >
        {standing.evidence}
      </span>
    </div>
  );
}
