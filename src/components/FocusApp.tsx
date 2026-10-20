import type { ReactNode } from "react";
import type { PageIntent } from "@/lib/pages";
import { FocusShell } from "./FocusShell";
import { SiteNav } from "./SiteNav";

interface FocusAppProps {
  /** The page's H1 and one-line intro, shown above the player. */
  heading: string;
  intro: string;
  /** What a landing page loads on arrival (mix, tab, timer lengths). */
  intent?: PageIntent;
  /** Page copy rendered below the active view, inside the scroll area. */
  children?: ReactNode;
}

/** The app shell with the site navigation filled in on the server. */
export function FocusApp(props: FocusAppProps) {
  return <FocusShell {...props} nav={<SiteNav />} />;
}
