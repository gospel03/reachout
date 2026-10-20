import type { Metadata } from "next";
import { adminConfigured, isAdmin } from "@/lib/auth";
import AdminLogin from "@/components/AdminLogin";
import AdminClient from "@/components/AdminClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Q&A Admin · LEAD NEXT", robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (!(await isAdmin())) return <AdminLogin notConfigured={!adminConfigured()} />;
  return <AdminClient defaultPassword={false} />;
}
