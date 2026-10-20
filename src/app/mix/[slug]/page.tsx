import { Landing } from "@/components/Landing";
import { landingMetadata, landingPage, landingParams } from "@/lib/landing-route";

export const dynamicParams = false;
export const generateStaticParams = () => landingParams("mix");

export async function generateMetadata({ params }: PageProps<"/mix/[slug]">) {
  return landingMetadata("mix", (await params).slug);
}

export default async function Page({ params }: PageProps<"/mix/[slug]">) {
  return <Landing page={landingPage("mix", (await params).slug)} />;
}
