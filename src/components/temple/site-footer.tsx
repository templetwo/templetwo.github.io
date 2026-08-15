import { Link } from "@tanstack/react-router";
import { site, nav } from "@/data/content";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-void">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <img
            src="/images/logo-temple-of-two.webp"
            alt="Seal of the Temple of Two — diamond, infinity, waves, sword, and spiral, ringed in binary and circuitry"
            width={512}
            height={506}
            loading="lazy"
            decoding="async"
            className="h-20 w-20 rounded-full border border-border/60 object-cover sm:h-24 sm:w-24"
          />
          <p className="mt-4 font-serif text-2xl text-ivory">Temple of Two</p>
          <p className="mt-2 font-serif text-lg italic text-wonder-soft">
            {site.tagline}.
          </p>
          <p className="mt-4 max-w-sm text-sm text-muted">
            Wonder may ask beyond the evidence. Rigor governs what may be
            claimed. An ongoing case study in governed co-creation.
          </p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
            Navigate
          </p>
          <ul className="mt-3 space-y-2">
            {nav.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-sm text-fg-soft no-underline hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wonder"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
            Verify
          </p>
          <ul className="mt-3 space-y-2 text-sm text-fg-soft">
            <li>
              <a
                href={site.githubProfile}
                target="_blank"
                rel="noreferrer"
                className="no-underline hover:text-ivory"
              >
                GitHub · templetwo
              </a>
            </li>
            <li>
              <a
                href={site.stackChronicle}
                target="_blank"
                rel="noreferrer"
                className="no-underline hover:text-ivory"
              >
                Chronicle mirror
              </a>
            </li>
            <li>
              <a
                href={site.retrospective}
                target="_blank"
                rel="noreferrer"
                className="no-underline hover:text-ivory"
              >
                Retrospective audit
              </a>
            </li>
            <li>
              <a
                href={site.orcidUrl}
                target="_blank"
                rel="noreferrer"
                className="no-underline hover:text-ivory"
              >
                ORCID · {site.orcid}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${site.email}`}
                className="no-underline hover:text-ivory"
              >
                {site.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © 2026 Temple of Two — {site.founder}. Papers CC BY 4.0 · site &
            chronicle dual-licensed.
          </p>
          <p className="font-mono tracking-wide">
            Wonder opens · Rigor governs
          </p>
        </div>
        <div className="mx-auto max-w-6xl space-y-2 px-4 pb-6 text-xs text-muted sm:px-6">
          <p>
            Colophon: human direction by {site.founder}; machine seats as
            instruments under approval membranes — never sole authors of claims
            that enter the record. No single vendor brands the Temple. This
            redesign is itself part of the governed co-creation case study.
          </p>
        </div>
      </div>
    </footer>
  );
}
