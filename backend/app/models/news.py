from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime
from backend.app.database.connection import Base

class Article(Base):
    __tablename__ = "articles"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    content = Column(String)
    summary = Column(String)
    ai_summary = Column(String)
    
    # Flattened NewsSource
    source_name = Column(String)
    source_url = Column(String)
    
    category = Column(String, index=True)
    state = Column(String, index=True)
    city = Column(String)
    
    # Flattened Coordinates
    latitude = Column(Float)
    longitude = Column(Float)
    
    published_at = Column(DateTime, index=True)
    image_url = Column(String)
    url = Column(String, unique=True, index=True)
    
    sentiment = Column(String)
    sentiment_score = Column(Float)
    sentiment_positive = Column(Float, default=0.0)
    sentiment_negative = Column(Float, default=0.0)
    sentiment_neutral = Column(Float, default=0.0)
    
    # Flattened ImpactScore
    impact_local = Column(Integer)
    impact_state = Column(Integer)
    impact_national = Column(Integer)
    impact_global = Column(Integer)
    
    # Comma-separated tags
    tags = Column(String)
    
    is_breaking = Column(Boolean, default=False)
    view_count = Column(Integer, default=0)
    
    fetched_at = Column(DateTime, default=datetime.utcnow)

class ArticleSummary(Base):
    __tablename__ = "article_summaries"

    article_id = Column(String, primary_key=True, index=True)
    summary_text = Column(String, nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)

class StateSummary(Base):
    __tablename__ = "state_summaries"

    state_name = Column(String, primary_key=True, index=True)
    summary_text = Column(String, nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)

class ChatMessageLog(Base):
    __tablename__ = "chat_history"

    id = Column(String, primary_key=True, index=True)
    question = Column(String, nullable=False)
    answer = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    sources_json = Column(String)  # JSON-serialized list of sources (name, url)

class TranslationCache(Base):
    __tablename__ = "translation_cache"

    id = Column(Integer, primary_key=True, autoincrement=True)
    text_hash = Column(String, index=True) # md5 hash of original text
    target_lang = Column(String, index=True) # 'hi', 'mr'
    original_text = Column(String)
    translated_text = Column(String)
    translated_at = Column(DateTime, default=datetime.utcnow)

