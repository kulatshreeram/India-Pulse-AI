# Deployment Guide — India Pulse AI

This guide covers deploying the full stack: **Next.js frontend on Vercel** + **FastAPI backend on Railway**.

---

## Prerequisites

- GitHub account with the repo pushed
- [Vercel account](https://vercel.com) (free tier works)
- [Railway account](https://railway.app) (free tier works)
- Your API keys: `GEMINI_API_KEY`, `GNEWS_API_KEY`

---

## Part 1 — Deploy Backend to Railway

### Step 1: Create a Railway project

1. Go to [railway.app](https://railway.app) → **New Project**
2. Select **Deploy from GitHub repo**
3. Choose your `India-Pulse-AI` repository
4. Railway auto-detects Python via `Procfile`

### Step 2: Configure environment variables

In Railway dashboard → **Variables**, add:

```
GEMINI_API_KEY=your_gemini_key_here
GNEWS_API_KEY=your_gnews_key_here
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
DATABASE_URL=  (leave empty to use SQLite, or add PostgreSQL)
```

### Step 3: Add PostgreSQL (optional but recommended)

1. In Railway → **New Service** → **PostgreSQL**
2. Copy the `DATABASE_URL` from the PostgreSQL service
3. Add it to your environment variables

### Step 4: Verify deployment

Railway will show a deployment URL like `https://india-pulse-ai-production.up.railway.app`.

Test it: `curl https://your-backend.railway.app/` → should return `{"status":"ok"}`

---

## Part 2 — Deploy Frontend to Vercel

### Step 1: Import project

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import from GitHub → select `India-Pulse-AI`
3. Framework preset: **Next.js** (auto-detected)

### Step 2: Configure environment variables

In Vercel → **Settings** → **Environment Variables**, add:

```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
BACKEND_URL=https://your-backend.railway.app
```

### Step 3: Deploy

Click **Deploy**. Vercel builds and deploys automatically.

Your app is live at `https://india-pulse-ai.vercel.app` 🎉

---

## Part 3 — Connect Frontend → Backend

In your frontend `.env.local` (or Vercel env vars), ensure the Next.js API routes proxy to your Railway backend.

Check `src/app/api/news/route.ts` — the `BACKEND` variable should point to your Railway URL:

```typescript
const BACKEND = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
```

Update all API proxy files to use this env var pattern.

---

## Part 4 — Custom Domain (Optional)

1. **Vercel**: Project Settings → Domains → Add your domain
2. **Railway**: Service Settings → Networking → Custom Domain

---

## Monitoring & Logs

- **Vercel**: Functions tab shows API route logs and performance
- **Railway**: Deployment logs show FastAPI request logs (structured via our logging middleware)
- **Uptime**: Use [UptimeRobot](https://uptimerobot.com) (free) to monitor your Railway backend URL

---

## Local Development

```bash
# Terminal 1 — Backend
cd "India-Pulse-AI"
uvicorn backend.app.main:app --reload --port 8000

# Terminal 2 — Frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Map tiles not loading | Check browser console for CORS errors on tile CDN |
| No articles showing | Verify `GNEWS_API_KEY` is set in Railway env vars |
| AI chat not working | Verify `GEMINI_API_KEY` is set and has credits |
| 429 Rate Limited | Wait 60s — rate limiter resets per minute |
| CORS error | Add frontend URL to `ALLOWED_ORIGINS` in Railway |
