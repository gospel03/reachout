import QRCode from "qrcode";
import { siteUrl } from "@/lib/url";

export const dynamic = "force-dynamic";

// GET /api/qr            -> PNG QR code pointing to the ask page (download & drop into FreeShow/slides)
// GET /api/qr?url=...    -> QR for any URL
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get("url") || `${await siteUrl()}/`;
  const png = await QRCode.toBuffer(target, { width: 1200, margin: 2, errorCorrectionLevel: "M" });
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `inline; filename="ask-qr.png"`,
      "Cache-Control": "no-store",
    },
  });
}
