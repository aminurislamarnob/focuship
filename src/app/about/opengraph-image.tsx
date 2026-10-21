import { SocialImage, socialImage } from "@/lib/social-image";

export const dynamic = "force-static";
export const { alt, size, contentType } = socialImage("About & offline");

export default function Image() {
  return SocialImage({ eyebrow: "Focuship", title: "About & offline", detail: "Offline sounds · Install · Shortcuts · Credits" });
}
