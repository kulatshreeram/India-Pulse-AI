from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta

from backend.app.database.connection import get_db
from backend.app.models.news import Article
from backend.app.services import ai_summary

router = APIRouter()


class ReportRequest(BaseModel):
    report_type: str          # daily_briefing | weekly_report | state_report | topic_analysis | sentiment_report
    state: Optional[str] = None
    topic: Optional[str] = None
    days: Optional[int] = 7   # lookback window


class ReportResponse(BaseModel):
    report_type: str
    title: str
    content: str
    generated_at: str
    article_count: int
    sources: list[str]


@router.post("/generate", response_model=ReportResponse)
async def generate_report(payload: ReportRequest, db: Session = Depends(get_db)):
    """Generate a structured AI research report from live news data."""

    rtype = payload.report_type
    days = payload.days or 7
    cutoff = datetime.utcnow() - timedelta(days=days)

    # ── Fetch articles relevant to this report type ──────────────────────────
    query = db.query(Article).filter(Article.published_at >= cutoff)

    if payload.state and rtype == "state_report":
        query = query.filter(Article.state == payload.state)
    elif payload.topic and rtype in ("topic_analysis", "trend_explanation"):
        query = query.filter(
            Article.title.ilike(f"%{payload.topic}%") |
            Article.description.ilike(f"%{payload.topic}%")
        )
    elif rtype == "daily_briefing":
        cutoff = datetime.utcnow() - timedelta(days=1)
        query = db.query(Article).filter(Article.published_at >= cutoff)
    elif rtype == "sentiment_report":
        query = db.query(Article)  # all recent

    articles = query.order_by(Article.published_at.desc()).limit(20).all()

    if not articles:
        raise HTTPException(
            status_code=404,
            detail=f"No articles found for report type '{rtype}'. Try a different time range or parameters."
        )

    # ── Build report prompt ──────────────────────────────────────────────────
    today_str = datetime.utcnow().strftime("%A, %B %d, %Y")
    state_name = payload.state or "India"
    topic_name = payload.topic or "current events"

    prompts = {
        "daily_briefing": f"Generate a comprehensive Daily News Briefing for India for {today_str}. Cover breaking news, top stories by category, and key insights. Use structured markdown with headers.",
        "weekly_report": f"Generate a comprehensive Weekly India News Report for the past {days} days ending {today_str}. Include top stories, trend analysis, regional roundup, and outlook.",
        "state_report": f"Generate a comprehensive State News Report for {state_name}. Cover breaking news, politics, economy, infrastructure, and provide key metrics.",
        "topic_analysis": f"Generate a comprehensive Topic Analysis Report on '{topic_name}' in India. Cover developments, geographic impact, data points, perspectives, and outlook.",
        "sentiment_report": f"Generate a comprehensive News Sentiment Analysis for India as of {today_str}. Analyze positive/negative/neutral topics, regional sentiment, and category breakdown.",
        "trend_explanation": f"Explain the current trending topic '{topic_name}' in Indian news. Provide full background, key facts, who's affected, perspectives, and what comes next.",
    }

    prompt = prompts.get(rtype, prompts["daily_briefing"])

    titles = {
        "daily_briefing": f"India Daily Briefing — {today_str}",
        "weekly_report": f"India Weekly Report — Week of {today_str}",
        "state_report": f"{state_name} State News Report",
        "topic_analysis": f"Topic Analysis: {topic_name}",
        "sentiment_report": f"India News Sentiment Report — {today_str}",
        "trend_explanation": f"Trend Analysis: {topic_name}",
    }

    title = titles.get(rtype, "India News Report")

    # ── Call AI service ──────────────────────────────────────────────────────
    content, sources = await ai_summary.ask_assistant(
        question=prompt,
        state_context=payload.state,
        articles=articles,
        target_lang="en",
        db=db,
    )

    source_names = list({s.get("name", "") for s in sources if s.get("name")})

    return ReportResponse(
        report_type=rtype,
        title=title,
        content=content,
        generated_at=datetime.utcnow().isoformat(),
        article_count=len(articles),
        sources=source_names,
    )
