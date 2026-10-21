/** The mark's ember dot; lighter than the glow so it reads at favicon size. */
export const MARK_EMBER = "#f08a4b";

/** The mark: an open timer ring around one ember dot. Strokes thicken as it shrinks so it holds up small. */
export function Mark({ size = 24, className }: { size?: number; className?: string }) {
  const stroke = size <= 28 ? 6 : size <= 48 ? 5 : 4.5;
  const dot = size <= 28 ? 7.5 : size <= 48 ? 6.5 : 6;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden className={`shrink-0 ${className ?? ""}`}>
      <circle
        cx="32"
        cy="32"
        r="21"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray="108 24"
        transform="rotate(-62 32 32)"
      />
      <circle cx="32" cy="32" r={dot} fill={MARK_EMBER} />
    </svg>
  );
}

/** The mark and wordmark. */
export function Logo({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center font-[650] tracking-[-0.02em] ${className ?? "gap-[9px] text-lg"}`}>
      <Mark size={size} />
      Focuship
    </span>
  );
}
