import { SocialImage, socialImage } from "@/lib/social-image";

export const dynamic = "force-static";
export const { alt, size, contentType } = socialImage("Privacy policy");

export default function Image() {
  return SocialImage({ eyebrow: "Focuship", title: "Privacy policy", detail: "No tracking cookies · No ads · Delete anytime" });
}
