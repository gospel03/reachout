"use client";

import { useState } from "react";
import { MinistryLogo } from "./Brand";

export default function AdminLogin({ notConfigured }: { notConfigured: boolean }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });
      if (res.ok) { window.location.reload(); return; }
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error || "Login failed. Try again.");
    } catch {
      setError("Cannot reach the server. Check your internet and try again.");
    }
    setBusy(false);
  }

  return (
    <main className="bg-scene grid min-h-screen place-items-center px-6">
      <form onSubmit={login} className="glass w-full max-w-sm rounded-3xl p-8 animate-rise">
        <MinistryLogo className="h-12" />
        <h1 className="mt-6 font-display text-3xl tracking-wide">Q&amp;A CONTROL ROOM</h1>
        <p className="mt-1 text-sm text-white/60">Organisers only.</p>
        <input
          type="password"
          autoFocus
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          className="mt-6 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-sky-glow focus:outline-none"
        />
        {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
        <button
          disabled={busy || !password}
          className="mt-4 w-full rounded-2xl bg-gradient-to-r from-sky-glow to-blue-600 py-3 font-semibold disabled:opacity-50"
        >
          {busy ? "Checking…" : "Enter"}
        </button>
        {notConfigured && (
          <p className="mt-4 rounded-xl bg-red-500/15 p-3 text-xs text-red-100">
            Admin login is off: <b>ADMIN_PASSWORD</b> is not set on the server. Add it (Vercel → Settings → Environment Variables), then <b>Redeploy</b>.
          </p>
        )}
      </form>
    </main>
  );
}
