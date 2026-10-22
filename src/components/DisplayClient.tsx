"use client";

import { useEffect, useState } from "react";
import { EVENT, type SocialLink } from "@/config/event";
import { LeadNextWordmark, MinistryLogo, SocialIcon } from "./Brand";

interface State { mode: string; text: string | null; askedCount: number; updatedAt: string | null; }

export default function DisplayClient({
  askUrl,
  askQr,
  socials,
  transparent,
  showCornerQr,
}: {
  askUrl: string;
  askQr: string;
  socials: (SocialLink & { qr: string })[];
  transparent: boolean;
  showCornerQr: boolean;
}) {
  const [state, setState] = useState<State>({ mode: "welcome", text: null, askedCount: 0, updatedAt: null });

  useEffect(() => {
    if (transparent) {
      document.body.style.background = "transparent";
      document.documentElement.style.background = "transparent";
    }
    let alive = true;
    const tick = async () => {
      try {
        const r = await fetch("/api/display", { cache: "no-store" });
        const d = (await r.json()) as State;
        if (alive) setState((prev) => (prev.updatedAt === d.updatedAt && prev.mode === d.mode ? prev : d));
      } catch {}
    };
    tick();
    const t = setInterval(tick, 1500);
    return () => { alive = false; clearInterval(t); };
  }, [transparent]);

  const key = `${state.mode}-${state.updatedAt}`;

  if (state.mode === "blank") {
    return <main className={`h-screen w-screen ${transparent ? "bg-transparent" : "bg-black"}`} />;
  }

  return (
    <main className={`relative h-screen w-screen overflow-hidden ${transparent ? "" : "bg-[#06142b]"}`}>
      {!transparent && (
        <>
          <div className="absolute inset-0 animate-drift bg-[url('/images/hero.jpg')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#06142b]/70 via-[#06142b]/60 to-[#06142b]/90" />
        </>
      )}

      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-[3vw] pt-[2.5vw]">
        <MinistryLogo className="h-[4.5vw]" />
        <p className="font-semibold uppercase tracking-[0.5em] text-white/70 text-[1vw]">{EVENT.tagline}</p>
        <div className="font-display text-[2.2vw] tracking-wider">
          LEAD <span className="font-brush text-sky-glow">NEXT</span>
        </div>
      </div>

      <div key={key} className="relative z-[5] flex h-full w-full items-center justify-center px-[7vw]">
        {state.mode === "question" && state.text && <QuestionSlide text={state.text} count={state.askedCount} />}
        {state.mode === "socials" && <SocialsSlide socials={socials} />}
        {state.mode === "welcome" && <WelcomeSlide askQr={askQr} askUrl={askUrl} />}
      </div>

      {showCornerQr && state.mode === "question" && (
        <div className="absolute bottom-[2.5vw] right-[3vw] z-10 flex items-center gap-[1vw] rounded-[1vw] glass p-[0.8vw] pr-[1.4vw]">
          <div className="qr h-[6.5vw] w-[6.5vw] overflow-hidden rounded-[0.5vw] bg-white" dangerouslySetInnerHTML={{ __html: askQr }} />
          <div className="text-[0.95vw] leading-snug">
            <p className="font-bold uppercase tracking-widest">Scan to ask</p>
            <p className="text-white/70">{askUrl}</p>
          </div>
        </div>
      )}
    </main>
  );
}

function QuestionSlide({ text, count }: { text: string; count: number }) {
  const len = text.length;
  const size = len < 60 ? "4.6vw" : len < 120 ? "3.8vw" : len < 200 ? "3vw" : len < 300 ? "2.5vw" : "2.1vw";
  return (
    <div className="w-full max-w-[80vw] text-center">
      <div className="animate-rise flex items-center justify-center gap-[1vw]">
        <span className="h-[2px] w-[5vw] bg-sky-glow" />
        <span className="text-[1.3vw] font-semibold uppercase tracking-[0.5em] text-sky-300">Question</span>
        <span className="h-[2px] w-[5vw] bg-sky-glow" />
      </div>
      <div className="relative mt-[2.5vw] rounded-[2vw] border border-sky-glow/40 bg-[#020a1c]/90 px-[4vw] py-[3.5vw] shadow-[0_20px_80px_rgba(0,0,0,0.65)]">
        <span className="pointer-events-none absolute -left-[1.5vw] -top-[4.5vw] font-display text-[10vw] leading-none text-sky-glow/60">“</span>
        <p
          className="animate-rise font-bold leading-[1.25] text-white"
          style={{ fontSize: size, animationDelay: "120ms" }}
        >
          {text}
        </p>
      </div>
      {count > 1 && (
        <div
          className="animate-rise mx-auto mt-[3vw] inline-flex items-center gap-[0.8vw] rounded-full border border-sky-glow/50 bg-sky-glow/15 px-[1.8vw] py-[0.7vw] text-[1.4vw] font-semibold text-sky-100"
          style={{ animationDelay: "300ms" }}
        >
          🔥 Asked by {count} people
        </div>
      )}
    </div>
  );
}

