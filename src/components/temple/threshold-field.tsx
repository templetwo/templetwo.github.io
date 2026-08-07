import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Link } from "@tanstack/react-router";
import { livingQuestions, type LivingQuestion } from "@/data/content";
import { StandingTriple } from "./standing-badge";
import { cn } from "@/lib/utils";

function ArtifactVisual({ realm }: { realm: LivingQuestion["realm"] }) {
  const uid = useId().replace(/:/g, "");

  if (realm === "threshold") {
    // Pitchfork bifurcation — commitment as a dynamical-systems diagram
    // (not a double-well silhouette). Branches after μc; saddle on axis.
    const left: string[] = [];
    const right: string[] = [];
    const unstable: string[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const mu = 0.15 + t * 0.85; // past critical
      const amp = Math.sqrt(Math.max(0, mu - 0.15)) * 48;
      const x = (48 + t * 210).toFixed(2);
      left.push(`${x},${(70 - amp).toFixed(2)}`);
      right.push(`${x},${(70 + amp).toFixed(2)}`);
      unstable.push(`${x},70.00`);
    }
    // pre-critical single branch
    const pre: string[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const x = (24 + t * 24).toFixed(2);
      pre.push(`${x},70.00`);
    }

    return (
      <svg viewBox="0 0 300 140" className="h-full w-full" aria-hidden>
        {/* plot frame */}
        <rect
          x="20"
          y="14"
          width="260"
          height="112"
          fill="none"
          stroke="#3a4050"
          strokeWidth="1"
        />
        {/* axes */}
        <line x1="24" y1="70" x2="276" y2="70" stroke="#5c574e" strokeWidth="0.75" />
        <line x1="48" y1="18" x2="48" y2="122" stroke="#5c574e" strokeWidth="0.75" />
        {/* critical line μc */}
        <line
          x1="48"
          y1="18"
          x2="48"
          y2="122"
          stroke="#ebe6dc"
          strokeOpacity="0.2"
          strokeDasharray="3 3"
        />
        {/* pre-critical */}
        <path
          d={`M ${pre.join(" L ")}`}
          fill="none"
          stroke="#a8b8c8"
          strokeWidth="2"
        />
        {/* stable branches */}
        <path
          d={`M ${left.join(" L ")}`}
          fill="none"
          stroke="#c9955a"
          strokeWidth="2"
        />
        <path
          d={`M ${right.join(" L ")}`}
          fill="none"
          stroke="#7a8ea3"
          strokeWidth="2"
        />
        {/* unstable continuation on axis */}
        <path
          d={`M ${unstable.join(" L ")}`}
          fill="none"
          stroke="#ebe6dc"
          strokeOpacity="0.35"
          strokeWidth="1.25"
          strokeDasharray="3 3"
        />
        {/* critical point */}
        <circle cx="48" cy="70" r="3.5" fill="#ebe6dc" />
        {/* attractors at end of branches */}
        <circle cx="258" cy="22" r="3.5" fill="#c9955a" />
        <circle cx="258" cy="118" r="3.5" fill="#7a8ea3" />
        {/* labels */}
        <text x="52" y="30" fill="#9a9488" fontSize="8" fontFamily="monospace">
          state
        </text>
        <text x="250" y="132" fill="#9a9488" fontSize="8" fontFamily="monospace" textAnchor="end">
          μ →
        </text>
        <text x="52" y="64" fill="#9a9488" fontSize="7" fontFamily="monospace">
          μc
        </text>
        <text x="200" y="40" fill="#c9955a" fontSize="8" fontFamily="monospace">
          A
        </text>
        <text x="200" y="110" fill="#7a8ea3" fontSize="8" fontFamily="monospace">
          B
        </text>
      </svg>
    );
  }

  if (realm === "field") {
    const witness = [0.72, 0.7, 0.71, 0.69, 0.7, 0.68, 0.7, 0.69, 0.71, 0.7];
    const open = [0.78, 0.82, 0.88, 0.94, 0.99, 1.05, 1.1, 1.12, 1.15, 1.18];
    const toPath = (arr: number[], y0: number, scale: number) =>
      arr
        .map((v, i) => {
          const x = (24 + (i / (arr.length - 1)) * 252).toFixed(2);
          const y = (y0 - (v - 0.65) * scale).toFixed(2);
          return `${i === 0 ? "M" : "L"} ${x} ${y}`;
        })
        .join(" ");
    return (
      <svg viewBox="0 0 300 140" className="h-full w-full" aria-hidden>
        <rect
          x="20"
          y="14"
          width="260"
          height="100"
          fill="none"
          stroke="#3a4050"
          strokeWidth="1"
        />
        <path d={toPath(witness, 90, 70)} fill="none" stroke="#c9955a" strokeWidth="2" />
        <path d={toPath(open, 90, 70)} fill="none" stroke="#7a8ea3" strokeWidth="2" />
        <text x="28" y="128" fill="#9a9488" fontSize="9" fontFamily="monospace">
          WITNESS
        </text>
        <text x="210" y="128" fill="#9a9488" fontSize="9" fontFamily="monospace">
          OPEN ↑
        </text>
      </svg>
    );
  }

  if (realm === "record") {
    const nodes = [40, 100, 160, 220, 260];
    return (
      <svg viewBox="0 0 300 140" className="h-full w-full" aria-hidden>
        <line
          x1="40"
          y1="70"
          x2="260"
          y2="70"
          stroke="#7a8ea3"
          strokeOpacity="0.5"
          strokeWidth="1.5"
        />
        {nodes.map((x, i) => (
          <g key={x}>
            <rect
              x={x - 14}
              y={52}
              width={28}
              height={36}
              rx={3}
              fill={i % 2 ? "#0e1218" : "#1a1410"}
              stroke={i === nodes.length - 1 ? "#c9955a" : "#7a8ea3"}
              strokeWidth="1.5"
            />
            <text
              x={x}
              y={74}
              textAnchor="middle"
              fill="#a8b8c8"
              fontSize="8"
              fontFamily="monospace"
            >
              {i === nodes.length - 1 ? "✓" : String(i + 1)}
            </text>
          </g>
        ))}
      </svg>
    );
  }

  if (realm === "membrane") {
    return (
      <svg viewBox="0 0 300 140" className="h-full w-full" aria-hidden>
        <circle cx="150" cy="70" r="54" fill="none" stroke="#7a8ea3" strokeOpacity="0.35" strokeWidth="1" />
        <circle cx="150" cy="70" r="38" fill="none" stroke="#7a8ea3" strokeOpacity="0.55" strokeWidth="1.5" />
        <circle cx="150" cy="70" r="22" fill="none" stroke="#c9955a" strokeOpacity="0.8" strokeWidth="2" />
        <circle cx="150" cy="70" r="6" fill="#ebe6dc" opacity="0.85" />
        <text x="150" y="128" textAnchor="middle" fill="#9a9488" fontSize="9" fontFamily="monospace">
          R1 · R2 · R3
        </text>
      </svg>
    );
  }

  // witness
  return (
    <svg viewBox="0 0 300 140" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id={`${uid}-a`} cx="30%" cy="50%" r="45%">
          <stop offset="0%" stopColor="#c9955a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#c9955a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-b`} cx="70%" cy="50%" r="45%">
          <stop offset="0%" stopColor="#7a8ea3" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#7a8ea3" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="300" height="140" fill={`url(#${uid}-a)`} />
      <rect width="300" height="140" fill={`url(#${uid}-b)`} />
      <path
        d="M150 20 C140 50 140 90 150 120"
        fill="none"
        stroke="#ebe6dc"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      <circle cx="150" cy="70" r="3" fill="#ebe6dc" opacity="0.9" />
    </svg>
  );
}

