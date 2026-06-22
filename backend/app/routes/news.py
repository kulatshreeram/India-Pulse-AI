from fastapi import APIRouter, Depends, Query, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime, timedelta
from backend.app.database.connection import get_db
from backend.app.models.news import Article, ArticleSummary
from backend.app.schemas.news import NewsArticleSchema, article_db_to_schema, ArticleSummarySchema
from backend.app.services import news_service, ai_summary
from backend.app.cache import news_cache, make_key

router = APIRouter()

@router.get("", response_model=dict)
async def list_news(
    category: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    dateRange: Optional[str] = Query(None),
    startDate: Optional[str] = Query(None),
    endDate: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    # Check cache first (skip for user-specific or search queries)
    if not q:
        cache_key = make_key("news", category, state, dateRange, startDate, endDate, page, limit)
        cached = news_cache.get(cache_key)
        if cached:
            return cached

    # Translate query if it is in Devanagari
    if q and any(ord(char) >= 0x0900 and ord(char) <= 0x097F for char in q):
        from backend.app.services.translation import translate_text
        q = await translate_text(q, "en", db)

    articles, total = news_service.get_news(
        db, category, state, q, page, limit, dateRange, startDate, endDate
    )

    # Trigger GNews pull on-demand if there are no cached articles for this state
    if state and len(articles) == 0:
        print(f"No cached articles for state '{state}'. Fetching from GNews...")
        await news_service.fetch_news_from_gnews(db, query=f"{state} India", state_name=state)
        articles, total = news_service.get_news(db, category, state, q, page, limit)

    serialized = [article_db_to_schema(a) for a in articles]

    result = {
        "status": "ok",
        "totalResults": total,
        "articles": serialized
    }

    # Store in cache (only for non-search requests)
    if not q:
        news_cache.set(cache_key, result)

    return result

@router.get("/clustered", response_model=dict)
def get_clustered_news(
    category: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Article)
    if category:
        query = query.filter(Article.category == category)
    if state:
        query = query.filter(Article.state == state)
    articles = query.order_by(Article.published_at.desc()).all()
    
    from backend.app.services.topic_clustering import cluster_articles
    clusters = cluster_articles(articles)
    
    serialized_clusters = []
    for c in clusters:
        serialized_clusters.append({
            "lead_article": article_db_to_schema(c["lead_article"]),
            "related_articles": [article_db_to_schema(a) for a in c["related_articles"]],
            "cluster_size": c["cluster_size"]
        })
        
    return {
        "status": "ok",
        "clusters": serialized_clusters
    }

@router.get("/recommendations", response_model=List[NewsArticleSchema])
def get_recommendations(
    viewed: Optional[str] = Query(None),
    limit: int = Query(4, ge=1, le=10),
    db: Session = Depends(get_db)
):
    viewed_ids = [v.strip() for v in viewed.split(",") if v.strip()] if viewed else []
    recommendations = []
    
    if viewed_ids:
        viewed_articles = db.query(Article).filter(Article.id.in_(viewed_ids)).all()
        categories = list(set([a.category for a in viewed_articles if a.category]))
        states = list(set([a.state for a in viewed_articles if a.state]))
        
        rec_query = db.query(Article).filter(~Article.id.in_(viewed_ids))
        if categories and states:
            rec_query = rec_query.filter((Article.category.in_(categories)) | (Article.state.in_(states)))
        elif categories:
            rec_query = rec_query.filter(Article.category.in_(categories))
        elif states:
            rec_query = rec_query.filter(Article.state.in_(states))
            
        recommendations = rec_query.order_by(Article.published_at.desc()).limit(limit).all()
        
    if len(recommendations) < limit:
        exclude_ids = viewed_ids + [r.id for r in recommendations]
        padding = db.query(Article).filter(~Article.id.in_(exclude_ids))\
                  .order_by(Article.view_count.desc(), Article.published_at.desc())\
                  .limit(limit - len(recommendations)).all()
        recommendations.extend(padding)
        
    return [article_db_to_schema(a) for a in recommendations[:limit]]

@router.get("/{article_id}/similar", response_model=List[NewsArticleSchema])
def get_similar_articles(article_id: str, limit: int = Query(6), db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
        
    from backend.vector_store.vector_db import get_vector_store
    v_store = get_vector_store()
    
    query_text = f"{article.title}. {article.description or ''}"
    results = v_store.search(query_text, limit=limit + 2)
    
    similar_ids = [art_id for art_id, score in results if art_id != article_id and score >= 0.30]
    similar_articles = db.query(Article).filter(Article.id.in_(similar_ids)).all()
    
    similar_articles_map = {a.id: a for a in similar_articles}
    sorted_similar = [similar_articles_map[sid] for sid in similar_ids if sid in similar_articles_map]
    
    return [article_db_to_schema(a) for a in sorted_similar[:limit]]

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

@router.post("/{article_id}/summarize", response_model=ArticleSummarySchema)
async def summarize_article_endpoint(article_id: str, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Check cache
    cached = db.query(ArticleSummary).filter(ArticleSummary.article_id == article_id).first()
    if cached:
        return cached
        
    # Generate new summary
    summary_text = await ai_summary.summarize_article(article)
    
    db_summary = ArticleSummary(
        article_id=article_id,
        summary_text=summary_text
    )
    db.add(db_summary)
    
    # Also update the article's ai_summary column directly for convenience
    article.ai_summary = summary_text
    db.commit()
    db.refresh(db_summary)
    
    return db_summary

class TranslateRequestSchema(BaseModel):
    text: str
    target_lang: str

@router.post("/translate", response_model=dict)
async def translate_text_endpoint(
    request: TranslateRequestSchema,
    db: Session = Depends(get_db)
):
    from backend.app.services.translation import translate_text
    translated = await translate_text(request.text, request.target_lang, db)
    return {
        "original_text": request.text,
        "translated_text": translated,
        "target_lang": request.target_lang
    }

@router.get("/growth", response_model=dict)
def get_news_growth(
    state: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)
    
    query = db.query(Article.published_at).filter(Article.published_at >= thirty_days_ago)
    if state:
        query = query.filter(Article.state == state)
    if category:
        query = query.filter(Article.category == category)
        
    articles_dates = query.order_by(Article.published_at.asc()).all()
    
    counts_by_day = {}
    for i in range(30):
        day = thirty_days_ago + timedelta(days=i)
        counts_by_day[day.strftime("%Y-%m-%d")] = 0
        
    for (pub_date,) in articles_dates:
        if pub_date:
            date_str = pub_date.strftime("%Y-%m-%d")
            if date_str in counts_by_day:
                counts_by_day[date_str] += 1
                
    growth_data = []
    cumulative = 0
    for day_str, count in sorted(counts_by_day.items()):
        cumulative += count
        growth_data.append({
            "date": datetime.strptime(day_str, "%Y-%m-%d").strftime("%b %d"),
            "count": count,
            "cumulative": cumulative
        })
        
    return {
        "status": "ok",
        "data": growth_data
    }

@router.get("/personalized", response_model=dict)
def get_personalized_news(
    x_user_id: Optional[str] = Header(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    from backend.app.models.news import UserPreference
    
    user_id = x_user_id or "guest_user"
    pref = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
    
    interests = []
    if pref and pref.interests:
        interests = [cat.strip().lower() for cat in pref.interests.split(",") if cat.strip()]
        
    query = db.query(Article)
    if interests:
        query = query.filter(Article.category.in_(interests))
        
    query = query.order_by(Article.published_at.desc())
    total = query.count()
    articles = query.offset((page - 1) * limit).limit(limit).all()
    
    serialized = [article_db_to_schema(a) for a in articles]
    
    return {
        "status": "ok",
        "totalResults": total,
        "articles": serialized,
        "interests": interests
    }

