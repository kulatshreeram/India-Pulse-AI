import os
import re
import hashlib
import httpx
from sqlalchemy.orm import Session
from backend.app.models.news import Base, Column, Integer, String, DateTime
from datetime import datetime
from backend.app.services.ai_summary import get_openai_api_key

# SQLAlchemy model for Translation cache
class TranslationCache(Base):
    __tablename__ = "translation_cache"

    id = Column(Integer, primary_key=True, index=True)
    text_hash = Column(String, index=True) # md5 of original text
    target_lang = Column(String, index=True) # 'hi', 'mr', 'en'
    original_text = Column(String)
    translated_text = Column(String)
    translated_at = Column(DateTime, default=datetime.utcnow)

# Static dictionary for quick UI translation fallbacks
MOCK_TRANSLATIONS = {
    "hi": {
        "Maharashtra Today": "महाराष्ट्र आज",
        "Delhi Today": "दिल्ली आज",
        "Karnataka Today": "कर्नाटक आज",
        "Tamil Nadu Today": "तमिलनाडु आज",
        "Politics": "राजनीति",
        "Technology": "तकनीक",
        "Business": "व्यापार",
        "Sports": "खेल",
        "Startups": "स्टार्टअप",
        "Weather": "मौसम",
        "Crime": "अपराध",
        "Education": "शिक्षा",
        "Science": "विज्ञान",
        "Entertainment": "मनोरंजन",
        "Health": "स्वास्थ्य",
        "Government": "सरकार",
        "Breaking News": "मुख्य समाचार",
        "Read Full Article": "पूरा लेख पढ़ें",
        "You May Also Like": "आपको यह भी पसंद आ सकता है",
        "Related Stories": "संबंधित खबरें",
        "State Feed": "राज्य समाचार",
        "AI State Summary": "एआई राज्य सारांश",
        "Generate State Summary": "राज्य सारांश उत्पन्न करें",
        "News Volume — Last 7 Days": "समाचार मात्रा — पिछले 7 दिन",
        "Sentiment Distribution": "भावना वितरण",
        "Most Active States": "सबसे सक्रिय राज्य",
        "Category Sentiment Analysis": "श्रेणी भावना विश्लेषण",
        "News Mood Indicator": "समाचार मूड संकेतक",
        "Top 10 Trending Topics": "शीर्ष 10 ट्रेंडिंग विषय",
        "Category Breakdown": "श्रेणी विवरण",
        "State Mood Dashboard": "राज्य मूड डैशबोर्ड",
        "Related Stories": "संबंधित कहानियाँ",
        "News Analytics": "समाचार विश्लेषिकी",
        "Real-time intelligence about what's happening across India": "भारत भर में क्या हो रहा है, इसके बारे में वास्तविक समय की जानकारी",
        "Live Map": "लाइव मानचित्र",
        "AI Chat": "एआई चैट",
        "Analytics": "विश्लेषण",
        "Explore Map": "मानचित्र खोजें",
        "Articles": "लेख",
        "Total Articles": "कुल लेख",
        "States Covered": "कवर किए गए राज्य",
        "AI Summaries": "एआई सारांश",
        "Categories": "श्रेणियाँ",
        "Positive": "सकारात्मक",
        "Neutral": "तटस्थ",
        "Negative": "नकारात्मक",
        "Trending Today": "आज का ट्रेंडिंग",
        "Most Discussed State": "सबसे चर्चित राज्य",
        "Top Category": "शीर्ष श्रेणी",
        "Top Stories Right Now": "अभी की मुख्य खबरें",
        "Explore Live Map": "लाइव मानचित्र खोजें",
        "Try AI Assistant": "एआई सहायक आज़माएं",
        "Ask anything about Indian news...": "भारतीय समाचारों के बारे में कुछ भी पूछें...",
        "Ask": "पूछें",
        "Ask Assistant": "सहायक से पूछें",
        "Clear Chat": "चैट साफ़ करें",
        "Sources": "स्रोत"
    },
    "mr": {
        "Maharashtra Today": "महाराष्ट्र आज",
        "Delhi Today": "दिल्ली आज",
        "Karnataka Today": "कर्नाटक आज",
        "Tamil Nadu Today": "तामिळनाडू आज",
        "Politics": "राजकारण",
        "Technology": "तंत्रज्ञान",
        "Business": "व्यवसाय",
        "Sports": "क्रीडा",
        "Startups": "स्टार्टअप",
        "Weather": "हवामान",
        "Crime": "गुन्हेगारी",
        "Education": "शिक्षण",
        "Science": "विज्ञान",
        "Entertainment": "मनोरंजन",
        "Health": "आरोग्य",
        "Government": "शासकीय",
        "Breaking News": "ब्रेकिंग न्यूज",
        "Read Full Article": "पूर्ण बातमी वाचा",
        "You May Also Like": "तुम्हाला हे देखील आवडेल",
        "Related Stories": "संबंधित बातम्या",
        "State Feed": "राज्य बातमीपत्र",
        "AI State Summary": "एआई राज्य सारांश",
        "Generate State Summary": "राज्य सारांश तयार करा",
        "News Volume — Last 7 Days": "बातम्यांची संख्या — मागील ७ दिवस",
        "Sentiment Distribution": "भावना वितरण",
        "Most Active States": "सर्वात सक्रिय राज्ये",
        "Category Sentiment Analysis": "श्रेणी भावना विश्लेषण",
        "News Mood Indicator": "बातम्यांचा मूड दर्शक",
        "Top 10 Trending Topics": "शीर्ष १० ट्रेंडिंग विषय",
        "Category Breakdown": "श्रेणीनुसार वर्गीकरण",
        "State Mood Dashboard": "राज्य मूड डॅशबोर्ड",
        "Related Stories": "संबंधित बातम्या",
        "News Analytics": "बातम्यांचे विश्लेषण",
        "Real-time intelligence about what's happening across India": "भारतामध्ये काय घडत आहे याविषयी रिअल-टाइम माहिती",
        "Live Map": "लाइव्ह नकाशा",
        "AI Chat": "एआई चॅट",
        "Analytics": "विश्लेषण",
        "Explore Map": "नकाशा एक्सप्लोर करा",
        "Articles": "लेख",
        "Total Articles": "एकूण लेख",
        "States Covered": "कव्हर केलेली राज्ये",
        "AI Summaries": "एआय सारांश",
        "Categories": "श्रेण्या",
        "Positive": "सकारात्मक",
        "Neutral": "तटस्थ",
        "Negative": "नकारात्मक",
        "Trending Today": "आजचे ट्रेंडिंग",
        "Most Discussed State": "सर्वात जास्त चर्चेतील राज्य",
        "Top Category": "शीर्ष श्रेणी",
        "Top Stories Right Now": "सध्याच्या महत्त्वाच्या बातम्या",
        "Explore Live Map": "लाइव्ह नकाशा एक्सप्लोर करा",
        "Try AI Assistant": "एआय असिस्टंट वापरून पहा",
        "Ask anything about Indian news...": "भारतीय बातम्यांबद्दल काहीही विचारा...",
        "Ask": "विचारा",
        "Ask Assistant": "असिस्टंटला विचारा",
        "Clear Chat": "चॅट साफ करा",
        "Sources": "स्रोत"
    }
}

