/**
 * The seal's line glyph: the ring, the infinity, the diamond and the sword
 * from the hero medallion, cut for 16 to 32 px. Inline so `currentColor`
 * takes its colour from CSS (the header sets text-brass). The paths are the
 * same as public/brand/seal-glyph.svg, which the favicon set is rendered
 * from; change the two together.
 */
export function SealGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 256 256"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="128" cy="128" r="112" strokeWidth="16" />
        <path
          d="M128 130C152 80 216 80 216 130S152 180 128 130C104 80 40 80 40 130S104 180 128 130"
          strokeWidth="16"
        />
        <path d="M108 34H148L160 52L128 82L96 52ZM96 52H160" strokeWidth="12" />
        <path
          d="M128 180V190M106 192H150"
          strokeWidth="14"
          strokeLinecap="butt"
        />
        <path d="M122 198L128 228L134 198" strokeWidth="10" />
      </g>
    </svg>
  );
}
