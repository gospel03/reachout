import AskClient from "@/components/AskClient";
import { SOCIALS, EVENT } from "@/config/event";

export const dynamic = "force-dynamic";

export default function AskPage() {
  return <AskClient socials={SOCIALS} maxLength={EVENT.maxLength} />;
}
