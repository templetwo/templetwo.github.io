import { useEffect, useRef, useState, type FormEvent } from "react";
import { site, collaborationNeeds } from "@/data/content";

/**
 * Contact posts to the Cloudflare Worker in `contact-worker/` — the same
 * endpoint the previous static site used, with Turnstile, a honeypot, and
 * rate limiting already in place.
 *
 * The earlier server function wrote messages to `data/contact-messages.jsonl`
 * on the server's disk, which is ephemeral on any modern host and unreachable
 * on GitHub Pages. The form also keeps a real `action`, so with JS disabled it
 * performs a normal POST and the Worker renders its own confirmation page.
 */

type Status = "idle" | "sending" | "ok" | "error";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      getResponse: (id?: string) => string | undefined;
      reset: (id?: string) => void;
      remove?: (id: string) => void;
    };
    __t2Turnstile?: () => void;
  }
}

/**
 * The codes are the ones `contact-worker/src/worker.js` actually returns:
 * bad_request, challenge_failed, forbidden_origin, invalid_input,
 * method_not_allowed, not_configured, rate_limited, send_failed, too_large.
 * Anything unmapped falls through to the email address, which always works.
 */
function messageFor(code: string | undefined): string {
  if (code === "rate_limited")
    return "Too many messages just now — please try again in a few minutes.";
  if (code === "challenge_failed") return "Spam check failed — please retry.";
  if (code === "invalid_input") return "Please check your name, email, and message.";
  if (code === "too_large")
    return "That message is too long — please trim it, or send it by email.";
  if (code === "not_configured" || code === "send_failed")
    return `The message service is not accepting mail right now — please email ${site.email} directly.`;
  return `Could not send — please email ${site.email} directly.`;
}

export function ContactForm({ compact }: { compact?: boolean }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  const hasChallenge = site.turnstileSiteKey.trim().length > 0;

  useEffect(() => {
    if (!hasChallenge || !slotRef.current) return;

    const render = () => {
      if (!slotRef.current || !window.turnstile) return;
      if (widgetId.current !== null) return;
      widgetId.current = window.turnstile.render(slotRef.current, {
        sitekey: site.turnstileSiteKey,
        theme: "dark",
      });
    };

    // The API script loads once per document. On every mount after the first
    // — /about → /co-creation, both of which render this form — `onload` will
    // never fire again, so render straight away. Returning early because
    // `window.turnstile` exists (the previous behaviour) left the widget
    // unrendered and every submit blocked on "complete the spam check".
    if (window.turnstile) {
      render();
    } else {
      window.__t2Turnstile = render;
      if (!document.querySelector("script[data-t2-turnstile]")) {
        const s = document.createElement("script");
        s.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__t2Turnstile";
        s.async = true;
        s.defer = true;
        s.dataset.t2Turnstile = "true";
        document.head.appendChild(s);
      }
    }

    return () => {
      const id = widgetId.current;
      widgetId.current = null;
      if (id !== null) window.turnstile?.remove?.(id);
    };
  }, [hasChallenge]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot tripped: behave like success, send nothing.
    if (String(data.get("company") || "").trim() !== "") {
      setStatus("ok");
      form.reset();
      return;
    }

    const payload: Record<string, string> = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      topic: String(data.get("topic") || "").trim(),
      message: String(data.get("message") || "").trim(),
    };

    if (hasChallenge && window.turnstile) {
      const token = window.turnstile.getResponse(widgetId.current ?? undefined) || "";
      if (!token) {
        setStatus("error");
        setError("Please complete the spam check below.");
        return;
      }
      payload["cf-turnstile-response"] = token;
    }

    setStatus("sending");
    setError(null);

    try {
      const res = await fetch(site.contactEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const out = await res.json().catch(() => ({ ok: res.ok }));
      if (out?.ok) {
        setStatus("ok");
        form.reset();
      } else {
        setStatus("error");
        setError(messageFor(out?.error));
      }
    } catch {
      setStatus("error");
      setError(
        `Could not reach the relay. Email ${site.email} directly — the work still wants hands.`,
      );
    } finally {
      if (hasChallenge && window.turnstile && widgetId.current) {
        window.turnstile.reset(widgetId.current);
      }
    }
  }

  if (status === "ok") {
    return (
      <div
        className="rounded-xl border border-living/40 bg-living/10 p-6 sm:p-8"
        role="status"
      >
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-living">
          Received
        </p>
        <p className="mt-3 font-serif text-xl text-ivory">
          Your message reached the relay.
        </p>
        <p className="mt-3 text-sm text-muted">
          If you need a guaranteed human reply path, also write{" "}
          <a
            href={`mailto:${site.email}`}
            className="text-wonder no-underline hover:text-wonder-glow"
          >
            {site.email}
          </a>
          .
        </p>
        <button
          type="button"
          className="mt-6 rounded-md border border-border px-4 py-2 text-sm text-fg-soft hover:text-ivory"
          onClick={() => setStatus("idle")}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      action={site.contactEndpoint}
      method="post"
      className="space-y-5 rounded-xl border border-border bg-surface p-6 sm:p-8"
    >
      {!compact && (
        <p className="text-sm text-muted">
          Collaboration, scientific critique, engineering, wet-lab, or
          philosophical correspondence.
        </p>
      )}
      {/*
        With JS disabled the form still POSTs natively, but the Turnstile
        widget never renders — so once a sitekey is set, that POST carries no
        `cf-turnstile-response` and the Worker rejects it. Give the no-JS
        reader a route that works instead of a silent failure.
      */}
      {hasChallenge && (
        <noscript>
          <p className="text-sm text-wonder-soft">
            This form needs JavaScript for its spam check. Without it, email{" "}
            <a href={`mailto:${site.email}`} className="underline">
              {site.email}
            </a>{" "}
            directly.
          </p>
        </noscript>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
            Name
          </span>
          <input
            name="name"
            required
            autoComplete="name"
            className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-fg outline-none ring-wonder/40 focus:ring-2"
          />
        </label>
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
            Email
          </span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-fg outline-none ring-wonder/40 focus:ring-2"
          />
        </label>
      </div>
      <label className="block">
        <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
          How can we help?
        </span>
        <select
          name="topic"
          required
          className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-fg outline-none ring-wonder/40 focus:ring-2"
          defaultValue=""
        >
          <option value="" disabled>
            Choose a topic…
          </option>
          {collaborationNeeds.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
          <option value="Scientific critique">Scientific critique</option>
          <option value="Governed co-creation">
            Governed co-creation / case study
          </option>
          <option value="Philosophical correspondence">
            Philosophical correspondence
          </option>
          <option value="General">Press / general</option>
        </select>
      </label>
      <label className="block">
        <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
          Message
        </span>
        <textarea
          name="message"
          required
          rows={compact ? 4 : 5}
          className="mt-2 w-full resize-y rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-fg outline-none ring-wonder/40 focus:ring-2"
        />
      </label>
      {/* Honeypot */}
      <label className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        Company
        <input name="company" tabIndex={-1} autoComplete="off" />
      </label>
      {hasChallenge && <div ref={slotRef} className="cf-turnstile-slot" />}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-md bg-ivory px-5 py-2.5 font-sans text-sm font-medium text-void transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Bring a question"}
        </button>
        <a
          href={`mailto:${site.email}`}
          className="font-mono text-xs text-muted no-underline hover:text-ivory"
        >
          or {site.email}
        </a>
      </div>
      {status === "error" && error && (
        <p className="text-sm text-bounded" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
