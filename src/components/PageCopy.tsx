import type { ReactNode } from "react";

/** Long-form page copy below the player, styled for reading inside the app shell. */
export function PageCopy({ children }: { children: ReactNode }) {
  return (
    <article className="page-copy mt-4 mb-10 max-w-2xl border-t border-line pt-8 text-[0.9375rem] leading-relaxed text-muted">
      {children}
    </article>
  );
}
