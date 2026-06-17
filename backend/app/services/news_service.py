import os
import httpx
import uuid
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.app.models.news import Article
from backend.app.services.mock_data import get_seed_articles

# State coordinates map
STATE_COORDINATES = {
    'Maharashtra': {'lat': 19.0760, 'lng': 72.8777},
    'Delhi': {'lat': 28.6139, 'lng': 77.2090},
    'Karnataka': {'lat': 12.9716, 'lng': 77.5946},
    'Tamil Nadu': {'lat': 13.0827, 'lng': 80.2707},
    'Uttar Pradesh': {'lat': 26.8467, 'lng': 80.9462},
    'West Bengal': {'lat': 22.5726, 'lng': 88.3639},
    'Gujarat': {'lat': 23.0225, 'lng': 72.5714},
    'Rajasthan': {'lat': 26.9124, 'lng': 75.7873},
    'Telangana': {'lat': 17.3850, 'lng': 78.4867},
    'Kerala': {'lat': 10.8505, 'lng': 76.2711},
    'Madhya Pradesh': {'lat': 23.2599, 'lng': 77.4126},
    'Bihar': {'lat': 25.5941, 'lng': 85.1376},
    'Punjab': {'lat': 30.9010, 'lng': 75.8573},
    'Haryana': {'lat': 29.0588, 'lng': 76.0856},
    'Odisha': {'lat': 20.2961, 'lng': 85.8245},
    'Jharkhand': {'lat': 23.3441, 'lng': 85.3096},
    'Assam': {'lat': 26.2006, 'lng': 92.9376},
    'Chhattisgarh': {'lat': 21.2787, 'lng': 81.8661},
    'Uttarakhand': {'lat': 30.3165, 'lng': 78.0322},
    'Himachal Pradesh': {'lat': 31.1048, 'lng': 77.1734},
    'Goa': {'lat': 15.4909, 'lng': 73.8278},
    'Tripura': {'lat': 23.9408, 'lng': 91.9882},
    'Andhra Pradesh': {'lat': 15.9129, 'lng': 79.7400},
    'Jammu and Kashmir': {'lat': 34.0837, 'lng': 74.7973},
    'Manipur': {'lat': 24.6637, 'lng': 93.9063},
    'Meghalaya': {'lat': 25.5788, 'lng': 91.8933},
    'Mizoram': {'lat': 23.7271, 'lng': 92.7176},
    'Nagaland': {'lat': 25.6751, 'lng': 94.1086},
    'Arunachal Pradesh': {'lat': 28.2180, 'lng': 94.7278},
    'Sikkim': {'lat': 27.5330, 'lng': 88.5122},
    'Puducherry': {'lat': 11.9416, 'lng': 79.8083},
}

CITY_COORDINATES = {
    'mumbai': {'lat': 19.0760, 'lng': 72.8777, 'state': 'Maharashtra'},
    'pune': {'lat': 18.5204, 'lng': 73.8567, 'state': 'Maharashtra'},
    'bengaluru': {'lat': 12.9716, 'lng': 77.5946, 'state': 'Karnataka'},
    'bangalore': {'lat': 12.9716, 'lng': 77.5946, 'state': 'Karnataka'},
    'chennai': {'lat': 13.0827, 'lng': 80.2707, 'state': 'Tamil Nadu'},
    'new delhi': {'lat': 28.6139, 'lng': 77.2090, 'state': 'Delhi'},
    'delhi': {'lat': 28.6139, 'lng': 77.2090, 'state': 'Delhi'},
    'kolkata': {'lat': 22.5726, 'lng': 88.3639, 'state': 'West Bengal'},
    'hyderabad': {'lat': 17.3850, 'lng': 78.4867, 'state': 'Telangana'},
    'ahmedabad': {'lat': 23.0225, 'lng': 72.5714, 'state': 'Gujarat'},
    'jaipur': {'lat': 26.9124, 'lng': 75.7873, 'state': 'Rajasthan'},
    'lucknow': {'lat': 26.8467, 'lng': 80.9462, 'state': 'Uttar Pradesh'},
    'noida': {'lat': 28.5355, 'lng': 77.3910, 'state': 'Uttar Pradesh'},
    'gurugram': {'lat': 28.4595, 'lng': 77.0266, 'state': 'Haryana'},
    'gurgaon': {'lat': 28.4595, 'lng': 77.0266, 'state': 'Haryana'},
    'patna': {'lat': 25.5941, 'lng': 85.1376, 'state': 'Bihar'},
    'kochi': {'lat': 9.9312, 'lng': 76.2673, 'state': 'Kerala'},
    'srinagar': {'lat': 34.0837, 'lng': 74.7973, 'state': 'Jammu and Kashmir'},
    'guwahati': {'lat': 26.1445, 'lng': 91.7362, 'state': 'Assam'},
}

