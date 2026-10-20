import { Landing } from "@/components/Landing";
import { landingMetadata, landingPage, landingParams } from "@/lib/landing-route";

export const dynamicParams = false;
export const generateStaticParams = () => landingParams("activity");

export async function generateMetadata({ params }: PageProps<"/sounds-for/[slug]">) {
  return landingMetadata("activity", (await params).slug);
}

export default async function Page({ params }: PageProps<"/sounds-for/[slug]">) {
  return <Landing page={landingPage("activity", (await params).slug)} />;
}
