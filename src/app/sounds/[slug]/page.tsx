import { Landing } from "@/components/Landing";
import { landingMetadata, landingPage, landingParams } from "@/lib/landing-route";

export const dynamicParams = false;
export const generateStaticParams = () => landingParams("sound");

export async function generateMetadata({ params }: PageProps<"/sounds/[slug]">) {
  return landingMetadata("sound", (await params).slug);
}

export default async function Page({ params }: PageProps<"/sounds/[slug]">) {
  return <Landing page={landingPage("sound", (await params).slug)} />;
}
