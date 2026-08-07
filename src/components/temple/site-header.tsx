import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { nav, site } from "@/data/content";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <Link
          to="/"
          className="group flex items-baseline gap-2 no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wonder"
          onClick={() => setOpen(false)}
        >
          <span className="font-serif text-lg tracking-tight text-ivory sm:text-xl">
            Temple of Two
          </span>
          <span className="hidden font-mono text-xs uppercase tracking-[0.16em] text-muted sm:inline">
            {site.tagline}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {nav.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 font-sans text-sm no-underline transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wonder",
                  active ? "text-ivory" : "text-muted hover:text-fg-soft",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border text-fg-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wonder md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav
          className="border-t border-border bg-surface px-4 py-3 md:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-1">
            {nav.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    aria-current={active ? "page" : undefined}
                    className="block rounded-md px-3 py-3 font-sans text-base text-fg-soft no-underline hover:bg-surface-raised"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
