import { getDisplayState } from "@/lib/state";

export const dynamic = "force-dynamic";

// Public: only exposes what is currently on the big screen.
export async function GET() {
  try {
    const s = await getDisplayState();
    return Response.json(
      {
        mode: s?.mode ?? "welcome",
        text: s?.mode === "question" ? s.text : null,
        askedCount: s?.mode === "question" ? s.askedCount : 0,
        accepting: s?.accepting ?? true,
        updatedAt: s?.updatedAt ?? null,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ mode: "welcome", text: null, askedCount: 0, accepting: true }, { status: 200 });
  }
}
