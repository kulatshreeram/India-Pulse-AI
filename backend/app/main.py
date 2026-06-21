import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from backend.app.database.connection import engine, Base, SessionLocal, run_migrations
from backend.app.routes import news, states, search, chat, analytics, preferences, bookmarks
import asyncio
from backend.app.models.news import Article, UserPreference, Bookmark
from backend.app.services.news_service import seed_db_if_empty, enrich_existing_articles
from backend.vector_store.vector_db import get_vector_store

# Create database tables
Base.metadata.create_all(bind=engine)
run_migrations()

# Seed database & Vector store
db = SessionLocal()
try:
    seed_db_if_empty(db)
    enrich_existing_articles(db)
    
    # Index all articles in vector store
    articles = db.query(Article).all()
    print(f"Indexing {len(articles)} articles in vector store...")
    v_store = get_vector_store()
    
    async def index_all():
        for art in articles:
            await v_store.add_article(
                article_id=art.id,
                title=art.title,
                description=art.description,
                content=art.content,
                state=art.state,
                category=art.category
            )
        print("Vector store indexing completed.")
        
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.create_task(index_all())
        else:
            asyncio.run(index_all())
    except Exception as e:
        print(f"Error indexing vectors on startup: {e}")
finally:
    db.close()

app = FastAPI(title="India Pulse AI API", version="0.1.0")

# Allow CORS for Next.js frontend calls during dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(news.router, prefix="/api/news", tags=["News"])
app.include_router(states.router, prefix="/api/states", tags=["States"])
app.include_router(search.router, prefix="/api/search", tags=["Search"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(preferences.router, prefix="/api/preferences", tags=["Preferences"])
app.include_router(bookmarks.router, prefix="/api/bookmarks", tags=["Bookmarks"])


@app.get("/")
def read_root():
    return {"status": "ok", "message": "India Pulse AI API is running"}
