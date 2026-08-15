import { useEffect, useState } from "react";

/**
 * The threshold behind the hero copy. Motion by default, still frame when the
 * visitor has asked for reduced motion — `<video autoplay>` ignores the
 * prefers-reduced-motion block in styles.css, so the gate has to be explicit.
 */
export function HeroBackdrop() {
  // Start still. Correct for the first paint, and it keeps the 52 KB poster as
  // the LCP element rather than putting 2.7 MB of video in front of it.
  const [motion, setMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotion(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
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
    </div>
  );
}
