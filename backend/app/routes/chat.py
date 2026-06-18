import uuid
import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from backend.app.database.connection import get_db
from backend.app.models.news import Article, ChatMessageLog
from backend.app.schemas.news import ChatRequestSchema, ChatResponseSchema, ChatSourceSchema
from backend.app.services import ai_summary
from backend.app.services.news_service import STATE_KEYWORDS

router = APIRouter()

def detect_state_from_text(text: str) -> Optional[str]:
    text_lower = text.lower()
    for state, keywords in STATE_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                return state
    return None

@router.post("", response_model=ChatResponseSchema)
async def ask_chat_assistant(payload: ChatRequestSchema, db: Session = Depends(get_db)):
    question = payload.question
    state_context = payload.state
    
    # 1. Detect state context if not explicitly passed
    if not state_context:
        state_context = detect_state_from_text(question)
        
    # 2. Fetch relevant news context
    if state_context:
        articles = db.query(Article).filter(Article.state == state_context).order_by(Article.published_at.desc()).limit(8).all()
        # If no articles in DB, fetch them
        if not articles:
            from backend.app.services.news_service import fetch_news_from_gnews
            await fetch_news_from_gnews(db, query=f"{state_context} India", state_name=state_context)
            articles = db.query(Article).filter(Article.state == state_context).order_by(Article.published_at.desc()).limit(8).all()
    else:
        # Fallback to general top headlines
        articles = db.query(Article).order_by(Article.published_at.desc()).limit(8).all()
        
    # 3. Call AI Assistant service
    answer, sources = await ai_summary.ask_assistant(question, state_context, articles)
    
    # 4. Save to chat history
    msg_id = str(uuid.uuid4())
    db_chat = ChatMessageLog(
        id=msg_id,
        question=question,
        answer=answer,
        timestamp=datetime.utcnow(),
        sources_json=json.dumps(sources)
    )
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)
    
    # 5. Format sources schema
    sources_schemas = [
        ChatSourceSchema(name=s["name"], url=s["url"]) for s in sources
    ]
    
    return ChatResponseSchema(
        id=db_chat.id,
        question=db_chat.question,
        answer=db_chat.answer,
        timestamp=db_chat.timestamp,
        sources=sources_schemas
    )

@router.get("/history", response_model=List[ChatResponseSchema])
def get_chat_history(db: Session = Depends(get_db), limit: int = Query(25, ge=1, le=100)):
    logs = db.query(ChatMessageLog).order_by(ChatMessageLog.timestamp.desc()).limit(limit).all()
    
    response_list = []
    # Loop backwards or display desc, standard is desc so newer show up first, but let's reverse to show chronological order in the UI.
    # Wait, the UI will handle ordering, so let's return it as desc (newer first) and let the UI manage it or reverse it.
    for log in logs:
        sources_list = []
        if log.sources_json:
            try:
                sources_list = json.loads(log.sources_json)
            except Exception:
                pass
                
        sources_schemas = [
            ChatSourceSchema(name=s["name"], url=s["url"]) for s in sources_list
        ]
        
        response_list.append(
            ChatResponseSchema(
                id=log.id,
                question=log.question,
                answer=log.answer,
                timestamp=log.timestamp,
                sources=sources_schemas
            )
        )
        
    return response_list
