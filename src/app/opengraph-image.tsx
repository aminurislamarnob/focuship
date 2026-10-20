import { SocialImage, socialImage } from "@/lib/social-image";
import { SITE_TAGLINE } from "@/lib/site";

export const dynamic = "force-static";
export const { alt, size, contentType } = socialImage(SITE_TAGLINE);

export default function Image() {
  return SocialImage({ eyebrow: "Focuship", title: "Ambient sounds and a focus timer", detail: "Rain · Café · Brown noise · Pomodoro" });
}
