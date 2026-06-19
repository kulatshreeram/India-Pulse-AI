import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./india_pulse.db")

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # Ensure correct postgresql driver scheme
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def run_migrations():
    from sqlalchemy import text
    db = SessionLocal()
    try:
        # Check if new columns exist
        db.execute(text("SELECT sentiment_positive, sentiment_negative, sentiment_neutral FROM articles LIMIT 1"))
    except Exception:
        db.rollback()
        print("Migrating database: Adding sentiment_positive, sentiment_negative, and sentiment_neutral columns to articles table...")
        for col in ["sentiment_positive", "sentiment_negative", "sentiment_neutral"]:
            try:
                db.execute(text(f"ALTER TABLE articles ADD COLUMN {col} FLOAT DEFAULT 0.0"))
                db.commit()
                print(f"Successfully added column: {col}")
            except Exception as e:
                db.rollback()
                print(f"Column {col} might already exist or failed to add: {e}")
    finally:
        db.close()

