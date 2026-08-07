import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Section({
  id,
  children,
  className,
  narrow,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  narrow?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "mx-auto w-full px-4 py-16 sm:px-6 sm:py-20 md:py-24",
        narrow ? "max-w-3xl" : "max-w-6xl",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Eyebrow({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "wonder" | "rigor" | "neutral";
}) {
  return (
    <p
      className={cn(
        "font-mono text-xs uppercase tracking-[0.16em]",
        tone === "wonder" && "text-wonder-soft",
        tone === "rigor" && "text-rigor",
        tone === "neutral" && "text-muted",
      )}
    >
      {children}
    </p>
  );
}

export function PageHero({
  eyebrow,
  title,
  lead,
  tone = "neutral",
}: {
  eyebrow: string;
  title: string;
  lead: string;
  tone?: "wonder" | "rigor" | "neutral";
}) {
  return (
    <Section className="pb-8 pt-14 sm:pb-10 sm:pt-20">
      <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.12] text-ivory sm:text-5xl md:text-[3.25rem]">
        {title}
      </h1>
      <p className="prose-temple mt-5 text-lg text-fg-soft sm:text-xl">{lead}</p>
    </Section>
  );
}
