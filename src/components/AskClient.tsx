"use client";

import { useEffect, useRef, useState } from "react";
import { EVENT, type SocialLink } from "@/config/event";
import { LeadNextWordmark, MinistryLogo, SocialIcon } from "./Brand";

interface Sent { text: string; at: number; }
const STORE_KEY = "leadnext-my-questions";
const IDEAS = [
  "How do I know God's calling for my life?",
  "How can I lead when I feel unqualified?",
  "How do I stay strong in faith at college or work?",
  "What does it mean to be a young leader?",
  "How do I handle doubts about my faith?",
];

export default function AskClient({ socials, maxLength }: { socials: SocialLink[]; maxLength: number }) {
  const [text, setText] = useState("");
  const [sent, setSent] = useState<Sent[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [justSent, setJustSent] = useState(false);
  const [accepting, setAccepting] = useState(true);
  const [idea, setIdea] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "[]") as Sent[];
      if (Array.isArray(saved)) setSent(saved.slice(-20));
    } catch {}
    const check = () =>
      fetch("/api/display", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => setAccepting(d.accepting !== false))
        .catch(() => {});
    check();
    const t = setInterval(check, 15000);
    const r = setInterval(() => setIdea((i) => (i + 1) % IDEAS.length), 3500);
    return () => { clearInterval(t); clearInterval(r); };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [sent, justSent]);

  async function submit() {
    const q = text.trim();
    if (q.length < 3 || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: q }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not send. Try again.");
      const next = [...sent, { text: q, at: Date.now() }].slice(-20);
      setSent(next);
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
      setText("");
      setJustSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send.");
    } finally {
      setBusy(false);
    }
  }

  function askAnother() {
    setJustSent(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <main className="bg-scene relative isolate flex min-h-[100dvh] flex-col overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
      </div>
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-5">
        <MinistryLogo className="h-14" />
        <span className="rounded-full border border-sky-glow/40 bg-sky-glow/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.18em] text-sky-200">
          {EVENT.kicker}
        </span>
      </header>

      <section className="mt-6 flex flex-col items-center px-6 text-center animate-rise">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">{EVENT.tagline}</p>
        <div className="mt-3"><div className="animate-bob"><LeadNextWordmark size="lg" /></div></div>
        <h1 className="shimmer mt-6 text-3xl font-extrabold">Got a question? Ask it here.</h1>
        <p className="mt-2 flex items-center gap-1.5 text-base text-white/80">
          <LockIcon /> 100% anonymous — no name, no login.
        </p>
      </section>

      {/* Chat area */}
      <section className="mx-auto mt-6 flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-56">
        <Bubble side="left">Your Identity
          Hey! 👋 Type anything you&apos;d like to ask — about faith, leadership, life, calling…  is never recorded or revealed.
        </Bubble>
        {sent.map((s, i) => (
          <div key={s.at + "-" + i} className="flex flex-col items-end gap-1 animate-pop">
            <Bubble side="right">{s.text}</Bubble>
            <span className="pr-2 text-[11px] text-white/50">
              Sent anonymously ✓✓ · {new Date(s.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        ))}

        {justSent && (
          <div className="glass mt-2 rounded-3xl p-5 text-center animate-pop">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-sky-glow to-blue-600 text-2xl shadow-lg shadow-sky-500/30">
              🙌
            </div>
            <h2 className="mt-3 text-2xl font-bold">Question received!</h2>
            <p className="mt-1 text-base text-white/80">Keep an eye on the screen — it might be picked next.</p>
            <button
              onClick={askAnother}
              className="mt-4 w-full rounded-2xl bg-white py-4 text-lg font-semibold text-[#06142b] transition active:scale-[0.98]"
            >
              Ask another question
            </button>
            {socials.length > 0 && (
              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">Stay connected</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {socials.map((s) => (
                    <a
                      key={s.url}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                    >
                      <SocialIcon kind={s.kind} className="h-4 w-4" /> {s.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={endRef} />
      </section>

      {/* Composer */}
      {!justSent && (
        <div className="fixed inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#06142b] via-[#06142b]/95 to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8">
          <div className="mx-auto max-w-xl">
            {!accepting ? (
              <div className="glass rounded-3xl p-4 text-center text-sm text-white/80">
                ⏸️ Questions are paused right now. Please check back in a bit!
              </div>
            ) : (
              <>
                {error && <p className="mb-2 rounded-xl bg-red-500/20 px-3 py-2 text-sm text-red-100">{error}</p>}
                <div className="glass flex items-end gap-2 rounded-3xl p-2.5 pl-5 shadow-2xl shadow-black/40">
                  <textarea
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.target.value.slice(0, maxLength))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
                    }}
                    rows={Math.min(5, Math.max(1, Math.ceil(text.length / 34)))}
                    placeholder={IDEAS[idea]}
                    className="max-h-40 flex-1 resize-none bg-transparent py-3 text-lg text-white placeholder:text-white/45 focus:outline-none"
                  />
                  <button
                    onClick={submit}
                    disabled={busy || text.trim().length < 3}
                    aria-label="Send"
                    className={`grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-glow to-blue-600 text-white shadow-lg shadow-sky-500/30 transition active:scale-95 disabled:opacity-40 ${text.trim().length >= 3 && !busy ? "pulse-ring" : ""}`}
                  >
                    {busy ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M3.4 20.4l17.4-7.5c.8-.4.8-1.5 0-1.8L3.4 3.6c-.7-.3-1.4.3-1.3 1l.9 5.6c.1.5.5.8 1 .9L13 12l-9 .9c-.5.1-.9.4-1 .9l-.9 5.6c-.1.7.6 1.3 1.3 1z" /></svg>
                    )}
                  </button>
                </div>
                <p className="mt-2 text-center text-xs text-white/55">
                  {text.length}/{maxLength} · Your identity is never recorded
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function Bubble({ side, children }: { side: "left" | "right"; children: React.ReactNode }) {
  return side === "left" ? (
    <div className="glass max-w-[85%] self-start rounded-3xl rounded-bl-md px-4 py-3 text-[18px] leading-relaxed text-white/90">
      {children}
    </div>
  ) : (
    <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-3xl rounded-br-md bg-gradient-to-br from-sky-glow to-blue-600 px-5 py-3.5 text-[18px] leading-relaxed text-white shadow-lg shadow-sky-500/20">
      {children}
    </div>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" />
    </svg>
  );
}
