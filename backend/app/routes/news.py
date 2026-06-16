from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from backend.app.database.connection import get_db
from backend.app.models.news import Article
from backend.app.schemas.news import NewsArticleSchema, article_db_to_schema
from backend.app.services import news_service

router = APIRouter()

@router.get("", response_model=dict)
async def list_news(
    category: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    articles, total = news_service.get_news(db, category, state, q, page, limit)
    
    # Trigger GNews pull on-demand if there are no cached articles for this state
    if state and len(articles) == 0:
        print(f"No cached articles for state '{state}'. Fetching from GNews...")
        await news_service.fetch_news_from_gnews(db, query=f"{state} India", state_name=state)
        # Re-query
        articles, total = news_service.get_news(db, category, state, q, page, limit)
        
    serialized = [article_db_to_schema(a) for a in articles]
    
    return {
        "status": "ok",
        "totalResults": total,
        "articles": serialized
    }

@router.get("/{article_id}", response_model=NewsArticleSchema)
def get_article(article_id: str, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Increment view count
    article.view_count += 1
    db.commit()
    db.refresh(article)
    
    return article_db_to_schema(article)

@router.post("/refresh", response_model=dict)
async def refresh_news(
    query: str = Query("India"),
    category: str = Query("general"),
    state: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    new_articles = await news_service.fetch_news_from_gnews(db, query=query, category=category, state_name=state)
    return {
        "status": "ok",
        "fetchedCount": len(new_articles)
    }
