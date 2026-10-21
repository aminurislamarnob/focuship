import type { ReactNode } from "react";
import { SitePage } from "./FocusApp";

/** Reading layout for guides and the privacy policy: the article column inside the app's sidebar layout. */
export function GuideLayout({ children }: { children: ReactNode }) {
  return (
    <SitePage>
      <div className="mx-auto max-w-3xl pt-6 pb-16 md:pt-3">{children}</div>
    </SitePage>
  );
}