function WelcomeSlide({ askQr, askUrl }: { askQr: string; askUrl: string }) {
  return (
    <div className="grid w-full grid-cols-[1.25fr_1fr] items-center gap-[5vw]">
      <div className="animate-rise flex flex-col items-center text-center">
        <p className="text-[1.2vw] font-semibold uppercase tracking-[0.5em] text-sky-300">{EVENT.kicker} · Q&amp;A</p>
        <div className="mt-[1vw]"><LeadNextWordmark size="xl" /></div>
        <p className="mt-[2vw] font-script text-[3.2vw] text-white/90">{EVENT.headline}</p>
        <p className="mt-[0.5vw] text-[1.1vw] uppercase tracking-[0.3em] text-white/60">{EVENT.verse}</p>
      </div>
      <div className="animate-rise flex flex-col items-center" style={{ animationDelay: "150ms" }}>
        <p className="font-display text-[3.2vw] leading-none tracking-wide">GOT A QUESTION?</p>
        <p className="mt-[0.6vw] text-[1.4vw] text-white/80">Scan &amp; ask anonymously</p>
        <div className="mt-[1.6vw] rounded-[1.5vw] bg-white p-[1vw] shadow-[0_0_80px_rgba(31,182,255,0.45)]">
          <div className="qr h-[22vw] w-[22vw]" dangerouslySetInnerHTML={{ __html: askQr }} />
        </div>
        <p className="mt-[1.2vw] rounded-full glass px-[1.6vw] py-[0.5vw] text-[1.3vw] font-semibold tracking-wide">{askUrl}</p>
      </div>
    </div>
  );
}

function SocialsSlide({ socials }: { socials: (SocialLink & { qr: string })[] }) {
  return (
    <div className="flex w-full flex-col items-center text-center">
      <p className="animate-rise text-[1.3vw] font-semibold uppercase tracking-[0.5em] text-sky-300">Thank you for coming</p>
      <h2 className="animate-rise mt-[0.8vw] font-display text-[6vw] leading-none tracking-wide">
        STAY <span className="text-gradient-sky">CONNECTED</span>
      </h2>
      <div className="brush-underline mt-[1vw] w-[22vw]" />
      <div className="mt-[3.5vw] flex flex-wrap justify-center gap-[2vw]">
        {socials.map((s, i) => (
          <div
            key={s.url}
            className="animate-rise glass flex w-[17vw] flex-col items-center rounded-[1.5vw] p-[1.4vw]"
            style={{ animationDelay: `${200 + i * 120}ms` }}
          >
            <div className="flex items-center gap-[0.6vw] text-[1.5vw] font-bold">
              <SocialIcon kind={s.kind} className="h-[1.9vw] w-[1.9vw] text-sky-glow" /> {s.label}
            </div>
            <div className="mt-[1vw] rounded-[0.8vw] bg-white p-[0.5vw]">
              <div className="qr h-[11vw] w-[11vw]" dangerouslySetInnerHTML={{ __html: s.qr }} />
            </div>
            <p className="mt-[0.9vw] text-[1.05vw] text-white/80 break-all">{s.handle}</p>
          </div>
        ))}
      </div>
      <p className="animate-rise mt-[3vw] text-[1.2vw] uppercase tracking-[0.3em] text-white/60" style={{ animationDelay: "700ms" }}>
        {EVENT.ministry} · {EVENT.venue}
      </p>
    </div>
  );
}
