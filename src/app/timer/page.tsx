import { HubPage, hubMetadata } from "@/components/HubPage";

export const metadata = hubMetadata("timers");

export default function Page() {
  return <HubPage id="timers" />;
}
