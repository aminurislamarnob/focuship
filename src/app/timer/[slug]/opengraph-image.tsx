import { landingPage, landingParams } from "@/lib/landing-route";
import { SocialImage, socialImage } from "@/lib/social-image";

export const dynamicParams = false;
export const generateStaticParams = () => landingParams("timer");
export const { alt, size, contentType } = socialImage("A Focuship timer");

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const page = landingPage("timer", (await params).slug);
  return SocialImage({ eyebrow: "Timer", title: page.heading, detail: page.intro });
}
