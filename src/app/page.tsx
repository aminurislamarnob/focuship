import { FocusApp } from "@/components/FocusApp";
import { JsonLd, organization, webApplication, website } from "@/components/JsonLd";
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
      <JsonLd nodes={[organization(), website(), webApplication()]} />
    </FocusApp>
  );
}
