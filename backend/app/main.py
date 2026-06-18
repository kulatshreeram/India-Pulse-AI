import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# We need to make sure the db tables are created and seeded on startup
from backend.app.database.connection import engine, Base, SessionLocal
from backend.app.routes import news, states, search, chat
from backend.app.services.news_service import seed_db_if_empty

# Create database tables
Base.metadata.create_all(bind=engine)

# Seed database
db = SessionLocal()
try:
    seed_db_if_empty(db)
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

@app.get("/")
def read_root():
    return {"status": "ok", "message": "India Pulse AI API is running"}
