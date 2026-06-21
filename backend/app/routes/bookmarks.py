from fastapi import APIRouter, Depends, Query, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
from backend.app.database.connection import get_db
from backend.app.models.news import Article, Bookmark
from backend.app.schemas.news import NewsArticleSchema, article_db_to_schema

router = APIRouter()

class ToggleBookmarkSchema(BaseModel):
    article_id: str

@router.get("", response_model=dict)
def get_bookmarks(
    x_user_id: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user_id = x_user_id or "guest_user"
    
    # Query bookmarks for the user
    bookmarks = db.query(Bookmark).filter(Bookmark.user_id == user_id).all()
    article_ids = [b.article_id for b in bookmarks]
    
    # Query corresponding articles
    articles = db.query(Article).filter(Article.id.in_(article_ids)).order_by(Article.published_at.desc()).all()
    serialized = [article_db_to_schema(a) for a in articles]
    
    return {
        "status": "ok",
        "user_id": user_id,
        "bookmarks": serialized
    }

@router.post("/toggle", response_model=dict)
def toggle_bookmark(
    req: ToggleBookmarkSchema,
    x_user_id: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user_id = x_user_id or "guest_user"
    article_id = req.article_id
    
    # Verify article exists
    art = db.query(Article).filter(Article.id == article_id).first()
    if not art:
        raise HTTPException(status_code=404, detail="Article not found")
        
    bookmark = db.query(Bookmark).filter(
        Bookmark.user_id == user_id,
        Bookmark.article_id == article_id
    ).first()
    
    bookmarked = False
    if bookmark:
        db.delete(bookmark)
        db.commit()
    else:
        new_bookmark = Bookmark(user_id=user_id, article_id=article_id)
        db.add(new_bookmark)
        db.commit()
        bookmarked = True
        
    return {
        "status": "ok",
        "user_id": user_id,
        "article_id": article_id,
        "bookmarked": bookmarked
    }
