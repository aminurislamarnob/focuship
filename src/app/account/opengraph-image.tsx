import { SocialImage, socialImage } from "@/lib/social-image";

export const dynamic = "force-static";
export const { alt, size, contentType } = socialImage("Account");

export default function Image() {
  return SocialImage({
    eyebrow: "Focuship",
    title: "Your sounds, everywhere",
    detail: "Favorites · Your presets · Settings sync",
  });
}
