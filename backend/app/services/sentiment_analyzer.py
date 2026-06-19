import os
import re

# Global cache for initialized sentiment models to avoid reloading on every call
_VADER_ANALYZER = None
_TRANSFORMERS_PIPELINE = None

# Lexical dictionaries for fallback sentiment analyzer
POSITIVE_WORDS = {
    "growth", "win", "achieve", "success", "launch", "vaccine", "benefit", "boost",
    "improvement", "positive", "innovative", "progress", "peace", "agreement", "investment",
    "funding", "partnership", "expand", "record", "happy", "excellent", "safe", "secure",
    "clean", "green", "sustainable", "delight", "celebrate", "proud", "enable", "opportunity",
    "support", "strengthen", "upgrade", "optimize", "historic", "leading", "top"
}

NEGATIVE_WORDS = {
    "killed", "arrested", "dead", "crash", "fire", "scam", "protest", "loss", "decline",
    "warns", "crisis", "attack", "court", "probe", "accuses", "fail", "toll", "accident",
    "blast", "clash", "violence", "strike", "disaster", "injury", "corrupt", "illegal",
    "suspend", "scare", "threat", "danger", "leak", "hospitalized", "suicide", "fraud",
    "arrest", "murder", "theft", "complaint", "demolish", "shutdown", "deficit", "inflation"
}

NEGATIONS = {"not", "no", "never", "neither", "nor", "but", "however", "cannot", "prevent"}
INTENSIFIERS = {"very", "extremely", "highly", "greatly", "significantly", "remarkably"}

def fallback_lexical_sentiment(text: str) -> dict:
    """Pure-Python high-fidelity lexical sentiment analyzer that outputs labels and probabilities."""
    cleaned_text = re.sub(r"[^\w\s]", "", text.lower())
    words = cleaned_text.split()
    
    pos_score = 0.0
    neg_score = 0.0
    
    i = 0
    while i < len(words):
        word = words[i]
        word_weight = 1.0
        
        # Check preceding intensifier
        if i > 0 and words[i-1] in INTENSIFIERS:
            word_weight = 1.8
        
        # Check preceding negation
        is_negated = False
        if i > 0 and words[i-1] in NEGATIONS:
            is_negated = True
        elif i > 1 and words[i-2] in NEGATIONS:
            is_negated = True
            
        if word in POSITIVE_WORDS:
            if is_negated:
                neg_score += word_weight * 0.5  # Positive word negated acts as negative
            else:
                pos_score += word_weight
        elif word in NEGATIVE_WORDS:
            if is_negated:
                pos_score += word_weight * 0.3  # Negative word negated acts as slightly positive
            else:
                neg_score += word_weight
        i += 1
        
    total_val = pos_score + neg_score
    if total_val == 0:
        return {
            "sentiment": "neutral",
            "score": 0.0,
            "positive": 0.05,
            "negative": 0.05,
            "neutral": 0.90
        }
        
    # Compute relative probabilities
    pos_prob = round(pos_score / (total_val + 2.0), 3)
    neg_prob = round(neg_score / (total_val + 2.0), 3)
    # Give a slight baseline to neutral
    neu_prob = round(1.0 - pos_prob - neg_prob, 3)
    
    # Calculate compound score between -1 and 1
    score = pos_prob - neg_prob
    
    if score >= 0.15:
        sentiment = "positive"
    elif score <= -0.15:
        sentiment = "negative"
    else:
        sentiment = "neutral"
        
    return {
        "sentiment": sentiment,
        "score": score,
        "positive": pos_prob,
        "negative": neg_prob,
        "neutral": neu_prob
    }

def analyze_sentiment(title: str, description: str) -> dict:
    """Ensemble sentiment analyzer attempting transformers -> vader -> textblob -> fallback."""
    global _VADER_ANALYZER, _TRANSFORMERS_PIPELINE
    
    text = f"{title}. {description or ''}"
    method = os.getenv("SENTIMENT_METHOD", "").lower()
    
    # ── Method 1: Hugging Face Transformers (Advanced) ──
    if method == "transformers" or not method:
        try:
            if _TRANSFORMERS_PIPELINE is None:
                from transformers import pipeline
                # Use a fast, standard light model
                _TRANSFORMERS_PIPELINE = pipeline(
                    "sentiment-analysis", 
                    model="distilbert-base-uncased-finetuned-sst-2-english"
                )
            
            res = _TRANSFORMERS_PIPELINE(text[:512])[0]
            label = res["label"].lower() # 'positive' or 'negative'
            score = res["score"] # confidence
            
            if label == "positive":
                pos = score
                neg = 1.0 - score
                sentiment = "positive" if score > 0.6 else "neutral"
            else:
                neg = score
                pos = 1.0 - score
                sentiment = "negative" if score > 0.6 else "neutral"
                
            neu = 1.0 - pos - neg
            # Standardize score from -1.0 to 1.0
            sentiment_score = pos - neg
            
            return {
                "sentiment": sentiment,
                "score": round(sentiment_score, 3),
                "positive": round(pos, 3),
                "negative": round(neg, 3),
                "neutral": round(neu, 3)
            }
        except Exception:
            # Silence and fall through if transformers not available
            pass

    # ── Method 2: VADER (SentimentIntensityAnalyzer) ──
    if method == "vader" or not method:
        try:
            if _VADER_ANALYZER is None:
                try:
                    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
                    _VADER_ANALYZER = SentimentIntensityAnalyzer()
                except ImportError:
                    # Alternative import path (e.g. from NLTK)
                    from nltk.sentiment.vader import SentimentIntensityAnalyzer
                    _VADER_ANALYZER = SentimentIntensityAnalyzer()
                    
            scores = _VADER_ANALYZER.polarity_scores(text)
            
            compound = scores["compound"]
            pos = scores["pos"]
            neg = scores["neg"]
            neu = scores["neu"]
            
            if compound >= 0.05:
                sentiment = "positive"
            elif compound <= -0.05:
                sentiment = "negative"
            else:
                sentiment = "neutral"
                
            return {
                "sentiment": sentiment,
                "score": round(compound, 3),
                "positive": round(pos, 3),
                "negative": round(neg, 3),
                "neutral": round(neu, 3)
            }
        except Exception:
            pass

    # ── Method 3: TextBlob ──
    if method == "textblob" or not method:
        try:
            from textblob import TextBlob
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity
            
            # Map polarity to positive/negative/neutral
            if polarity >= 0.1:
                sentiment = "positive"
                pos = polarity
                neg = 0.0
            elif polarity <= -0.1:
                sentiment = "negative"
                pos = 0.0
                neg = abs(polarity)
            else:
                sentiment = "neutral"
                pos = 0.0
                neg = 0.0
                
            neu = 1.0 - pos - neg
            
            return {
                "sentiment": sentiment,
                "score": round(polarity, 3),
                "positive": round(pos, 3),
                "negative": round(neg, 3),
                "neutral": round(neu, 3)
            }
        except Exception:
            pass

    # ── Method 4: Fallback Pure-Python Lexical Sentiment Analyzer ──
    return fallback_lexical_sentiment(text)
