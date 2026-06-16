from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class NewsSourceSchema(BaseModel):
    id: str
    name: str
    logoUrl: Optional[str] = None
    url: str

class CoordinatesSchema(BaseModel):
    lat: float
    lng: float

class ImpactScoreSchema(BaseModel):
    local: int
    state: int
    national: int
    global_: int = Field(alias="global")

    class Config:
        populate_by_name = True

class NewsArticleSchema(BaseModel):
    id: str
    title: str
    description: str
    content: Optional[str] = None
    summary: str
    aiSummary: Optional[str] = None
    source: NewsSourceSchema
    category: str
    state: Optional[str] = None
    city: Optional[str] = None
    coordinates: Optional[CoordinatesSchema] = None
    publishedAt: str
    imageUrl: str
    url: Optional[str] = None
    sentiment: str
    sentimentScore: float
    impactScore: ImpactScoreSchema
    tags: List[str] = []
    isBreaking: bool = False
    viewCount: int = 0

    class Config:
        populate_by_name = True

def article_db_to_schema(db_article) -> NewsArticleSchema:
    # Handle tags (comma separated string in DB)
    tags_list = [t.strip() for t in db_article.tags.split(",")] if db_article.tags else []
    
    # Handle published_at formatting
    published_at_str = ""
    if isinstance(db_article.published_at, datetime):
        published_at_str = db_article.published_at.isoformat() + "Z"
    elif db_article.published_at:
        published_at_str = str(db_article.published_at)
        
    return NewsArticleSchema(
        id=db_article.id,
        title=db_article.title,
        description=db_article.description or "",
        content=db_article.content,
        summary=db_article.summary or "",
        aiSummary=db_article.ai_summary,
        source=NewsSourceSchema(
            id=db_article.source_name.lower().replace(" ", "-") if db_article.source_name else "unknown",
            name=db_article.source_name or "Unknown Source",
            url=db_article.source_url or ""
        ),
        category=db_article.category or "general",
        state=db_article.state,
        city=db_article.city,
        coordinates=CoordinatesSchema(lat=db_article.latitude, lng=db_article.longitude) if db_article.latitude is not None and db_article.longitude is not None else None,
        publishedAt=published_at_str,
        imageUrl=db_article.image_url or "https://images.unsplash.com/photo-1504711434969-e33886168f5c",
        url=db_article.url,
        sentiment=db_article.sentiment or "neutral",
        sentimentScore=db_article.sentiment_score or 0.0,
        impactScore=ImpactScoreSchema(
            local=db_article.impact_local or 0,
            state=db_article.impact_state or 0,
            national=db_article.impact_national or 0,
            global_=db_article.impact_global or 0
        ),
        tags=tags_list,
        isBreaking=db_article.is_breaking or False,
        viewCount=db_article.view_count or 0
    )
