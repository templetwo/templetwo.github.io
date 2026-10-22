/**
 * The seal — the sigil at the meeting point of the two fields. Nothing
 * renders outside the circular bezel; the bezel itself runs wonder→rigor
 * (amber left, steel right), carrying the same meaning as the two gradient
 * lines and ivory dot it replaced.
 *
 * It is the still artwork at every width. The shimmer loop it used to swap
 * in after hydration (1.77 MB of video for a static drawing) depended on the
 * visitor's GPU and autoplay: a headless desktop capture of the live site
 * showed an empty ring where a <video> with a poster had mounted and painted
 * nothing, while the still rendered. An <img> renders everywhere.
 */
export function HeroSeal() {
  return (
    <figure className="mx-auto mt-14 flex flex-col items-center sm:mt-20">
      <div className="seal-disc relative aspect-square w-[min(22rem,78vw)] shrink-0 sm:w-[24rem] md:w-[28rem]">
        <div className="seal-bezel absolute inset-0 rounded-full p-[3px]">
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
      <figcaption className="mt-6 text-center font-mono text-xs uppercase tracking-[0.16em] text-muted">
        Two fields approach · neither is erased
      </figcaption>
    </figure>
  );
}
