import { useEffect, useState } from "react";

/**
 * The threshold behind the hero copy. Motion by default, still frame when the
 * visitor has asked for reduced motion — `<video autoplay>` ignores the
 * prefers-reduced-motion block in styles.css, so the gate has to be explicit.
 *
 * The loop runs 20 s with no end, so WCAG 2.2.2 asks for a control on the
 * page as well: a "Pause motion" toggle (aria-pressed while paused). The
 * visitor's choice is kept in localStorage and wins over the OS default in
 * both directions; where storage is unavailable it lasts the visit.
 */
const STORAGE_KEY = "temple:motion";
type Choice = "play" | "pause" | null;

function readChoice(): Choice {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "play" || v === "pause" ? v : null;
  } catch {
    return null;
  }
}

function writeChoice(choice: Choice) {
  try {
    if (choice) window.localStorage.setItem(STORAGE_KEY, choice);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private mode or blocked storage: the choice lasts the visit */
  }
}

export function HeroBackdrop() {
  // Start still. Correct for the first paint, and it keeps the 52 KB poster as
  // the LCP element rather than putting 2.7 MB of video in front of it.
  // `null` means the OS preference has not been read yet (server and first
  // client render), so hydration sees the same still the server sent.
  const [osReduced, setOsReduced] = useState<boolean | null>(null);
  const [choice, setChoice] = useState<Choice>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setOsReduced(mq.matches);
    sync();
    setChoice(readChoice());
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const motion =
    osReduced === null
      ? false
      : choice === "play"
        ? true
        : choice === "pause"
          ? false
          : !osReduced;

  const toggle = () => {
    const next: Choice = motion ? "pause" : "play";
    setChoice(next);
    writeChoice(next);
  };

  return (
    <>
      <div className="pointer-events-none absolute inset-0">
        {motion ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/images/hero-temple-gate-still.webp"
            className="h-full w-full object-cover opacity-60"
            aria-hidden
          >
            <source src="/videos/hero-temple-gate-loop.mp4" type="video/mp4" />
          </video>
        ) : (
          <img
            src="/images/hero-temple-gate-still.webp"
            alt=""
            width={1168}
            height={784}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover opacity-60"
            aria-hidden
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-bg/60 to-bg" />
        <div className="absolute inset-0 field-lines opacity-30" />
        <div className="threshold-wash absolute inset-0 opacity-60" aria-hidden />
      </div>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={!motion}
        className="absolute bottom-4 right-4 z-10 inline-flex h-8 items-center rounded-md border border-border-strong bg-bg/70 px-3 font-sans text-xs text-fg-soft backdrop-blur transition-colors hover:border-rigor hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rigor aria-pressed:bg-surface aria-pressed:text-muted"
      >
        Pause motion
      </button>
    </>
  );
}