# Devanagari to English mapping for common search query terms (fallback/quick translation)
DEVANA_TO_ENGLISH = {
    "महाराष्ट्र": "Maharashtra",
    "मुंबई": "Mumbai",
    "दिल्ली": "Delhi",
    "कर्नाटक": "Karnataka",
    "बेंगलुरु": "Bengaluru",
    "बेंगळुरू": "Bengaluru",
    "पुणे": "Pune",
    "गुजरात": "Gujarat",
    "राजस्थान": "Rajasthan",
    "गोवा": "Goa",
    "उत्तर प्रदेश": "Uttar Pradesh",
    "तमिलनाडु": "Tamil Nadu",
    "तामिळनाडू": "Tamil Nadu",
    "स्टार्टअप": "Startups",
    "स्टार्टअप्स": "Startups",
    "राजनीति": "Politics",
    "राजकारण": "Politics",
    "खेल": "Sports",
    "क्रीडा": "Sports",
    "व्यापार": "Business",
    "व्यवसाय": "Business",
    "उद्योग": "Business",
    "तकनीक": "Technology",
    "तंत्रज्ञान": "Technology",
    "मौसम": "Weather",
    "हवामान": "Weather",
    "अपराध": "Crime",
    "गुन्हेगारी": "Crime",
    "शिक्षा": "Education",
    "शिक्षण": "Education",
    "मनोरंजन": "Entertainment",
    "विज्ञान": "Science",
    "स्वास्थ्य": "Health",
    "आरोग्य": "Health",
    "सरकार": "Government",
    "शासकीय": "Government",
    "मुख्य समाचार": "Breaking News",
    "ब्रेकिंग न्यूज": "Breaking News",
    "भारत": "India",
    "भारतीय": "Indian"
}

