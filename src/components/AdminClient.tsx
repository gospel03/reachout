"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MinistryLogo } from "./Brand";

interface Variant { id: number; text: string; status: string; createdAt: string; }
interface Group {
  key: string; ids: number[]; text: string; count: number; status: string;
  firstAt: string; lastAt: string; variants: Variant[];
}
interface ScreenState { mode: string; text: string | null; askedCount: number; accepting: boolean; }

type Filter = "open" | "starred" | "answered" | "hidden" | "all";
type Sort = "popular" | "newest" | "oldest";

const timeAgo = (iso: string) => {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
};

export default function AdminClient({ defaultPassword }: { defaultPassword: boolean }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [total, setTotal] = useState(0);
  const [screen, setScreen] = useState<ScreenState | null>(null);
  const [filter, setFilter] = useState<Filter>("open");
  const [sort, setSort] = useState<Sort>("popular");
  const [search, setSearch] = useState("");
  const [threshold, setThreshold] = useState(0.5);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState<{ key: string; text: string } | null>(null);
  const [custom, setCustom] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState("");
  const [loadError, setLoadError] = useState("");

  const load = useCallback(async () => {
    const r = await fetch(`/api/admin/questions?threshold=${threshold}`, { cache: "no-store" });
    if (r.status === 401) { window.location.reload(); return; }
    if (!r.ok) { setLoadError("Server error. Check DATABASE_URL in Vercel (see /api/health)."); setLoaded(true); return; }
    const d = await r.json();
    setLoadError("");
    setGroups(d.groups); setTotal(d.total); setScreen(d.state); setLoaded(true);
  }, [threshold]);

  useEffect(() => {
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [load]);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1800); };

  async function setStatus(ids: number[], status: string) {
    await fetch("/api/admin/questions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids, status }) });
    load();
  }
  async function remove(ids: number[]) {
    if (!confirm("Delete permanently?")) return;
    await fetch("/api/admin/questions", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) });
    load();
  }
  async function clearAll() {
    if (!confirm("Delete ALL questions? This cannot be undone.")) return;
    if (prompt('Type "DELETE" to confirm') !== "DELETE") return;
    await fetch("/api/admin/questions", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) });
    load();
  }
  async function pushScreen(body: Record<string, unknown>, msg?: string) {
    await fetch("/api/admin/display", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (msg) flash(msg);
    load();
  }
  const showQuestion = (text: string, count: number) => pushScreen({ mode: "question", text, askedCount: count }, "📺 Now on screen");

  function exportCsv() {
    const rows = [["group", "asked_count", "status", "question", "time"]];
    groups.forEach((g, i) => g.variants.forEach((v) => rows.push([String(i + 1), String(g.count), v.status, v.text, v.createdAt])));
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `leadnext-questions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  const counts = useMemo(() => {
    const c = { open: 0, starred: 0, answered: 0, hidden: 0, all: groups.length };
    groups.forEach((g) => {
      if (g.status === "new" || g.status === "starred") c.open++;
      if (g.status === "starred") c.starred++;
      if (g.status === "answered") c.answered++;
      if (g.status === "hidden") c.hidden++;
    });
    return c;
  }, [groups]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = groups.filter((g) => {
      if (filter === "open" && !(g.status === "new" || g.status === "starred")) return false;
      if (filter !== "open" && filter !== "all" && g.status !== filter) return false;
      if (q && !g.variants.some((v) => v.text.toLowerCase().includes(q))) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "popular") return b.count - a.count || +new Date(b.lastAt) - +new Date(a.lastAt);
      if (sort === "newest") return +new Date(b.lastAt) - +new Date(a.lastAt);
      return +new Date(a.firstAt) - +new Date(b.firstAt);
    });
    if (filter === "open") list.sort((a, b) => Number(b.status === "starred") - Number(a.status === "starred"));
    return list;
  }, [groups, filter, sort, search]);

  const onScreenText = screen?.mode === "question" ? screen.text : null;

  return (
    <main className="min-h-screen bg-[#050f22] text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#050f22]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <MinistryLogo className="h-9" />
          <div className="mr-auto">
            <h1 className="font-display text-xl tracking-wide">LEAD NEXT · Q&amp;A CONTROL</h1>
            <p className="text-xs text-white/50">{total} questions · {groups.length} unique</p>
          </div>
          <button
            onClick={() => pushScreen({ accepting: !screen?.accepting }, screen?.accepting ? "Questions paused" : "Questions open")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${screen?.accepting ? "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/40" : "bg-red-500/20 text-red-200 ring-1 ring-red-400/40"}`}
          >
            {screen?.accepting ? "● Accepting questions" : "⏸ Questions paused"}
          </button>
          <a href="/display" target="_blank" className="rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/15">Open screen ↗</a>
          <a href="/api/qr" target="_blank" className="rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/15">QR image ↓</a>
          <button onClick={exportCsv} className="rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/15">Export CSV</button>
          <button
            onClick={async () => { await fetch("/api/admin/login", { method: "DELETE" }); window.location.reload(); }}
            className="rounded-full px-3 py-2 text-sm text-white/60 hover:text-white"
          >
            Logout
          </button>
        </div>
      </header>

      {defaultPassword && (
        <div className="mx-auto mt-3 max-w-7xl px-4">
          <p className="rounded-xl bg-amber-500/15 px-4 py-2 text-sm text-amber-100">⚠️ Using the default password. Set ADMIN_PASSWORD in your environment before the event.</p>
        </div>
      )}

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[1fr_360px]">
        {/* Questions */}
        <section>
          <div className="flex flex-wrap items-center gap-2">
            {(["open", "starred", "answered", "hidden", "all"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3.5 py-1.5 text-sm capitalize ${filter === f ? "bg-sky-glow text-[#06142b] font-semibold" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
              >
                {f} <span className="opacity-60">{counts[f]}</span>
              </button>
            ))}
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="ml-auto rounded-full bg-white/5 px-3 py-1.5 text-sm">
              <option value="popular">Most asked</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions…"
              className="min-w-[200px] flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-white/40 focus:border-sky-glow focus:outline-none"
            />
            <label className="flex items-center gap-2 text-xs text-white/60" title="How similar questions must be to be grouped together">
              Group similar:
              <span>loose</span>
              <input type="range" min={0.3} max={0.85} step={0.05} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="accent-sky-400" />
              <span>strict</span>
            </label>
          </div>

          <div className="mt-4 space-y-3">
            {!loaded && <p className="text-white/50">Loading…</p>}
            {loadError && <p className="rounded-xl bg-red-500/15 p-3 text-sm text-red-200">{loadError}</p>}
            {loaded && visible.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-white/50">
                No questions here yet. Share the QR code! 📱
              </div>
            )}
            {visible.map((g) => {
              const live = onScreenText !== null && g.variants.some((v) => v.text === onScreenText) || onScreenText === g.text;
              const isEditing = editing?.key === g.key;
              return (
                <article
                  key={g.key}
                  className={`rounded-2xl border p-4 transition ${live ? "border-sky-glow bg-sky-glow/10 shadow-[0_0_30px_rgba(31,182,255,0.2)]" : g.status === "starred" ? "border-amber-400/40 bg-amber-400/5" : "border-white/10 bg-white/[0.03]"} ${g.status === "answered" || g.status === "hidden" ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-bold ${g.count > 1 ? "bg-gradient-to-br from-orange-400 to-pink-500" : "bg-white/10"}`}
                      title={`${g.count} people asked this`}
                    >
                      ×{g.count}
                    </div>
                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <textarea
                          autoFocus
                          value={editing.text}
                          onChange={(e) => setEditing({ key: g.key, text: e.target.value })}
                          rows={3}
                          className="w-full rounded-xl border border-sky-glow/50 bg-black/30 p-2 text-[15px] focus:outline-none"
                        />
                      ) : (
                        <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{g.text}</p>
                      )}
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/50">
                        <span>{timeAgo(g.lastAt)}</span>
                        {live && <span className="font-semibold text-sky-300">● LIVE ON SCREEN</span>}
                        {g.status !== "new" && <span className="capitalize">{g.status === "starred" ? "⭐ starred" : g.status}</span>}
                        {g.count > 1 && (
                          <button onClick={() => setExpanded((x) => ({ ...x, [g.key]: !x[g.key] }))} className="text-sky-300 hover:underline">
                            {expanded[g.key] ? "Hide" : "See"} {g.count} wordings
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {expanded[g.key] && (
                    <ul className="ml-14 mt-3 space-y-1.5 border-l border-white/10 pl-3">
                      {g.variants.map((v) => (
                        <li key={v.id} className="group flex items-start gap-2 text-sm text-white/75">
                          <span className="flex-1">“{v.text}”</span>
                          <button onClick={() => showQuestion(v.text, g.count)} className="shrink-0 text-xs text-sky-300 opacity-70 hover:opacity-100">show this</button>
                          <button onClick={() => remove([v.id])} className="shrink-0 text-xs text-red-300 opacity-50 hover:opacity-100">delete</button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="ml-14 mt-3 flex flex-wrap gap-2">
                    {isEditing ? (
                      <>
                        <Btn primary onClick={() => { showQuestion(editing.text, g.count); setEditing(null); }}>📺 Show edited</Btn>
                        <Btn onClick={() => setEditing(null)}>Cancel</Btn>
                      </>
                    ) : (
                      <>
                        <Btn primary onClick={() => showQuestion(g.text, g.count)}>📺 Show on screen</Btn>
                        <Btn onClick={() => setEditing({ key: g.key, text: g.text })}>✏️ Edit &amp; show</Btn>
                        {g.status === "starred" ? (
                          <Btn onClick={() => setStatus(g.ids, "new")}>☆ Unstar</Btn>
                        ) : (
                          <Btn onClick={() => setStatus(g.ids, "starred")}>⭐ Star</Btn>
                        )}
                        {g.status === "answered" || g.status === "hidden" ? (
                          <Btn onClick={() => setStatus(g.ids, "new")}>↺ Reopen</Btn>
                        ) : (
                          <>
                            <Btn onClick={() => setStatus(g.ids, "answered")}>✓ Answered</Btn>
                            <Btn onClick={() => setStatus(g.ids, "hidden")}>🙈 Hide</Btn>
                          </>
                        )}
                        <Btn danger onClick={() => remove(g.ids)}>Delete</Btn>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Screen control */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">Big screen now</h2>
            <div className="mt-3 aspect-video overflow-hidden rounded-xl border border-white/10 bg-[url('/images/hero.jpg')] bg-cover bg-center">
              <div className="grid h-full w-full place-items-center bg-[#06142b]/75 p-4 text-center">
                {screen?.mode === "question" && <p className="line-clamp-5 text-sm font-semibold">{screen.text}</p>}
                {screen?.mode === "welcome" && <p className="font-display text-2xl">LEAD NEXT<br /><span className="text-sm font-sans font-normal text-white/70">Scan-to-ask QR slide</span></p>}
                {screen?.mode === "socials" && <p className="font-display text-2xl">STAY CONNECTED<br /><span className="text-sm font-sans font-normal text-white/70">Social media slide</span></p>}
                {screen?.mode === "blank" && <p className="text-sm text-white/40">Blank screen</p>}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <ModeBtn active={screen?.mode === "welcome"} onClick={() => pushScreen({ mode: "welcome" }, "QR slide on screen")}>📱 Scan QR</ModeBtn>
              <ModeBtn active={screen?.mode === "socials"} onClick={() => pushScreen({ mode: "socials" }, "Socials on screen")}>🌐 Socials</ModeBtn>
              <ModeBtn active={screen?.mode === "blank"} onClick={() => pushScreen({ mode: "blank" }, "Screen blanked")}>⬛ Blank</ModeBtn>
            </div>
            {screen?.mode === "question" && (
              <button
                onClick={() => {
                  const g = groups.find((x) => x.text === screen.text || x.variants.some((v) => v.text === screen.text));
                  if (g) setStatus(g.ids, "answered");
                  pushScreen({ mode: "welcome" }, "Marked answered");
                }}
                className="mt-2 w-full rounded-xl bg-emerald-500/20 py-2 text-sm font-semibold text-emerald-200 ring-1 ring-emerald-400/30 hover:bg-emerald-500/30"
              >
                ✓ Done — mark answered &amp; back to QR
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">Show your own text</h2>
            <textarea
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              rows={3}
              placeholder="e.g. a discussion prompt…"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-2 text-sm placeholder:text-white/30 focus:border-sky-glow focus:outline-none"
            />
            <button
              disabled={!custom.trim()}
              onClick={() => showQuestion(custom.trim(), 1)}
              className="mt-2 w-full rounded-xl bg-sky-glow/90 py-2 text-sm font-semibold text-[#06142b] disabled:opacity-40"
            >
              📺 Show on screen
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-relaxed text-white/60">
            <h2 className="mb-2 font-semibold uppercase tracking-[0.25em] text-white/50">FreeShow tip</h2>
            Add a <b>Website</b> item in FreeShow pointing to <code className="text-sky-300">/display</code> (or <code className="text-sky-300">/display?bg=transparent</code> to overlay on your own background). It updates live when you click “Show on screen”.
          </div>

          <button onClick={clearAll} className="w-full rounded-xl border border-red-400/30 py-2 text-xs text-red-300 hover:bg-red-500/10">
            Delete all questions (reset)
          </button>
        </aside>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#06142b] shadow-xl animate-pop">
          {toast}
        </div>
      )}
    </main>
  );
}

function Btn({ children, onClick, primary, danger }: { children: React.ReactNode; onClick: () => void; primary?: boolean; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
        primary ? "bg-gradient-to-r from-sky-glow to-blue-600 text-white" : danger ? "text-red-300 hover:bg-red-500/10" : "bg-white/8 bg-white/10 text-white/80 hover:bg-white/15"
      }`}
    >
      {children}
    </button>
  );
}

function ModeBtn({ children, onClick, active }: { children: React.ReactNode; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl py-2 text-xs font-semibold ${active ? "bg-sky-glow text-[#06142b]" : "bg-white/10 text-white/80 hover:bg-white/15"}`}
    >
      {children}
    </button>
  );
}
