/** The one canonical origin. Canonicals, the sitemap, robots, llms.txt and JSON-LD all derive from it. */
export const SITE_URL = "https://focuship.app";

export const SITE_NAME = "Focuship";

export const SITE_TAGLINE = "Ambient sounds and a focus timer";

export const SITE_DESCRIPTION =
  "Free ambient sound mixer and focus timer. Layer rain, café, brown noise and binaural beats, run Pomodoro sessions and keep working offline. No sign-up.";

export const AUTHOR = { name: "Md. Aminur Islam", url: "https://github.com/aminurislamarnob" };

export const REPO_URL = "https://github.com/aminurislamarnob/focuship";

/**
 * Cloudflare Web Analytics site token (cookie-free). Create the site in the Cloudflare dashboard
 * (Analytics & Logs → Web Analytics) and paste its token here; the beacon is omitted while empty.
 */
export const CF_ANALYTICS_TOKEN = "";

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).toString();
