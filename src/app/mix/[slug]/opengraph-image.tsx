import { landingPage, landingParams } from "@/lib/landing-route";
import { SocialImage, socialImage } from "@/lib/social-image";

export const dynamicParams = false;
export const generateStaticParams = () => landingParams("mix");
export const { alt, size, contentType } = socialImage("A Focuship mix");

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const page = landingPage("mix", (await params).slug);
  return SocialImage({ eyebrow: "Mix", title: page.heading, detail: page.intro });
}
