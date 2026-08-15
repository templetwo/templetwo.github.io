import { useEffect, useState } from "react";

/**
 * The living seal — the animated sigil at the meeting point of the two
 * fields. Nothing renders outside the circular bezel; the bezel itself
 * runs wonder→rigor (amber left, steel right), carrying the same meaning
 * as the two gradient lines and ivory dot it replaced. Motion respects
 * prefers-reduced-motion the same way HeroBackdrop does: still frame
 * first (it stays the poster, so the video is never the LCP), video only
 * after the visitor's preference is confirmed.
 */
export function HeroSeal() {
  const [motion, setMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotion(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <figure className="mx-auto mt-14 flex flex-col items-center sm:mt-20">
      <div className="seal-disc relative aspect-square w-[min(22rem,78vw)] shrink-0 sm:w-[24rem] md:w-[28rem]">
        <div className="seal-bezel absolute inset-0 rounded-full p-[3px]">
          <div className="relative h-full w-full overflow-hidden rounded-full bg-void">
            {motion ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="/images/infinite-seal.jpg"
                className="h-full w-full scale-[1.04] object-cover"
                aria-hidden
              >
                <source src="/videos/infinite-seal-loop.mp4" type="video/mp4" />
              </video>
            ) : (
              <img
                src="/images/infinite-seal.jpg"
                alt="Seal of the Temple of Two — diamond, infinity, waves, sword, and spiral, ringed in binary and circuitry"
                width={720}
                height={720}
                decoding="async"
                className="h-full w-full scale-[1.04] object-cover"
              />
            )}
          </div>
        </div>
      </div>
      <figcaption className="mt-6 text-center font-mono text-xs uppercase tracking-[0.16em] text-muted">
        Two fields approach · neither is erased
      </figcaption>
    </figure>
  );
}
