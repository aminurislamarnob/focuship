import { FocusApp } from "@/components/FocusApp";
import { JsonLd, organization, webApplication, website } from "@/components/JsonLd";
import { PageCopy } from "@/components/PageCopy";
import { pageMetadata } from "@/lib/seo";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const metadata = pageMetadata({
  title: { absolute: `${SITE_NAME} · ${SITE_TAGLINE}` },
  description: SITE_DESCRIPTION,
  path: "/",
});

export default function Page() {
  return (
    <FocusApp heading="Ambient sound mixer and focus timer" intro="Mix rain, cafés, noise and binaural tones, then start a focus session.">
      <PageCopy>
        <h2>What Focuship does</h2>
        <p>
          Focuship layers up to 63 sounds into one soundscape: rain on a window, a busy café, a train at night, brown,
          pink and white noise, and binaural tones. Each sound has its own volume, so you can keep the rain soft and the
          café murmur just loud enough to mask the room.
        </p>
        <p>
          A Pomodoro-style focus timer runs alongside the mix, with short and long breaks and a gentle chime. Focus mode
          turns the screen into a large clock or countdown and keeps it awake while you work.
        </p>
        <h2>Free, private and offline</h2>
        <p>
          There is no account and no tracking cookies. Install it to your home screen and the sounds you have played keep
          working offline, with lock-screen controls on your phone. Mixes can be shared as a link.
        </p>
      </PageCopy>
      <JsonLd nodes={[organization(), website(), webApplication()]} />
    </FocusApp>
  );
}
