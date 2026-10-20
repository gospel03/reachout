import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "qa_admin";

/** Removes stray spaces/newlines and wrapping quotes (common when pasting env vars). */
export function clean(v: string | undefined | null): string {
  return (v ?? "").trim().replace(/^(["'])([\s\S]*)\1$/, "$2").trim();
}

export function adminPassword(): string {
  return clean(process.env.ADMIN_PASSWORD);
}

/** There is NO default password. If ADMIN_PASSWORD is not set, admin login is disabled. */
export function adminConfigured(): boolean {
  return adminPassword().length >= 6;
}

function secret(): string {
  return clean(process.env.SESSION_SECRET) || `qa-secret-${adminPassword()}`;
}

export function sessionToken(): string {
  return createHmac("sha256", secret()).update(`admin:${adminPassword()}`).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkPassword(input: string): boolean {
  return adminConfigured() && safeEqual(clean(input), adminPassword());
}

export async function isAdmin(): Promise<boolean> {
  if (!adminConfigured()) return false;
  const store = await cookies();
  const value = store.get(ADMIN_COOKIE)?.value;
  return !!value && safeEqual(value, sessionToken());
}
