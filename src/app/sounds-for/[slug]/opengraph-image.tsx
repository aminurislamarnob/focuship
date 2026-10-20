import { landingPage, landingParams } from "@/lib/landing-route";
import { SocialImage, socialImage } from "@/lib/social-image";

export const dynamicParams = false;
export const generateStaticParams = () => landingParams("activity");
export const { alt, size, contentType } = socialImage("A Focuship soundscape");

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const page = landingPage("activity", (await params).slug);
  return SocialImage({ eyebrow: "Sounds for", title: page.heading, detail: page.intro });
}
