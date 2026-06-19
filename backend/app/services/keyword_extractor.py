import re
from collections import Counter

STOP_WORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "arent", "as", "at", 
    "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "cant", "cannot", "could", 
    "did", "didnt", "do", "does", "doesnt", "doing", "dont", "down", "during", "each", "few", "for", "from", "further", 
    "had", "hadnt", "has", "hasnt", "have", "havent", "having", "he", "her", "here", "hers", "herself", "him", "himself", 
    "his", "how", "i", "if", "in", "into", "is", "isnt", "it", "its", "itself", "lets", "me", "more", "most", "mustnt", 
    "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", 
    "ourselves", "out", "over", "own", "same", "shant", "she", "should", "shouldnt", "so", "some", "such", "than", "that", 
    "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they", "this", "those", "through", "to", 
    "too", "under", "until", "up", "very", "was", "wasnt", "we", "were", "werent", "what", "when", "where", "which", 
    "while", "who", "whom", "why", "with", "wont", "would", "wouldnt", "you", "your", "yours", "yourself", "yourselves",
    # News specific noise words
    "news", "india", "state", "district", "city", "lakh", "crore", "said", "says", "latest", "reported", "reporting", 
    "stating", "according", "also", "would", "could", "should", "will", "today", "yesterday", "weekly", "daily",
    "first", "second", "third", "one", "two", "three", "four", "five", "key", "pm", "am", "ministry", "minister", 
    "department", "government", "national", "regional", "local", "official", "officials", "people", "year", "years"
}

def clean_text(text: str) -> str:
    # Remove HTML tags and urls
    text = re.sub(r"<[^>]*>", "", text)
    text = re.sub(r"https?://\S+|www\.\S+", "", text)
    return text

def extract_keywords(title: str, description: str, limit: int = 6) -> list:
    """Extracts high-quality single-word and bi-gram keywords from title and description."""
    text = f"{title}. {description or ''}"
    text = clean_text(text)
    
    # 1. Identify Capitalized Phrase Entities (e.g. "Mumbai Metro", "Startup Funding")
    # Matches sequences of words starting with an uppercase letter, e.g. "Electric Vehicle"
    entities = re.findall(r"\b([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)+)\b", text)
    
    # Clean entity phrases (remove trailing punctuation, check stop words)
    cleaned_entities = []
    for ent in entities:
        ent_words = ent.lower().split()
        # Ensure it doesn't just consist of stop words
        if not all(w in STOP_WORDS for w in ent_words) and len(ent) > 3:
            # Reformat to Title case
            cleaned_entities.append(ent.title().strip())
            
    # 2. Extract Single Keywords
    # Split text into words, keeping only alphanumeric terms
    single_words = re.findall(r"\b([a-zA-Z0-9]{3,})\b", text)
    
    cleaned_singles = []
    for word in single_words:
        word_lower = word.lower()
        # Filter out stop words, numeric constants, and states/general terms
        if word_lower not in STOP_WORDS and not word.isdigit() and len(word) > 2:
            cleaned_singles.append(word.title())
            
    # Compute counts
    entity_counts = Counter(cleaned_entities)
    single_counts = Counter(cleaned_singles)
    
    # Combine lists (give entities higher weight/importance in rankings)
    scored_keywords = {}
    
    # Add entities with a weight multiplier of 2.5
    for ent, count in entity_counts.items():
        scored_keywords[ent] = count * 2.5
        
    # Add single words
    for word, count in single_counts.items():
        # Avoid duplicate single words if they are already part of an entity phrase
        is_part_of_entity = False
        for ent in scored_keywords.keys():
            if word in ent.split():
                is_part_of_entity = True
                break
        if not is_part_of_entity:
            # Add or update score
            scored_keywords[word] = scored_keywords.get(word, 0.0) + count
            
    # Sort by score descending
    sorted_keywords = sorted(scored_keywords.items(), key=lambda x: x[1], reverse=True)
    
    # Return top N keywords
    result = [kw for kw, score in sorted_keywords]
    
    # Fallback to general category / tags if empty
    if not result:
        result = ["India", "Pulse", "Update"]
        
    return result[:limit]
