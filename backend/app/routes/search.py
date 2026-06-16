from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.app.database.connection import get_db
from backend.app.models.news import Article
from backend.app.schemas.news import article_db_to_schema
from backend.app.routes.states import STATES_METADATA

router = APIRouter()

@router.get("")
def search(q: str = Query(""), db: Session = Depends(get_db)):
    if not q:
        return {"articles": [], "states": [], "query": ""}
        
    q_lower = q.lower()
    
    # 1. Search articles
    articles = db.query(Article).filter(
        or_(
            Article.title.like(f"%{q}%"),
            Article.description.like(f"%{q}%"),
            Article.tags.like(f"%{q}%")
        )
    ).order_by(Article.published_at.desc()).limit(15).all()
    
    # 2. Search states
    matching_states = []
    for s in STATES_METADATA:
        if q_lower in s["name"].lower() or q_lower in s["slug"]:
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