async def translate_text(text: str, target_lang: str, db: Session) -> str:
    """Translates text from English to target_lang ('hi' or 'mr') or vice versa using OpenAI, with caching."""
    if not text or not text.strip():
        return text
        
    target_lang = target_lang.lower().strip()
    if target_lang == "en" and not any(ord(char) >= 0x0900 and ord(char) <= 0x097F for char in text):
        return text
        
    # Check cache first
    text_hash = hashlib.md5(text.encode("utf-8")).hexdigest()
    cached = db.query(TranslationCache).filter(
        TranslationCache.text_hash == text_hash,
        TranslationCache.target_lang == target_lang
    ).first()
    
    if cached:
        return cached.translated_text
        
    # Check static quick translations
    cleaned = text.strip().replace("•", "").replace("-", "").strip()
    if len(text) < 100:
        if target_lang != "en":
            if cleaned in MOCK_TRANSLATIONS.get(target_lang, {}):
                return MOCK_TRANSLATIONS[target_lang][cleaned]
        else:
            if cleaned in DEVANA_TO_ENGLISH:
                return DEVANA_TO_ENGLISH[cleaned]
            # Try word replacements
            words_mapped = []
            for w in cleaned.split():
                words_mapped.append(DEVANA_TO_ENGLISH.get(w, w))
            if any(w != orig for w, orig in zip(words_mapped, cleaned.split())):
                return " ".join(words_mapped)

    # Call OpenAI to perform translation
    api_key = get_openai_api_key()
    translated_text = ""
    
    if api_key:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        if target_lang == "en":
            prompt = (
                "You are an expert translator. Translate the provided Hindi or Marathi text into clear, standard English. "
                "Keep the tone strictly factual and professional. Return ONLY the translated English text, no explanations."
            )
        else:
            lang_name = "Hindi" if target_lang == "hi" else "Marathi"
            prompt = (
                f"You are a professional translator. Translate the provided English text into grammatically correct, natural {lang_name}. "
                "Preserve formatting like bullet points, numbers, and proper nouns. Return ONLY the translation, no intro or explanations."
            )
            
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": prompt},
                {"role": "user", "content": text}
            ],
            "temperature": 0.1,
            "max_tokens": 1000
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json=payload, timeout=12.0)
                if response.status_code == 200:
                    result = response.json()
                    translated_text = result["choices"][0]["message"]["content"].strip()
        except Exception as e:
            print(f"Exception during OpenAI translation call: {e}")
            
    # Mock Translation Fallback
    if not translated_text:
        if target_lang == "en":
            # Very simple Devanagari translation fallback for search
            modified_text = text
            for dev, eng in DEVANA_TO_ENGLISH.items():
                modified_text = re.sub(re.escape(dev), eng, modified_text, flags=re.IGNORECASE)
            translated_text = modified_text
        else:
            lang_prefix = "[हिंदी]" if target_lang == "hi" else "[मराठी]"
            # Replace common UI terms dynamically
            modified_text = text
            for eng, trans in MOCK_TRANSLATIONS.get(target_lang, {}).items():
                modified_text = re.sub(r'\b' + re.escape(eng) + r'\b', trans, modified_text, flags=re.IGNORECASE)
            translated_text = f"{lang_prefix} {modified_text}"
            
    # Cache translation
    try:
        db_trans = TranslationCache(
            text_hash=text_hash,
            target_lang=target_lang,
            original_text=text,
            translated_text=translated_text
        )
        db.add(db_trans)
        db.commit()
    except Exception as e:
        print(f"Error caching translation: {e}")
        db.rollback()
        
    return translated_text
