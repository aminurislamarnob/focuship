import { Landing } from "@/components/Landing";
import { landingMetadata, landingPage, landingParams } from "@/lib/landing-route";

export const dynamicParams = false;
export const generateStaticParams = () => landingParams("pomodoro");

export async function generateMetadata({ params }: PageProps<"/pomodoro/[slug]">) {
  return landingMetadata("pomodoro", (await params).slug);
}

export default async function Page({ params }: PageProps<"/pomodoro/[slug]">) {
  return <Landing page={landingPage("pomodoro", (await params).slug)} />;
}
