from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from backend.app.database.connection import get_db
from backend.app.models.news import Article, StateSummary
from backend.app.schemas.news import StateSummarySchema
from backend.app.services import ai_summary

router = APIRouter()

# States metadata matching src/lib/india-states.ts
STATES_METADATA = [
    {"name": "Maharashtra", "slug": "maharashtra", "capital": "Mumbai", "lat": 19.0760, "lng": 72.8777, "population": 112374333, "area": 307713},
    {"name": "Delhi", "slug": "delhi", "capital": "New Delhi", "lat": 28.6139, "lng": 77.2090, "population": 32941000, "area": 1484},
    {"name": "Karnataka", "slug": "karnataka", "capital": "Bengaluru", "lat": 12.9716, "lng": 77.5946, "population": 67562686, "area": 191791},
    {"name": "Tamil Nadu", "slug": "tamil-nadu", "capital": "Chennai", "lat": 13.0827, "lng": 80.2707, "population": 77841267, "area": 130058},
    {"name": "Uttar Pradesh", "slug": "uttar-pradesh", "capital": "Lucknow", "lat": 26.8467, "lng": 80.9462, "population": 224979505, "area": 240928},
    {"name": "West Bengal", "slug": "west-bengal", "capital": "Kolkata", "lat": 22.5726, "lng": 88.3639, "population": 99609303, "area": 88752},
    {"name": "Gujarat", "slug": "gujarat", "capital": "Gandhinagar", "lat": 23.0225, "lng": 72.5714, "population": 63872399, "area": 196024},
    {"name": "Rajasthan", "slug": "rajasthan", "capital": "Jaipur", "lat": 26.9124, "lng": 75.7873, "population": 81032689, "area": 342239},
    {"name": "Telangana", "slug": "telangana", "capital": "Hyderabad", "lat": 17.3850, "lng": 78.4867, "population": 39362732, "area": 112077},
    {"name": "Kerala", "slug": "kerala", "capital": "Thiruvananthapuram", "lat": 10.8505, "lng": 76.2711, "population": 35699443, "area": 38852},
    {"name": "Madhya Pradesh", "slug": "madhya-pradesh", "capital": "Bhopal", "lat": 23.2599, "lng": 77.4126, "population": 85358965, "area": 308252},
    {"name": "Bihar", "slug": "bihar", "capital": "Patna", "lat": 25.5941, "lng": 85.1376, "population": 128500364, "area": 94163},
    {"name": "Punjab", "slug": "punjab", "capital": "Chandigarh", "lat": 30.9010, "lng": 75.8573, "population": 30141373, "area": 50362},
    {"name": "Haryana", "slug": "haryana", "capital": "Chandigarh", "lat": 29.0588, "lng": 76.0856, "population": 28672709, "area": 44212},
    {"name": "Odisha", "slug": "odisha", "capital": "Bhubaneswar", "lat": 20.2961, "lng": 85.8245, "population": 46356334, "area": 155707},
    {"name": "Jharkhand", "slug": "jharkhand", "capital": "Ranchi", "lat": 23.3441, "lng": 85.3096, "population": 38593948, "area": 79716},
    {"name": "Assam", "slug": "assam", "capital": "Dispur", "lat": 26.2006, "lng": 92.9376, "population": 35607039, "area": 78438},
    {"name": "Chhattisgarh", "slug": "chhattisgarh", "capital": "Raipur", "lat": 21.2787, "lng": 81.8661, "population": 29436231, "area": 135192},
    {"name": "Uttarakhand", "slug": "uttarakhand", "capital": "Dehradun", "lat": 30.3165, "lng": 78.0322, "population": 11250858, "area": 53483},
    {"name": "Himachal Pradesh", "slug": "himachal-pradesh", "capital": "Shimla", "lat": 31.1048, "lng": 77.1734, "population": 7451955, "area": 55673},
    {"name": "Goa", "slug": "goa", "capital": "Panaji", "lat": 15.4909, "lng": 73.8278, "population": 1586250, "area": 3702},
    {"name": "Tripura", "slug": "tripura", "capital": "Agartala", "lat": 23.9408, "lng": 91.9882, "population": 3992000, "area": 10486},
    {"name": "Andhra Pradesh", "slug": "andhra-pradesh", "capital": "Amaravati", "lat": 15.9129, "lng": 79.7400, "population": 53903393, "area": 162975},
    {"name": "Jammu and Kashmir", "slug": "jammu-kashmir", "capital": "Srinagar", "lat": 34.0837, "lng": 74.7973, "population": 13606320, "area": 42241},
    {"name": "Manipur", "slug": "manipur", "capital": "Imphal", "lat": 24.6637, "lng": 93.9063, "population": 3091545, "area": 22327},
    {"name": "Meghalaya", "slug": "meghalaya", "capital": "Shillong", "lat": 25.5788, "lng": 91.8933, "population": 3366710, "area": 22429},
    {"name": "Mizoram", "slug": "mizoram", "capital": "Aizawl", "lat": 23.7271, "lng": 92.7176, "population": 1239244, "area": 21081},
    {"name": "Nagaland", "slug": "nagaland", "capital": "Kohima", "lat": 25.6751, "lng": 94.1086, "population": 2249695, "area": 16579},
    {"name": "Arunachal Pradesh", "slug": "arunachal-pradesh", "capital": "Itanagar", "lat": 28.2180, "lng": 94.7278, "population": 1570458, "area": 83743},
    {"name": "Sikkim", "slug": "sikkim", "capital": "Gangtok", "lat": 27.5330, "lng": 88.5122, "population": 690251, "area": 7096},
    {"name": "Puducherry", "slug": "puducherry", "capital": "Puducherry", "lat": 11.9416, "lng": 79.8083, "population": 1671000, "area": 479}
]

