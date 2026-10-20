import { HUBS } from "@/lib/pages";
import { SocialImage, socialImage } from "@/lib/social-image";

export const dynamic = "force-static";
const hub = HUBS.find((h) => h.id === "sounds")!;
export const { alt, size, contentType } = socialImage(hub.title);

export default function Image() {
  return SocialImage({ eyebrow: hub.label, title: hub.title, detail: hub.intro });
}
