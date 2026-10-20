import { db } from "@/db";
import { sql } from "drizzle-orm";
import { adminConfigured } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Open /api/health to check setup. Shows only true/false, never secrets.
export async function GET() {
  const out = { adminPasswordSet: adminConfigured(), databaseUrlSet: !!process.env.DATABASE_URL, databaseOk: false, hint: "" };
  try {
    await db.execute(sql`select 1`);
    out.databaseOk = true;
  } catch {
    out.hint = "Database not reachable. Use the Supabase Transaction pooler URL (port 6543) and a DB password without special characters.";
  }
  return Response.json(out, { status: out.databaseOk && out.adminPasswordSet ? 200 : 500 });
}