STATE_KEYWORDS = {
    "Maharashtra": ["maharashtra", "mumbai", "pune", "nagpur", "thane", "nashik"],
    "Delhi": ["delhi", "new delhi", "ncr"],
    "Karnataka": ["karnataka", "bengaluru", "bangalore", "mysore", "hubli", "mangalore"],
    "Tamil Nadu": ["tamil nadu", "chennai", "coimbatore", "madurai", "trichy"],
    "Uttar Pradesh": ["uttar pradesh", "lucknow", "kanpur", "noida", "agra", "varanasi", "ghaziabad", "prayagraj"],
    "West Bengal": ["west bengal", "kolkata", "howrah", "darjeeling", "siliguri"],
    "Gujarat": ["gujarat", "ahmedabad", "surat", "vadodara", "rajkot", "gandhinagar"],
    "Rajasthan": ["rajasthan", "jaipur", "jodhpur", "udaipur", "kota", "jaisalmer"],
    "Telangana": ["telangana", "hyderabad", "warangal", "secunderabad"],
    "Kerala": ["kerala", "thiruvananthapuram", "kochi", "cochin", "kozhikode", "trivandrum"],
    "Madhya Pradesh": ["madhya pradesh", "bhopal", "indore", "gwalior", "jabalpur"],
    "Bihar": ["bihar", "patna", "gaya", "bhagalpur", "muzaffarpur"],
    "Punjab": ["punjab", "ludhiana", "amritsar", "jalandhar", "patiala"],
    "Haryana": ["haryana", "gurugram", "gurgaon", "faridabad", "panipat", "rohtak"],
    "Odisha": ["odisha", "orissa", "bhubaneswar", "cuttack", "puri"],
    "Jharkhand": ["jharkhand", "ranchi", "jamshedpur", "dhanbad", "bokaro"],
    "Assam": ["assam", "guwahati", "dibrugarh", "silchar"],
    "Chhattisgarh": ["chhattisgarh", "raipur", "bilaspur", "durg"],
    "Uttarakhand": ["uttarakhand", "dehradun", "haridwar", "rishikesh", "nainital"],
    "Himachal Pradesh": ["himachal", "shimla", "manali", "dharamshala"],
    "Goa": ["goa", "panaji", "panjim", "margao", "vasco"],
    "Jammu and Kashmir": ["jammu", "kashmir", "srinagar", "anantnag"],
    "Ladakh": ["ladakh", "leh", "kargil"],
    "Puducherry": ["puducherry", "pondicherry"],
    "Chandigarh": ["chandigarh"],
    "Tripura": ["tripura", "agartala"],
    "Manipur": ["manipur", "imphal"],
    "Meghalaya": ["meghalaya", "shillong"],
    "Mizoram": ["mizoram", "aizawl"],
    "Nagaland": ["nagaland", "kohima"],
    "Sikkim": ["sikkim", "gangtok"],
    "Andhra Pradesh": ["andhra", "vijayawada", "visakhapatnam", "vizag", "tirupati", "guntur"]
}

