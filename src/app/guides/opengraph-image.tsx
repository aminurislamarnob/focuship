import { GUIDES_HUB } from "@/lib/guides";
import { SocialImage, socialImage } from "@/lib/social-image";

export const dynamic = "force-static";
export const { alt, size, contentType } = socialImage(GUIDES_HUB.title);

export default function Image() {
  return SocialImage({ eyebrow: GUIDES_HUB.label, title: GUIDES_HUB.title, detail: GUIDES_HUB.intro });
}
