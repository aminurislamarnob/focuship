import { landingPage, landingParams } from "@/lib/landing-route";
import { SocialImage, socialImage } from "@/lib/social-image";

export const dynamicParams = false;
export const generateStaticParams = () => landingParams("sound");
export const { alt, size, contentType } = socialImage("A Focuship sound");

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const page = landingPage("sound", (await params).slug);
  return SocialImage({ eyebrow: "Sound", title: page.heading, detail: page.intro });
}
