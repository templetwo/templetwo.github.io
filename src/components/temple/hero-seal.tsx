/**
 * The seal — the sigil at the meeting point of the two fields. Nothing
 * renders outside the circular bezel; the bezel itself runs wonder→rigor
 * (amber left, steel right), carrying the same meaning as the two gradient
 * lines and ivory dot it replaced.
 *
 * It is the still artwork at every width. The shimmer loop it used to swap
 * in after hydration (1.77 MB of video for a static drawing) depended on the
 * visitor's GPU and autoplay, which is consistent with a headless desktop
 * capture of the live site: an empty ring where a <video> with a poster had
 * mounted and painted nothing, while the still rendered. An <img> renders
 * everywhere.
 *
 * Behind it, a slow breath of light (`.seal-breath` in styles.css): a soft
 * ivory-amber-steel glow that rises and falls over seven seconds. Transform
 * and opacity only, visible at rest, still under reduced motion, and held
 * by the hero's "Pause motion" control.
 */
export function HeroSeal() {
  return (
    <figure className="mx-auto mt-14 flex flex-col items-center sm:mt-20">
      <div className="relative aspect-square w-[min(22rem,78vw)] shrink-0 sm:w-[24rem] md:w-[28rem]">
        <div className="seal-breath" aria-hidden />
        <div className="seal-disc seal-bezel absolute inset-0 rounded-full p-[3px]">
          <div className="relative h-full w-full overflow-hidden rounded-full bg-void">
            <img
              src="/images/infinite-seal.jpg"
              alt="Seal of the Temple of Two — diamond, infinity, waves, sword, and spiral, ringed in binary and circuitry"
              width={720}
              height={720}
              decoding="async"
              className="h-full w-full scale-[1.04] object-cover"
            />
          </div>
        </div>
      </div>
      <figcaption className="mt-6 text-center font-serif text-xl italic text-muted">
        Two fields approach · neither is erased
      </figcaption>
    </figure>
  );
}
