import { createClient } from "@supabase/supabase-js";
import { createCloud, type Cloud, type CloudDriver } from "@/lib/cloud";

/**
 * The composition root for the cloud gateway: builds the real Supabase client
 * (the only place supabase-js is imported) and hands it to `createCloud`.
 *
 * The URL and anon key are public build-time constants (the site is a static
 * export; security rests on Row Level Security, not on hiding the key). While
 * they are unset, accounts are simply off and the app stays local-only.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Accounts exist in this build. Gates every cloud-facing control. */
export const CLOUD_ENABLED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Facebook ships code-complete but hidden until the Meta app review clears. */
export const FACEBOOK_ENABLED = process.env.NEXT_PUBLIC_AUTH_FACEBOOK === "1";

let cloud: Cloud | null | undefined;

/** The app-wide gateway instance, or null while Supabase isn't configured. */
export function getCloud(): Cloud | null {
  if (cloud === undefined) {
    cloud = CLOUD_ENABLED
      ? // The driver type is the narrow structural slice of the client the gateway uses.
        createCloud(createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, { auth: { flowType: "pkce" } }) as unknown as CloudDriver)
      : null;
  }
  return cloud;
}
