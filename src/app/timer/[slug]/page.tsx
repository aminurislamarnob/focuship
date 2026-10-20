import { Landing } from "@/components/Landing";
import { landingMetadata, landingPage, landingParams } from "@/lib/landing-route";

export const dynamicParams = false;
export const generateStaticParams = () => landingParams("timer");

export async function generateMetadata({ params }: PageProps<"/timer/[slug]">) {
  return landingMetadata("timer", (await params).slug);
}

export default async function Page({ params }: PageProps<"/timer/[slug]">) {
  return <Landing page={landingPage("timer", (await params).slug)} />;
}
