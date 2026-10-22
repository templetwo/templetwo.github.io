import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export function TwoDoors() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      // WCAG 2.1.4: a bare printable key must never act on its own, so the
      // doors answer Alt+W and Alt+R only (Option on a Mac). Read by key
      // position, because the Option layer on macOS reports a different
      // character for the same key. Never inside a field, never with Cmd/Ctrl.
      if (!e.altKey || e.metaKey || e.ctrlKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
      )
        return;

      if (e.code === "KeyW") {
        e.preventDefault();
        navigate({ to: "/writings" });
      } else if (e.code === "KeyR") {
        e.preventDefault();
        navigate({ to: "/instruments" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Link
        to="/writings"
        className="group relative overflow-hidden rounded-xl border border-wonder/25 bg-wonder-field p-6 no-underline transition-colors duration-200 hover:border-wonder/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wonder sm:p-8"
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-wonder/15 blur-2xl" />
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-wonder-soft">
            Enter through Wonder
          </p>
          <span className="rounded border border-wonder/30 bg-wonder-field/80 px-1.5 py-0.5 font-mono text-[10px] text-wonder opacity-75 group-hover:opacity-100">
            Alt+W
          </span>
        </div>
        <h3 className="mt-3 font-serif text-2xl text-ivory sm:text-3xl">
          Essays, origin, grief, lineage
        </h3>
        <p className="mt-3 text-sm text-fg-soft">
          Questions that arrive before proof — and the willingness to stand at a
          threshold without collapsing it too quickly.
        </p>
        <span className="mt-6 inline-block font-sans text-sm text-wonder">
          Open Writings →
        </span>
      </Link>

      <Link
        to="/instruments"
        className="group relative overflow-hidden rounded-xl border border-rigor/30 bg-rigor-field p-6 no-underline transition-colors duration-200 hover:border-rigor/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rigor sm:p-8"
      >
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-rigor/20 blur-2xl" />
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-rigor">
            Enter through Rigor
          </p>
          <span className="rounded border border-rigor/30 bg-rigor-field/80 px-1.5 py-0.5 font-mono text-[10px] text-rigor-bright opacity-75 group-hover:opacity-100">
            Alt+R
          </span>
        </div>
        <h3 className="mt-3 font-serif text-2xl text-ivory sm:text-3xl">
          Experiments, code, receipts
        </h3>
        <p className="mt-3 text-sm text-fg-soft">
          Instruments, falsifiable claims, open repositories, negative results,
          and verification paths.
        </p>
        <span className="mt-6 inline-block font-sans text-sm text-rigor-bright">
          Open Instruments →
        </span>
      </Link>
    </div>
  );
}
