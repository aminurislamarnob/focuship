/** The bracket mark and wordmark. */
export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <svg viewBox="0 0 100 100" className="size-6" aria-hidden>
        <path d="M22 36V22h14 M64 22h14v14 M78 64v14H64 M36 78H22V64" fill="none" stroke="var(--brand)" strokeWidth="8" />
        <rect x="35" y="44" width="7" height="22" fill="var(--fg)" />
        <rect x="46.5" y="34" width="7" height="32" fill="var(--fg)" />
        <rect x="58" y="50" width="7" height="16" fill="var(--fg)" />
      </svg>
      <span className="font-mono text-[0.8125rem] font-semibold tracking-[0.18em] uppercase">Focuship</span>
    </span>
  );
}
