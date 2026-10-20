import { db, ensureSchema } from "@/db";
import { questions } from "@/db/schema";
import { EVENT } from "@/config/event";
import { getDisplayState } from "@/lib/state";

export const dynamic = "force-dynamic";

// Very light anti-spam (per server instance). Nothing is stored about the sender.
const hits = new Map<string, number[]>();
function limited(key: string): boolean {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < 60_000);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return list.length > 8;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { text?: unknown };
    const text = typeof body.text === "string" ? body.text.replace(/\s+/g, " ").trim() : "";
    if (text.length < 3) return Response.json({ error: "Please type a question." }, { status: 400 });
    if (text.length > EVENT.maxLength)
      return Response.json({ error: `Please keep it under ${EVENT.maxLength} characters.` }, { status: 400 });

    const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
    if (limited(ip)) return Response.json({ error: "Slow down a little 🙂 Try again in a minute." }, { status: 429 });

    await ensureSchema();
    const state = await getDisplayState();
    if (state && !state.accepting)
      return Response.json({ error: "Questions are closed right now." }, { status: 403 });

    await db.insert(questions).values({ text });
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
