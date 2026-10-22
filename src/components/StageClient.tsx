"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type G = { key: string; ids: number[]; text: string; count: number; status: string; firstAt: string; variants: { text: string }[] };
type S = { mode: string; text?: string | null };
const SIZES = ["text-xl sm:text-2xl", "text-2xl sm:text-3xl", "text-3xl sm:text-4xl"];
const JSON_H = { "Content-Type": "application/json" };

export default function StageClient() {
  const [groups, setGroups] = useState<G[]>([]);
  const [state, setState] = useState<S | null>(null);
  const [tab, setTab] = useState<"waiting" | "answered">("waiting");
  const [size, setSize] = useState(1);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/questions", { cache: "no-store" });
      if (r.status === 401) { window.location.reload(); return; }
      if (!r.ok) throw new Error();
      const d = await r.json();
      setGroups(d.groups); setState(d.state); setErr("");
    } catch { setErr("Connection problem… retrying"); }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [load]);
  useEffect(() => { const s = Number(localStorage.getItem("stage-size")); if (s >= 0 && s <= 2) setSize(s); }, []);
  const resize = (n: number) => { const v = Math.min(2, Math.max(0, n)); setSize(v); localStorage.setItem("stage-size", String(v)); };

  const live = groups.find((g) => state?.mode === "question" && (g.text === state.text || g.variants.some((v) => v.text === state.text)));
  const waiting = useMemo(
    () => groups.filter((g) => g.status === "new" || g.status === "starred")
      .sort((a, b) => Number(b.status === "starred") - Number(a.status === "starred") || b.count - a.count || +new Date(a.firstAt) - +new Date(b.firstAt)),
    [groups],
  );
  const answered = groups.filter((g) => g.status === "answered");
  const list = tab === "waiting" ? waiting : answered;

  async function call(url: string, method: string, body: object) {
    await fetch(url, { method, headers: JSON_H, body: JSON.stringify(body) });
  }
  async function act(fn: () => Promise<void>) { setBusy(true); try { await fn(); } finally { setBusy(false); } load(); }
  const show = (g: G) => act(() => call("/api/admin/display", "POST", { mode: "question", text: g.text, askedCount: g.count }));
  const setStatus = (g: G, status: string) => act(() => call("/api/admin/questions", "PATCH", { ids: g.ids, status }));
  const finish = (goNext: boolean) => act(async () => {
    if (live) await call("/api/admin/questions", "PATCH", { ids: live.ids, status: "answered" });
    const n = goNext ? waiting.find((g) => g.key !== live?.key) : undefined;
    await call("/api/admin/display", "POST", n ? { mode: "question", text: n.text, askedCount: n.count } : { mode: "welcome" });
  });
  const hideScreen = () => act(() => call("/api/admin/display", "POST", { mode: "welcome" }));

  const tabBtn = (t: "waiting" | "answered", label: string) => (
    <button onClick={() => setTab(t)} className={`flex-1 rounded-full py-3 text-base font-bold sm:text-lg ${tab === t ? "bg-white text-[#06142b]" : "bg-white/10 text-white"}`}>{label}</button>
  );

  return (
    <main className="bg-scene min-h-[100dvh] pb-56">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#030b1c]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <h1 className="font-display text-2xl tracking-wide sm:text-3xl">STAGEMASTER</h1>
          <div className="flex items-center gap-1 text-sm">
            <button onClick={() => resize(size - 1)} className="h-10 w-10 rounded-full bg-white/10 font-bold" aria-label="Smaller text">A−</button>
            <button onClick={() => resize(size + 1)} className="h-10 w-10 rounded-full bg-white/10 text-lg font-bold" aria-label="Bigger text">A+</button>
          </div>
        </div>
        <div className="mx-auto mt-3 flex max-w-3xl gap-2">
          {tabBtn("waiting", `Waiting (${waiting.length})`)}
          {tabBtn("answered", `Answered (${answered.length})`)}
        </div>
        {err && <p className="mx-auto mt-2 max-w-3xl text-sm text-amber-300">{err}</p>}
      </header>

      <ul className="mx-auto mt-4 max-w-3xl space-y-3 px-4">
        {list.length === 0 && <li className="glass rounded-2xl p-8 text-center text-lg text-white/70">{tab === "waiting" ? "No questions waiting. New ones appear here automatically." : "Nothing answered yet."}</li>}
        {list.map((g) => {
          const isLive = live?.key === g.key;
          return (
            <li key={g.key} className={`glass rounded-2xl p-4 sm:p-5 ${isLive ? "ring-2 ring-sky-glow" : ""}`}>
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                {g.status === "starred" && <span className="rounded-full bg-amber-400/20 px-3 py-1 text-amber-200">⭐ Important</span>}
                {g.count > 1 && <span className="rounded-full bg-sky-glow/20 px-3 py-1 text-sky-100">🔥 Asked by {g.count}</span>}
                {isLive && <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-emerald-200">● ON SCREEN</span>}
              </div>
              <p className={`mt-2 font-semibold leading-snug ${SIZES[size]}`}>{g.text}</p>
              <div className="mt-4 flex gap-2">
                <button disabled={busy} onClick={() => show(g)} className="min-h-[52px] flex-1 rounded-xl bg-gradient-to-r from-sky-glow to-blue-600 text-base font-bold text-white active:scale-[0.99] disabled:opacity-50 sm:text-lg">▶ {tab === "waiting" ? "Show on screen" : "Show again"}</button>
                {tab === "waiting"
                  ? <button disabled={busy} onClick={() => setStatus(g, "answered")} className="min-h-[52px] rounded-xl bg-white/10 px-4 text-base font-bold disabled:opacity-50">✔ Answered</button>
                  : <button disabled={busy} onClick={() => setStatus(g, "new")} className="min-h-[52px] rounded-xl bg-white/10 px-4 text-base font-bold disabled:opacity-50">↩ Back</button>}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-sky-glow/40 bg-[#030b1c]/97 px-4 py-3 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">{state?.mode === "question" ? "On the big screen now" : "Big screen: QR / waiting slide"}</p>
          {state?.mode === "question" && <p className="mt-1 line-clamp-2 text-base font-semibold sm:text-lg">{state.text}</p>}
          <div className="mt-2 flex gap-2">
            <button disabled={busy || state?.mode !== "question"} onClick={() => finish(true)} className="min-h-[52px] flex-1 rounded-xl bg-emerald-500 text-base font-bold text-white disabled:opacity-40 sm:text-lg">✔ Answered → Next</button>
            <button disabled={busy || state?.mode !== "question"} onClick={() => finish(false)} className="min-h-[52px] rounded-xl bg-white/15 px-4 text-base font-bold disabled:opacity-40">✔ Done</button>
            <button disabled={busy || state?.mode !== "question"} onClick={hideScreen} className="min-h-[52px] rounded-xl bg-white/15 px-4 text-base font-bold disabled:opacity-40">Hide</button>
          </div>
        </div>
      </div>
    </main>
  );
}
