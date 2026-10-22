import type { Metadata } from "next";
import { adminConfigured, isStaff } from "@/lib/auth";
import AdminLogin from "@/components/AdminLogin";
import StageClient from "@/components/StageClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Stagemaster · LEAD NEXT", robots: { index: false, follow: false } };

export default async function StagePage() {
  if (!(await isStaff()))
    return <AdminLogin notConfigured={!adminConfigured()} title="STAGEMASTER" hint="Stage team only." placeholder="Stage password" />;
  return <StageClient />;
}
