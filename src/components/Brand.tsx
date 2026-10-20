"use client";

import { useState } from "react";
import { EVENT, type SocialKind } from "@/config/event";

export function MinistryLogo({ className = "h-12" }: { className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="grid aspect-square h-full place-items-center rounded-md bg-white font-display text-[#06142b]">R</span>
        <span className="text-[0.65em] font-semibold uppercase leading-tight tracking-widest text-white/80">
          Reachout<br />Ministries Intl.
        </span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={EVENT.logoPath} alt={EVENT.ministry} className={`logo-on-dark w-auto ${className}`} onError={() => setFailed(true)} />
  );
}

export function LeadNextWordmark({ size = "md" }: { size?: "sm" | "md" | "lg" | "xl" }) {
  const lead = { sm: "text-4xl", md: "text-6xl", lg: "text-8xl", xl: "text-[11rem]" }[size];
  const next = { sm: "text-2xl -mt-4", md: "text-4xl -mt-6", lg: "text-6xl -mt-10", xl: "text-8xl -mt-16" }[size];
  return (
    <div className="flex flex-col items-center leading-none select-none">
      <span
        className={`font-display tracking-wide ${lead}`}
        style={{
          backgroundImage: "url(/images/hero.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          WebkitTextStroke: "1px rgba(255,255,255,0.35)",
          filter: "drop-shadow(0 6px 20px rgba(0,0,0,0.45))",
        }}
      >
        LEAD
      </span>
      <span className={`font-brush -rotate-6 text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] ${next}`}>NEXT</span>
      <div className="brush-underline mt-1 w-2/3" />
    </div>
  );
}

export function SocialIcon({ kind, className = "h-6 w-6" }: { kind: SocialKind; className?: string }) {
  const common = { className, fill: "currentColor", viewBox: "0 0 24 24", "aria-hidden": true } as const;
  switch (kind) {
    case "instagram":
      return (
        <svg {...common}>
          <path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1.1.4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1.1.4-2.2.4-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1.1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1.1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 4.6a5.2 5.2 0 100 10.4 5.2 5.2 0 000-10.4zm0 8.6a3.4 3.4 0 110-6.8 3.4 3.4 0 010 6.8zm5.4-9.9a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common}>
          <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2 31 31 0 000 12a31 31 0 00.5 5.8 3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common}>
          <path d="M24 12a12 12 0 10-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v2.9h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0024 12z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg {...common}>
          <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5 2.5 1 3 .8 3.5.7.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1112 21.8zM12 0a12 12 0 00-10.3 18L0 24l6.2-1.6A12 12 0 1012 0z" />
        </svg>
      );
    case "spotify":
      return (
        <svg {...common}>
          <path d="M12 0a12 12 0 100 24 12 12 0 000-24zm5.5 17.3c-.2.4-.7.5-1 .3-2.8-1.7-6.4-2.1-10.6-1.1-.4.1-.8-.2-.9-.6-.1-.4.2-.8.6-.9 4.6-1 8.5-.6 11.6 1.3.4.2.5.7.3 1zm1.5-3.3c-.3.4-.8.6-1.3.3-3.2-2-8.1-2.6-11.9-1.4-.5.1-1-.1-1.1-.6-.1-.5.1-1 .6-1.1 4.3-1.3 9.7-.7 13.4 1.6.4.2.6.8.3 1.2zm.1-3.4C15.3 8.3 8.9 8.1 5.2 9.2c-.6.2-1.2-.2-1.4-.7-.2-.6.2-1.2.7-1.4 4.3-1.3 11.3-1 15.8 1.6.5.3.7 1 .4 1.5-.3.5-1 .7-1.6.4z" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="M18.2 2.3h3.4l-7.4 8.4 8.7 11.5h-6.8l-5.3-7-6.1 7H1.3l7.9-9L.8 2.3h7l4.8 6.4 5.6-6.4zm-1.2 17.9h1.9L7 4.2H5l12 16z" />
        </svg>
      );
    default:
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={1.8}>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />
        </svg>
      );
  }
}