function FieldBackdrop({ realm }: { realm: LivingQuestion["realm"] }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className={cn(
          "absolute -left-1/4 top-0 h-full w-3/5 rounded-full blur-3xl transition-opacity duration-500",
          realm === "witness" || realm === "threshold"
            ? "bg-wonder/20 opacity-100"
            : "bg-wonder/12 opacity-80",
        )}
      />
      <div
        className={cn(
          "absolute -right-1/4 bottom-0 h-full w-3/5 rounded-full blur-3xl transition-opacity duration-500",
          realm === "membrane" || realm === "record"
            ? "bg-rigor/25 opacity-100"
            : "bg-rigor/15 opacity-80",
        )}
      />
      <svg className="absolute inset-0 h-full w-full opacity-[0.14]" aria-hidden>
        <defs>
          <pattern id="thresh-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0H0V28" fill="none" stroke="#a8b8c8" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#thresh-grid)" />
      </svg>
      <div className="absolute inset-y-8 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-ivory/25 to-transparent lg:inset-y-6" />
    </div>
  );
}

export function ThresholdField() {
  const [active, setActive] = useState(0);
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId().replace(/:/g, "");
  const q = livingQuestions[active];

  /**
   * Proper tabs, not a listbox. The previous markup declared role="listbox"
   * with role="option" on <li> elements wrapping buttons — options were not
   * focusable and arrow keys did nothing, so assistive tech announced a widget
   * that did not behave like one.
   */
  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    const last = livingQuestions.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = active === last ? 0 : active + 1;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabsRef.current[next]?.focus();
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border-strong bg-surface threshold-glow">
      <FieldBackdrop realm={q.realm} />

      <div className="relative grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="border-b border-border p-6 sm:p-8 lg:border-b-0 lg:border-r lg:border-border">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
            Threshold field
          </p>
          <p className="mt-3 font-serif text-2xl text-ivory sm:text-3xl">
            Five questions organize the work
          </p>
          <p className="mt-3 text-sm text-muted">
            Select a question. The field and its artifact shift with it.
          </p>
          <div
            className="mt-6 flex flex-col gap-1"
            role="tablist"
            aria-orientation="vertical"
            aria-label="Living questions"
          >
            {livingQuestions.map((item, i) => {
              const selected = i === active;
              const closed = item.standing.lifecycle.toLowerCase() === "closed";
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`${baseId}-tab-${item.id}`}
                  aria-selected={selected}
                  aria-controls={`${baseId}-panel`}
                  tabIndex={selected ? 0 : -1}
                  ref={(el) => {
                    tabsRef.current[i] = el;
                  }}
                  onClick={() => setActive(i)}
                  onKeyDown={onKeyDown}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-md border px-3 py-3 text-left transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wonder",
                    selected
                      ? "border-wonder/40 bg-wonder-field text-ivory"
                      : "border-transparent bg-transparent text-fg-soft hover:border-border hover:bg-surface-raised",
                  )}
                >
                  <span
                    className={cn(
                      "mt-2 h-1.5 w-1.5 shrink-0 rounded-full",
                      closed
                        ? "bg-living"
                        : selected
                          ? "bg-wonder"
                          : "bg-border-strong",
                    )}
                    aria-hidden
                  />
                  <span className="font-serif text-base sm:text-lg">
                    {item.question}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="flex flex-col p-6 sm:p-8"
          role="tabpanel"
          id={`${baseId}-panel`}
          aria-labelledby={`${baseId}-tab-${q.id}`}
          tabIndex={0}
        >
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-wonder-soft">
            Living question
          </p>
          <h3 className="mt-3 font-serif text-2xl text-ivory sm:text-3xl">
            {q.question}
          </h3>
          <p className="mt-2 text-sm italic text-muted">{q.brief}</p>
          {/* Questions carry standing like every other claim on the site. */}
          <div className="mt-3">
            <StandingTriple standing={q.standing} />
          </div>

          <div className="mt-6 h-36 overflow-hidden rounded-lg border border-border bg-void/60 sm:h-40">
            <ArtifactVisual realm={q.realm} />
          </div>
          <p className="mt-2 font-mono text-xs text-muted">
            <span className="text-fg-soft">{q.artifact.label}</span>
            {" — "}
            {q.artifact.caption}
          </p>

          <p className="mt-5 text-base text-fg-soft">{q.detail}</p>

          {q.answer && (
            <div className="mt-5 rounded-lg border border-living/35 bg-living/[0.07] p-4 sm:p-5">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-living">
                Answered · the record changed
              </p>
              <p className="mt-2.5 text-sm leading-relaxed text-fg-soft">
                {q.answer}
              </p>
              {q.limit && (
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  <span className="text-fg-soft">Limit</span> — {q.limit}
                </p>
              )}
            </div>
          )}

          <div className="mt-5">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
              Related work
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {q.projects.map((p) => (
                <li
                  key={p}
                  className="rounded-full border border-border bg-bg px-3 py-1 font-mono text-xs text-rigor-bright"
                >
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <Link
            to="/inquiry"
            hash={q.id}
            className="mt-6 inline-flex items-center gap-2 font-sans text-sm text-wonder no-underline hover:text-wonder-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wonder"
          >
            Full inquiry
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
