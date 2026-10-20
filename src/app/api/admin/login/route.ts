import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminConfigured, checkPassword, sessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Light brute-force guard (per server instance): 10 wrong tries / 5 min per IP.
const fails = new Map<string, number[]>();

export async function POST(req: Request) {
  if (!adminConfigured())
    return Response.json(
      { error: "ADMIN_PASSWORD is not set on the server (min 6 characters). Add it in Vercel → Settings → Environment Variables, then Redeploy.", code: "not_configured" },
      { status: 503 },
    );
  const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
  const now = Date.now();
  const recent = (fails.get(ip) ?? []).filter((t) => now - t < 300_000);
  if (recent.length >= 10) return Response.json({ error: "Too many attempts. Wait 5 minutes." }, { status: 429 });

  const body = (await req.json().catch(() => ({}))) as { password?: string };
  if (!body.password || !checkPassword(body.password)) {
    recent.push(now);
    fails.set(ip, recent);
    if (fails.size > 2000) fails.clear();
    await new Promise((r) => setTimeout(r, 500));
    return Response.json({ error: "Wrong password", code: "wrong" }, { status: 401 });
  }
  fails.delete(ip);
  const store = await cookies();
  store.set(ADMIN_COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && !!process.env.VERCEL,
    path: "/",
    maxAge: 60 * 60 * 24 * 2,
  });
  return Response.json({ ok: true });
}

export async function DELETE() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  return Response.json({ ok: true });
}
