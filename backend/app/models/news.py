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