def map_article_to_state_and_coords(title: str, description: str):
    text = f"{title} {description or ''}".lower()
    
    # 1. Look for specific city keywords
    for city, info in CITY_COORDINATES.items():
        if city in text:
            state = info['state']
            jitter_lat = random.uniform(-0.015, 0.015)
            jitter_lng = random.uniform(-0.015, 0.015)
            return state, city.capitalize(), info['lat'] + jitter_lat, info['lng'] + jitter_lng
            
    # 2. Look for state names/keywords
    for state, keywords in STATE_KEYWORDS.items():
        for kw in keywords:
            if kw in text:
                coords = STATE_COORDINATES.get(state, {'lat': 20.0, 'lng': 78.0})
                jitter_lat = random.uniform(-0.03, 0.03)
                jitter_lng = random.uniform(-0.03, 0.03)
                return state, None, coords['lat'] + jitter_lat, coords['lng'] + jitter_lng
                
    return None, None, None, None

def analyze_sentiment(title: str, description: str):
    text = f"{title} {description or ''}".lower()
    positive_words = ["growth", "win", "achieve", "success", "launch", "vaccine", "benefit", "boost", "improvement", "positive", "innovative", "progress", "peace", "agreement"]
    negative_words = ["killed", "arrested", "dead", "crash", "fire", "scam", "protest", "loss", "decline", "warns", "crisis", "attack", "court", "probe", "accuses", "fail", "toll"]
    
    pos_count = sum(1 for w in positive_words if w in text)
    neg_count = sum(1 for w in negative_words if w in text)
    
    if pos_count > neg_count:
        score = random.uniform(0.1, 0.8)
        return "positive", score
    elif neg_count > pos_count:
        score = random.uniform(-0.8, -0.1)
        return "negative", score
    else:
        return "neutral", 0.0

def classify_category(title: str, description: str, gnews_category: str = "general"):
    text = f"{title} {description or ''}".lower()
    
    if "startup" in text or "founder" in text or "funding" in text or "unicorn" in text:
        return "startups"
    elif "school" in text or "exam" in text or "university" in text or "education" in text or "student" in text or "cbse" in text:
        return "education"
    elif "rain" in text or "monsoon" in text or "flood" in text or "cyclone" in text or "heatwave" in text or "weather" in text or "climate" in text:
        return "weather"
    elif "arrest" in text or "police" in text or "murder" in text or "theft" in text or "crime" in text or "court" in text or "scam" in text or "fraud" in text:
        return "crime"
    elif "cabinet" in text or "election" in text or "bjp" in text or "congress" in text or "modi" in text or "parliament" in text or "minister" in text:
        return "politics"
    elif "scheme" in text or "subsidy" in text or "government" in text or "policy" in text or "tax" in text:
        return "government"
    
    gnews_map = {
        "business": "business",
        "technology": "technology",
        "entertainment": "entertainment",
        "sports": "sports",
        "science": "science",
        "health": "health"
    }
    return gnews_map.get(gnews_category, "politics")

def seed_db_if_empty(db: Session):
    if db.query(Article).count() == 0:
        print("Seeding database with initial mock articles...")
        seed_data = get_seed_articles()
        for item in seed_data:
            db_art = Article(
                id=item["id"],
                title=item["title"],
                description=item["description"],
                content=item["content"],
                summary=item["summary"],
                ai_summary=item["ai_summary"],
                source_name=item["source_name"],
                source_url=item["source_url"],
                category=item["category"],
                state=item["state"],
                city=item["city"],
                latitude=item["latitude"],
                longitude=item["longitude"],
                published_at=item["published_at"],
                image_url=item["image_url"],
                url=item["url"],
                sentiment=item["sentiment"],
                sentiment_score=item["sentiment_score"],
                impact_local=item["impact_local"],
                impact_state=item["impact_state"],
                impact_national=item["impact_national"],
                impact_global=item["impact_global"],
                tags=item["tags"],
                is_breaking=item["is_breaking"],
                view_count=item["view_count"]
            )
            db.add(db_art)
        db.commit()
        print("Database seeded successfully.")

