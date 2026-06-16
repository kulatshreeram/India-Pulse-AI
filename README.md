# India-Pulse-AI
# ⚡ India Pulse AI

> Real-time AI-powered news intelligence for India — explore geo-tagged news on an interactive map, get AI summaries, and ask an AI assistant anything about the latest stories from all 28 states.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## Features

- 🗺️ **Interactive India Map** — Geo-tagged news across all 28 states & UTs. Click any state to surface local stories.
- 🤖 **AI News Assistant** — Ask *"What happened in Maharashtra today?"* and get a sourced, synthesized answer.
- 📊 **Live Analytics** — Sentiment trends, trending topics, category breakdowns, and most active states.
- 🔴 **Breaking News Ticker** — Real-time scrolling ticker for high-priority stories.
- 🌐 **Multilingual** — AI summaries in English, Hindi, and Marathi.
- 📈 **Impact Scores** — Every article rated for local, state, national, and global impact (0–100).

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Map | React Leaflet, Leaflet MarkerCluster |
| State Management | Zustand, TanStack Query |
| Animations | Framer Motion |
| Charts | Recharts |
| Backend | FastAPI, SQLAlchemy, SQLite |
| AI | OpenAI GPT-4o |
| Auth | Clerk |

---

## Getting Started

**1. Clone the repo**
```bash
git clone https://github.com/kulatshreeram/India-Pulse-AI.git
cd India-Pulse-AI
```

**2. Install frontend dependencies**
```bash
npm install
```

**3. Set up environment variables**
```bash
cp .env.example .env.local
# Add your OPENAI_API_KEY and CLERK keys
```

**4. Start the backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**5. Start the frontend**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the backend seeds itself automatically on first run.

---

## Project Structure

```
India-Pulse-AI/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── dashboard/    # Interactive map view
│   │   ├── assistant/    # AI chat interface
│   │   └── analytics/    # Charts & trends
│   ├── components/       # UI components (map, news cards, navbar)
│   ├── hooks/            # useNews, useAnalytics
│   ├── lib/              # India states data, mock data, utils
│   └── types/            # Full TypeScript type definitions
└── backend/
    └── app/
        ├── routes/       # /api/news, /api/states, /api/search
        ├── services/     # News seeding & data service
        ├── models/       # SQLAlchemy models
        └── schemas/      # Pydantic schemas
```

---

## Roadmap

- [ ] Live news API integration (NewsAPI + RSS feeds)
- [ ] WebSocket real-time updates
- [ ] More regional languages (Tamil, Telugu, Bengali)
- [ ] User accounts & saved articles
- [ ] Politician & party tracking

---

## Contributing

PRs are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## License

MIT © [kulatshreeram](https://github.com/kulatshreeram)
