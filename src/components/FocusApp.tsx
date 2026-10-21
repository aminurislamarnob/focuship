import type { ReactNode } from "react";
import { PAGES, isIndexable, pagePath, type PageIntent } from "@/lib/pages";
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

/** The hand-written single-sound pages, listed under the sound library. */
const GUIDES = PAGES.filter((page) => page.type === "sound" && page.hero && isIndexable(page)).map((page) => ({
  href: pagePath(page),
  label: page.heading,
  // The intro's first sentence, without the "Tap play." call to action.
  description: page.intro.split(/(?<=\.)\s/)[0].replace(/\.$/, ""),
}));

/** The app shell with the site navigation and sound guides filled in on the server. */
export function FocusApp(props: FocusAppProps) {
  return <FocusShell {...props} nav={<SiteNav />} guides={GUIDES} />;
}

/** A page of its own (guides, privacy) inside the same shell: sidebar, tab bar, mini player and shortcuts. */
export function SitePage({ children }: { children: ReactNode }) {
  return <FocusShell heading="" intro="" nav={<SiteNav />} guides={GUIDES} page={children} />;
}
