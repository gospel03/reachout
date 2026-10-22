import { db, ensureSchema } from "@/db";
import { displayState } from "@/db/schema";
import { isAdmin, isStaff } from "@/lib/auth";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const MODES = ["welcome", "question", "socials", "blank"] as const;

export async function POST(req: Request) {
  if (!(await isStaff())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSchema();
  const body = (await req.json().catch(() => ({}))) as {
    mode?: string;
    text?: string;
    askedCount?: number;
    accepting?: boolean;
  };

  const patch: Partial<typeof displayState.$inferInsert> = { updatedAt: new Date() };
  if (body.mode !== undefined) {
    if (!MODES.includes(body.mode as (typeof MODES)[number]))
      return Response.json({ error: "Bad mode" }, { status: 400 });
    patch.mode = body.mode;
    if (body.mode === "question") {
      const text = (body.text ?? "").trim();
      if (!text) return Response.json({ error: "Text required" }, { status: 400 });
      patch.text = text.slice(0, 600);
      patch.askedCount = Math.max(1, Math.floor(body.askedCount ?? 1));
    }
  }
  if (typeof body.accepting === "boolean" && (await isAdmin())) patch.accepting = body.accepting;

  await db.update(displayState).set(patch).where(eq(displayState.id, 1));
  return Response.json({ ok: true });
}
