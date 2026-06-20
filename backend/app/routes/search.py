from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.app.database.connection import get_db
from backend.app.models.news import Article
from backend.app.schemas.news import article_db_to_schema
from backend.app.routes.states import STATES_METADATA

router = APIRouter()

@router.get("")
async def search(q: str = Query(""), db: Session = Depends(get_db)):
    if not q:
        return {"articles": [], "states": [], "query": ""}
        
    q_en = q
    # Check if query contains Devanagari
    if any(ord(char) >= 0x0900 and ord(char) <= 0x097F for char in q):
        from backend.app.services.translation import translate_text
        q_en = await translate_text(q, "en", db)
        
    q_lower = q_en.lower()
    
    # 1. Search articles using both English translation and original search term
    articles = db.query(Article).filter(
        or_(
            Article.title.like(f"%{q_en}%"),
            Article.description.like(f"%{q_en}%"),
            Article.tags.like(f"%{q_en}%"),
            Article.title.like(f"%{q}%"),
            Article.description.like(f"%{q}%")
        )
    ).order_by(Article.published_at.desc()).limit(15).all()
    
    # 2. Search states
    matching_states = []
    for s in STATES_METADATA:
        if q_lower in s["name"].lower() or q_lower in s["slug"] or q.lower() in s["name"].lower():
            news_count = db.query(Article).filter(Article.state == s["name"]).count()
            matching_states.append({
                "name": s["name"],
                "slug": s["slug"],
                "capital": s["capital"],
                "coordinates": {"lat": s["lat"], "lng": s["lng"]},
                "population": s["population"],
                "area": s["area"],
                "newsCount": news_count
            })
            
    return {
        "articles": [article_db_to_schema(a) for a in articles],
        "states": matching_states,
        "query": q
    }
