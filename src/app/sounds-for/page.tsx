import { HubPage, hubMetadata } from "@/components/HubPage";

export const metadata = hubMetadata("activities");

export default function Page() {
  return <HubPage id="activities" />;
}