def generate_fallback_mock_articles(state_name: str, count: int = 5) -> list:
    """Generates realistic mock articles when the GNews API fails or is rate-limited."""
    sources = [
        {"name": "NDTV", "url": "https://ndtv.com"},
        {"name": "Times of India", "url": "https://timesofindia.com"},
        {"name": "The Hindu", "url": "https://thehindu.com"},
        {"name": "Economic Times", "url": "https://economictimes.com"},
        {"name": "India Today", "url": "https://indiatoday.in"}
    ]
    
    headlines = {
        "government": [
            "State Cabinet Approves ₹5,000 Crore Infrastructure Development Package",
            "Chief Minister Launches Digital Literacy Drive in Rural Districts",
            "State Electricity Grid to Integrate 1.2 GW Solar Project Next Month",
            "Government Earmarks Budget for Housing Subsidies in Rural Belts"
        ],
        "startups": [
            "Local Incubator Announces Funding Cohort for 15 High-Growth Ventures",
            "Fintech Enterprise Raises $12 Million Series A to Expand Operations",
            "Agritech Startup Partners with Farmers to Streamline Food Supply Chain",
            "Deeptech Platform Unveils AI Engine to Combat Ground Level Depletion"
        ],
        "weather": [
            "Monsoon Rains Expected to Hit State Borders Within Next 48 Hours",
            "Heatwave Alert: Health Advisory Issued as Temperatures Exceed 42C",
            "Heavy Rainfall Warning Issued for Coastal Areas Over Weekend",
            "Disaster Management Cell Deploys Emergency Teams in Low-Lying Zones"
        ],
        "business": [
            "Industrial Sector in State Records 15% Expansion in Quarterly Earnings",
            "E-Commerce Platform Partners with Handloom Weavers for Global Distribution",
            "Manufacturing Giant to Establish ₹2,000 Crore Assembly Unit Near Capital",
            "State Tourism Earnings Bounce Back with Record Domestic Footfall"
        ]
    }
    
    fallback_data = []
    now = datetime.utcnow()
    
    for i in range(count):
        category = random.choice(list(headlines.keys()))
        headline = random.choice(headlines[category])
        src = random.choice(sources)
        
        art_id = f"fallback-{state_name.lower()[:3]}-{i:03d}-{random.randint(1000, 9999)}"
        title = f"{state_name}: {headline}"
        desc = f"Latest developments from {state_name} regarding new initiatives, local impacts, and public responses."
        
        coords = STATE_COORDINATES.get(state_name, {'lat': 20.0, 'lng': 78.0})
        lat = coords['lat'] + random.uniform(-0.03, 0.03)
        lng = coords['lng'] + random.uniform(-0.03, 0.03)
        
        sentiment = "positive" if any(w in title for w in ["Approves", "Secures", "Launches", "Raises", "Growth", "Commissions"]) else "neutral"
        score = 0.60 if sentiment == "positive" else 0.0
        
        fallback_data.append(
            Article(
                id=art_id,
                title=title,
                description=desc,
                content=f"{title}. {desc} Local stakeholders and authorities are monitoring developments closely.",
                summary=desc,
                ai_summary=f"This is an automated local news update for {state_name} regarding: '{headline}'. Key sectors impacted include local economy and regional administration.",
                source_name=src["name"],
                source_url=src["url"],
                category=category,
                state=state_name,
                city=None,
                latitude=lat,
                longitude=lng,
                published_at=now - timedelta(hours=random.randint(2, 24)),
                image_url="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=60",
                url=f"https://{src['name'].lower().replace(' ', '')}.com/news/{art_id}",
                sentiment=sentiment,
                sentiment_score=score,
                impact_local=random.randint(40, 85),
                impact_state=random.randint(50, 90),
                impact_national=random.randint(20, 60),
                impact_global=random.randint(10, 30),
                tags=f"{state_name}, News, Local, {category.capitalize()}",
                is_breaking=random.random() < 0.12,
                view_count=random.randint(100, 4000)
            )
        )
    return fallback_data

