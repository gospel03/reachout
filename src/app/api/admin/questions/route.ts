import { db, ensureSchema } from "@/db";
import { questions } from "@/db/schema";
import { isAdmin } from "@/lib/auth";
import { cluster } from "@/lib/similarity";
import { asc, inArray } from "drizzle-orm";
import { getDisplayState } from "@/lib/state";

export const dynamic = "force-dynamic";

const STATUSES = ["new", "starred", "answered", "hidden"] as const;
const unauthorized = () => Response.json({ error: "Unauthorized" }, { status: 401 });

export async function GET(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  await ensureSchema();
  const { searchParams } = new URL(req.url);
  const threshold = Math.min(0.95, Math.max(0.2, Number(searchParams.get("threshold") ?? 0.5) || 0.5));

  const rows = await db.select().from(questions).orderBy(asc(questions.createdAt));
  const groups = cluster(rows, threshold).map((members) => {
    // Status priority for the group: answered/hidden only if ALL members are; starred if any is.
    const statuses = new Set(members.map((m) => m.status));
    let status: string = "new";
    if (statuses.has("starred")) status = "starred";
    else if (statuses.size === 1) status = members[0].status;
    else if ([...statuses].every((s) => s === "answered" || s === "hidden"))
      status = statuses.has("answered") ? "answered" : "hidden";
    // Representative = longest reasonably-sized wording (usually the clearest one)
    const rep = [...members].sort((a, b) => Math.min(b.text.length, 220) - Math.min(a.text.length, 220))[0];
    return {
      key: members.map((m) => m.id).join("-"),
      ids: members.map((m) => m.id),
      text: rep.text,
      count: members.length,
      status,
      firstAt: members[0].createdAt,
      lastAt: members[members.length - 1].createdAt,
      variants: members.map((m) => ({ id: m.id, text: m.text, status: m.status, createdAt: m.createdAt })),
    };
  });

  const state = await getDisplayState();
  return Response.json({ groups, total: rows.length, state }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as { ids?: number[]; status?: string };
  const ids = (body.ids ?? []).filter((n) => Number.isInteger(n));
  if (!ids.length || !STATUSES.includes(body.status as (typeof STATUSES)[number]))
    return Response.json({ error: "Bad request" }, { status: 400 });
  await db.update(questions).set({ status: body.status! }).where(inArray(questions.id, ids));
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as { ids?: number[]; all?: boolean };
  if (body.all) {
    await db.delete(questions);
    return Response.json({ ok: true });
  }
  const ids = (body.ids ?? []).filter((n) => Number.isInteger(n));
  if (!ids.length) return Response.json({ error: "Bad request" }, { status: 400 });
  await db.delete(questions).where(inArray(questions.id, ids));
  return Response.json({ ok: true });
}