@router.get("")
def list_states(db: Session = Depends(get_db)):
    counts = db.query(Article.state, func.count(Article.id)).group_by(Article.state).all()
    counts_map = {state: count for state, count in counts if state}
    
    states_list = []
    for state in STATES_METADATA:
        name = state["name"]
        slug = state["slug"]
        news_count = counts_map.get(name, 0)
        
        top_cat_row = db.query(Article.category, func.count(Article.id))\
            .filter(Article.state == name)\
            .group_by(Article.category)\
            .order_by(func.count(Article.id).desc())\
            .first()
            
        top_category = top_cat_row[0] if top_cat_row else None
        
        avg_sentiment_row = db.query(func.avg(Article.sentiment_score))\
            .filter(Article.state == name)\
            .first()
            
        sentiment_score = float(avg_sentiment_row[0]) if avg_sentiment_row and avg_sentiment_row[0] is not None else 0.0
        
        states_list.append({
            "name": name,
            "slug": slug,
            "capital": state["capital"],
            "coordinates": {"lat": state["lat"], "lng": state["lng"]},
            "population": state["population"],
            "area": state["area"],
            "newsCount": news_count,
            "topCategory": top_category,
            "sentimentScore": sentiment_score
        })
        
    return states_list

@router.get("/{slug}")
def get_state(slug: str, db: Session = Depends(get_db)):
    state_meta = next((s for s in STATES_METADATA if s["slug"] == slug), None)
    if not state_meta:
        raise HTTPException(status_code=404, detail="State not found")
        
    name = state_meta["name"]
    articles = db.query(Article).filter(Article.state == name).order_by(Article.published_at.desc()).limit(10).all()
    news_count = db.query(Article).filter(Article.state == name).count()
    
    avg_sentiment_row = db.query(func.avg(Article.sentiment_score))\
        .filter(Article.state == name)\
        .first()
    sentiment_score = float(avg_sentiment_row[0]) if avg_sentiment_row and avg_sentiment_row[0] is not None else 0.0
    
    return {
        "name": name,
        "slug": slug,
        "capital": state_meta["capital"],
        "coordinates": {"lat": state_meta["lat"], "lng": state_meta["lng"]},
        "population": state_meta["population"],
        "area": state_meta["area"],
        "newsCount": news_count,
        "sentimentScore": sentiment_score,
        "recentArticles": [a.id for a in articles]
    }

@router.post("/{state_name}/summarize", response_model=StateSummarySchema)
async def summarize_state_endpoint(state_name: str, db: Session = Depends(get_db)):
    cached = db.query(StateSummary).filter(StateSummary.state_name == state_name).first()
    if cached:
        return cached

    articles = db.query(Article).filter(Article.state == state_name).order_by(Article.published_at.desc()).limit(10).all()
    
    if not articles:
        from backend.app.services.news_service import fetch_news_from_gnews
        await fetch_news_from_gnews(db, query=f"{state_name} India", state_name=state_name)
        articles = db.query(Article).filter(Article.state == state_name).order_by(Article.published_at.desc()).limit(10).all()

    summary_text = await ai_summary.summarize_state(state_name, articles)
    
    db_summary = StateSummary(
        state_name=state_name,
        summary_text=summary_text
    )
    db.add(db_summary)
    db.commit()
    db.refresh(db_summary)
    
    return db_summary
