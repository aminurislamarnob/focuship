import type { ReactNode } from "react";

interface PageCopyProps {
  children: ReactNode;
  /** Shown above the copy across the full width (a breadcrumb). */
  lead?: ReactNode;
  /** A side column on wide screens (related links); below the copy on phones. */
  aside?: ReactNode;
}

/** Long-form page copy below the player, styled for reading inside the app shell. */
export function PageCopy({ children, lead, aside }: PageCopyProps) {
  if (!aside) {
    return (
      <article className="page-copy mt-2 mb-10 max-w-2xl border-t border-line pt-9 text-[0.9375rem] leading-[1.6] text-body">
        {lead}
        {children}
      </article>
    );
  }
  return (
    <article className="page-copy page-copy-split mt-2 mb-10 border-t border-line pt-9 text-[0.9375rem] leading-[1.6] text-body lg:pt-12 lg:text-base lg:leading-[1.65]">
      {lead}
      <div className="lg:flex lg:items-start lg:gap-10">
        <div className="max-w-2xl min-w-0 lg:max-w-[680px] lg:flex-[999_1_460px]">{children}</div>
        <aside className="max-w-2xl min-w-0 lg:sticky lg:top-6 lg:flex-[1_1_260px]">{aside}</aside>
      </div>
    </article>
  );
}