async def fetch_news_from_gnews(db: Session, query: str = "India", category: str = "general", state_name: str = None):
    api_key = os.getenv("GNEWS_API_KEY", "103c35da7490d19bf5acd0d1b1d97194")
    if not api_key or api_key == "your_gnews_key_here":
        print("GNEWS_API_KEY not set or placeholder.")
        # Fallback immediately if state_name is set
        if state_name:
            mock_arts = generate_fallback_mock_articles(state_name)
            for m in mock_arts:
                db.add(m)
            db.commit()
            return mock_arts
        return []
        
    url = "https://gnews.io/api/v4/search"
    params = {
        "q": f'"{query}"' if " " in query else query,
        "lang": "en",
        "country": "in",
        "token": api_key,
        "max": 10
    }
    
    async with httpx.AsyncClient() as client:
        try:
            print(f"Fetching from GNews API: query='{query}'...")
            response = await client.get(url, params=params, timeout=10.0)
            if response.status_code != 200:
                print(f"GNews API status code: {response.status_code}, response: {response.text}")
                # Rate limit fallback
                if state_name:
                    print(f"Fallback: Generating mock local news for '{state_name}'...")
                    mock_arts = generate_fallback_mock_articles(state_name)
                    for m in mock_arts:
                        db.add(m)
                    db.commit()
                    return mock_arts
                return []
                
            data = response.json()
            articles = data.get("articles", [])
            print(f"Fetched {len(articles)} articles from GNews.")
            
            db_articles = []
            for art in articles:
                # Deduplicate
                existing = db.query(Article).filter(Article.url == art["url"]).first()
                if existing:
                    continue
                    
                art_id = str(uuid.uuid4())
                title = art.get("title", "")
                description = art.get("description", "")
                content = art.get("content", "")
                
                det_state, det_city, lat, lng = map_article_to_state_and_coords(title, description)
                
                if state_name and not det_state:
                    det_state = state_name
                    coords = STATE_COORDINATES.get(state_name, {'lat': 20.0, 'lng': 78.0})
                    lat = coords['lat'] + random.uniform(-0.03, 0.03)
                    lng = coords['lng'] + random.uniform(-0.03, 0.03)
                
                det_category = classify_category(title, description, category)
                sentiment, score = analyze_sentiment(title, description)
                
                published_at = datetime.utcnow()
                try:
                    pub_str = art.get("publishedAt")
                    if pub_str:
                        published_at = datetime.strptime(pub_str, "%Y-%m-%dT%H:%M:%SZ")
                except Exception as e:
                    print(f"Error parsing date {art.get('publishedAt')}: {e}")
                
                db_art = Article(
                    id=art_id,
                    title=title,
                    description=description,
                    content=content,
                    summary=description[:200] if description else "",
                    ai_summary=f"AI Summary: {description}" if description else "AI Summary not available.",
                    source_name=art.get("source", {}).get("name", "GNews"),
                    source_url=art.get("source", {}).get("url", ""),
                    category=det_category,
                    state=det_state,
                    city=det_city,
                    latitude=lat,
                    longitude=lng,
                    published_at=published_at,
                    image_url=art.get("image"),
                    url=art.get("url"),
                    sentiment=sentiment,
                    sentiment_score=score,
                    impact_local=random.randint(20, 85),
                    impact_state=random.randint(30, 90),
                    impact_national=random.randint(40, 95),
                    impact_global=random.randint(10, 75),
                    tags="India, News, " + (det_state if det_state else "National"),
                    is_breaking=random.random() < 0.15,
                    view_count=random.randint(500, 12000)
                )
                db.add(db_art)
                db_articles.append(db_art)
                
            db.commit()
            return db_articles
        except Exception as e:
            print(f"Error calling GNews API: {e}")
            db.rollback()
            # Catch-all exception fallback
            if state_name:
                print(f"Fallback (exception): Generating mock local news for '{state_name}'...")
                mock_arts = generate_fallback_mock_articles(state_name)
                for m in mock_arts:
                    db.add(m)
                db.commit()
                return mock_arts
            return []

def get_news(db: Session, category: str = None, state: str = None, q: str = None, page: int = 1, limit: int = 50):
    query = db.query(Article)
    
    if category:
        query = query.filter(Article.category == category)
    if state:
        query = query.filter(Article.state == state)
    if q:
        query = query.filter(
            or_(
                Article.title.like(f"%{q}%"),
                Article.description.like(f"%{q}%"),
                Article.tags.like(f"%{q}%")
            )
        )
        
    query = query.order_by(Article.published_at.desc())
    
    total = query.count()
    articles = query.offset((page - 1) * limit).limit(limit).all()
    
    return articles, total
