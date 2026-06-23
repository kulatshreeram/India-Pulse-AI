# India Pulse AI — API Reference

Base URL: `http://localhost:8000` (dev) | `https://your-backend.railway.app` (prod)

Interactive docs: `/api/docs` (Swagger UI) · `/api/redoc` (ReDoc)

---

## Authentication

Currently open (no auth required). Rate limits apply per IP.

| Endpoint Group | Rate Limit |
|---|---|
| `/api/chat` | 10 req/min |
| `/api/reports` | 5 req/min |
| `/api/news` | 100 req/min |
| `/api/search` | 60 req/min |
| All others | 200 req/min |

---

## 📰 News

### `GET /api/news`
List news articles with optional filters.

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `state` | string | Filter by Indian state name (e.g. `Maharashtra`) |
| `category` | string | Filter by category (`politics`, `technology`, `sports`, etc.) |
| `q` | string | Full-text search query |
| `page` | int | Page number (default: 1) |
| `limit` | int | Results per page (default: 50, max: 200) |
| `dateRange` | string | `today`, `week`, `month` |
| `startDate` | string | ISO date string |
| `endDate` | string | ISO date string |

**Response:**
```json
{
  "status": "ok",
  "totalResults": 120,
  "articles": [
    {
      "id": "mh-001",
      "title": "Mumbai Metro expansion announced",
      "description": "...",
      "source": { "name": "The Hindu", "url": "https://thehindu.com", "id": "the-hindu" },
      "category": "infrastructure",
      "state": "Maharashtra",
      "city": "Mumbai",
      "latitude": 19.076,
      "longitude": 72.877,
      "sentiment": "positive",
      "sentimentScore": 0.72,
      "impactScore": { "local": 60, "state": 80, "national": 40, "global": 10 },
      "publishedAt": "2024-01-15T10:30:00Z",
      "imageUrl": "https://...",
      "url": "https://...",
      "tags": ["metro", "infrastructure", "mumbai"],
      "isBreaking": false
    }
  ]
}
```

### `GET /api/news/{id}`
Get a single article by ID.

### `POST /api/news/refresh`
Trigger a fresh news fetch from GNews API.

### `GET /api/news/clustered`
Get articles clustered by geographic proximity for map rendering.

---

## 💬 Chat (AI Research Assistant)

### `POST /api/chat`
Send a message to the AI assistant with RAG retrieval.

**Request Body:**
```json
{
  "question": "What happened in Maharashtra today?",
  "state": "Maharashtra"
}
```

**Response:**
```json
{
  "id": "uuid-here",
  "question": "What happened in Maharashtra today?",
  "answer": "**Maharashtra Today**\n\nSeveral key developments...",
  "timestamp": "2024-01-15T12:00:00Z",
  "sources": [
    { "name": "Times of India", "url": "https://..." }
  ]
}
```

### `GET /api/chat/history`
Get recent chat history (last 25 messages by default).

**Query Params:** `limit` (1-100)

---

## 📊 Analytics

### `GET /api/analytics`
Get aggregated analytics data (60s cached).

**Response includes:**
- `totalArticles`, `totalStates`, `totalCategories`, `totalAISummaries`
- `trendingTopics[]` — top topics by article count
- `sentimentData[]` — positive/negative/neutral breakdown
- `stateActivity[]` — articles per state
- `timelineData[]` — articles over time
- `categoryBreakdown[]` — articles by category
- `categorySentiment[]` — sentiment per category
- `newsMoods[]` — source-level mood analysis

---

## 📈 Reports

### `POST /api/reports/generate`
Generate a structured AI report.

**Request Body:**
```json
{
  "report_type": "state_report",
  "state": "Karnataka",
  "topic": null,
  "days": 7
}
```

**Report Types:** `daily_briefing` | `weekly_report` | `state_report` | `topic_analysis` | `sentiment_report` | `trend_explanation`

**Response:**
```json
{
  "report_type": "state_report",
  "title": "Karnataka State News Report",
  "content": "# 🗺️ Karnataka State News Report\n\n## Overview\n...",
  "generated_at": "2024-01-15T12:00:00Z",
  "article_count": 18,
  "sources": ["Deccan Herald", "The Hindu", "NDTV"]
}
```

---

## 🗺️ States

### `GET /api/states`
Get news summary data for all Indian states (for map coloring).

### `GET /api/states/{state_name}`
Get detailed news data for a specific state.

---

## 🔍 Search

### `GET /api/search?q={query}`
Semantic search with RAG retrieval.

**Query Params:** `q` (required), `state`, `category`, `limit` (default: 10)

---

## 🔖 Bookmarks

### `GET /api/bookmarks`
Get all bookmarks. Query param: `user_id`

### `POST /api/bookmarks`
Add a bookmark. Body: `{ "article_id": "...", "user_id": "..." }`

### `DELETE /api/bookmarks/{article_id}`
Remove a bookmark.

---

## ⚙️ Health Check

### `GET /`
```json
{ "status": "ok", "message": "India Pulse AI API is running" }
```
