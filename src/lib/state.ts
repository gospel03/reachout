import { db, ensureSchema } from "@/db";
import { displayState } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getDisplayState() {
  await ensureSchema();
  const rows = await db.select().from(displayState).where(eq(displayState.id, 1)).limit(1);
  return rows[0];
}
