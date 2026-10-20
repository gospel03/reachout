# LEAD NEXT · Anonymous Q&A (Youth Meet)

Free, anonymous Q&A for your Youth Meet. Built with **Next.js** and **Supabase (Postgres)**, hosted free on **Vercel**.

| Page | Who | What it does |
|---|---|---|
| `/` | Everyone (QR code) | Chat-style box: type a question → Send → "Ask another question" + your social links. No login, no names. |
| `/admin` | **Only you** (password) | All questions, **similar questions grouped together** (×count), Star / Answered / Hide / Delete, Edit & show, pause questions, CSV export, switch the big screen. |
| `/display` | Projector / FreeShow | Shows the QR slide, the selected question (with "Asked by N people"), the Socials slide, or a blank screen. Updates live. |
| `/api/qr` | You | Downloads a high-res PNG QR code for your slides/posters. |

---

## 1. Set up Supabase (free, about 3 min)
1. Go to https://supabase.com → **New project** (region: Mumbai / ap-south-1). Save the **database password**.
2. Open **Project Settings → Database → Connection string → "Transaction pooler"** (port **6543**). Copy it.
3. Swap `[YOUR-PASSWORD]` for your DB password. That string is your `DATABASE_URL`.
4. The tables are created automatically on first use. (Optional: run `supabase/schema.sql` in the SQL Editor.)

## 2. Secrets (the "ini" file = `.env.local`)
```bash
cp .env.example .env.local      # then edit .env.local
```
| Name | What | Where to get it |
|---|---|---|
| `DATABASE_URL` | Supabase DB link | Supabase → **Connect** → **Transaction pooler** (port 6543). Never the "Direct connection". |
| `ADMIN_PASSWORD` | Your `/admin` password (min 6 chars) | You choose. **No default password exists.** |
| `SESSION_SECRET` | Signs the login cookie | Any long random text |

`.env.local` is git-ignored, so it never goes to GitHub. Edit **`src/config/event.ts`** for social links/event text.
Logo and background are already in `public/brand/logo.png` and `public/images/hero.jpg`.

## 3. Run locally (optional)
```bash
npm install && npm run dev      # http://localhost:3000   /admin   /api/health
```

## 4. Deploy free on Vercel
1. Upload the folder to a **private** GitHub repo (do not upload `.env.local`).
2. vercel.com → **Add New → Project** → import the repo.
3. Add `DATABASE_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET` under **Environment Variables** → **Deploy**.
4. Open `https://YOUR-APP.vercel.app/api/health`. You want `adminPasswordSet`, `databaseUrlSet`, `databaseOk` all `true`.
5. If you change any variable later, click **Redeploy**; old deployments keep the old values.

### Can't log in? Check in this order
1. `/api/health` → `adminPasswordSet: false` means the variable is missing or under 6 characters. Add it, **Redeploy**.
2. Old versions had a default password; that is removed now. Use exactly what you set in `ADMIN_PASSWORD` (spaces/quotes around it are ignored).
3. `databaseOk: false` → wrong `DATABASE_URL`. Use the pooler URL; if your DB password has symbols like `@ # / :`, reset it to letters+numbers.
4. After 10 wrong tries you are locked for 5 minutes.

## 5. On the day
- **QR code:** open `https://your-app.vercel.app/api/qr` → save the PNG → add it to FreeShow or print it. You can also just show the built-in **📱 Scan QR** slide.
- **FreeShow:** create a slide → add a **Website** item → URL `https://your-app.vercel.app/display`.
  - Want your own background? Use `/display?bg=transparent`.
  - To hide the small corner QR on question slides, use `/display?qr=0`.
  - Or open `/display` full-screen (F11) in a browser on the projector output.
- **Running Q&A:** open `/admin` on your laptop or phone → click **📺 Show on screen** → discuss → **✓ Done**. At the end, click **🌐 Socials**.
- **Similar questions:** grouped automatically (for example, "how do I know God's plan for me?" and "how to find my calling"). Use the **loose ↔ strict** slider to tune the grouping, and "See N wordings" to read each version.

## Privacy
- No names, emails, IPs or device IDs are stored. Only the question text and time.
- Attendees can only see their own questions, and only on their own phone (saved locally).
- Only someone with `ADMIN_PASSWORD` can read the questions.
