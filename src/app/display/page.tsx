import QRCode from "qrcode";
import DisplayClient from "@/components/DisplayClient";
import { SOCIALS } from "@/config/event";
import { siteUrl } from "@/lib/url";

export const dynamic = "force-dynamic";

async function qrSvg(url: string) {
  return QRCode.toString(url, { type: "svg", margin: 1, color: { dark: "#06142b", light: "#ffffff" } });
}

export default async function DisplayPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const base = await siteUrl();
  const askQr = await qrSvg(`${base}/`);
  const socials = await Promise.all(SOCIALS.map(async (s) => ({ ...s, qr: await qrSvg(s.url) })));
  return (
    <DisplayClient
      askUrl={base.replace(/^https?:\/\//, "")}
      askQr={askQr}
      socials={socials}
      transparent={sp.bg === "transparent"}
      showCornerQr={sp.qr !== "0"}
    />
  );
}
