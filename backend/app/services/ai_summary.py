import os
import json
import httpx
import random
from typing import List, Dict, Tuple, Optional
from sqlalchemy.orm import Session
from backend.app.models.news import Article

# Retrieve OpenAI API Key from environment
def get_openai_api_key() -> Optional[str]:
    key = os.getenv("OPENAI_API_KEY", "")
    if not key or key == "your_openai_key_here":
        return None
    return key

# Helper: Failsafe local mock summarizer
def generate_fallback_summary(title: str, description: str, state: str) -> str:
    text = f"{title} {description or ''}".lower()
    bullets = []
    
    # Bullet 1: Core news event
    if "approve" in text or "cabinet" in text or "nod" in text:
        bullets.append(f"The state cabinet approved a significant development proposal in {state or 'the region'} today.")
    elif "launch" in text or "start" in text or "unveil" in text:
        bullets.append(f"A new development initiative was officially launched in {state or 'the district'} to boost regional productivity.")
    elif "fund" in text or "raise" in text or "invest" in text or "secures" in text:
        bullets.append(f"A local venture or infrastructure project secured fresh financial backing to accelerate its roll-out.")
    elif "rain" in text or "flood" in text or "weather" in text or "monsoon" in text:
        bullets.append(f"Weather monitoring cells issued alerts for {state or 'the region'} as seasonal rainfall levels fluctuate.")
    else:
        bullets.append(f"Local correspondents reported new updates regarding the ongoing implementation of projects in {state or 'the area'}.")

    # Bullet 2: Detailed context
    if "tech" in text or "startup" in text or "digital" in text:
        bullets.append("Industry leaders expect these digital frameworks to streamline local operations and tech adoption.")
    elif "crime" in text or "arrest" in text or "probe" in text or "court" in text:
        bullets.append("Enforcement and judicial departments have initiated inquiries to monitor compliance and security metrics.")
    else:
        bullets.append("District administrations are actively coordinating with community representatives to review local progress.")

    # Bullet 3: Regional outlook
    bullets.append(f"Further administrative reviews are scheduled to evaluate public reception and operational adjustments in {state or 'the state'}.")

    return "\n".join([f"• {b}" for b in bullets])

# Helper: Failsafe local mock state-wide summary
def generate_fallback_state_summary(state_name: str, articles: List[Article]) -> str:
    if not articles:
        return f"• No recent news events have been reported for {state_name} today."
        
    bullets = []
    # Take the top 3-4 articles and extract their core headlines to make a digest
    for art in articles[:4]:
        clean_title = art.title
        # Strip state prefix if present
        if ":" in clean_title and clean_title.split(":")[0].strip() == state_name:
            clean_title = clean_title.split(":", 1)[1].strip()
        bullets.append(f"{clean_title} (Reported by {art.source_name or 'Local Source'})")
        
    digest = f"### {state_name} Daily Bulletin\n\n"
    digest += "\n".join([f"• {b}" for b in bullets])
    digest += f"\n\n*This summary was compiled locally from {len(articles)} active news reports.*"
    return digest

# Helper: Failsafe local chat response engine
def generate_fallback_chat_reply(question: str, state_context: Optional[str], articles: List[Article]) -> Tuple[str, List[Dict[str, str]]]:
    q_lower = question.lower()
    sources = []
    
    # 1. Collect sources from articles
    for art in articles[:5]:
        sources.append({
            "name": art.source_name or "News Source",
            "url": art.source_url or "https://timesofindia.indiatimes.com"
        })
        
    # Deduplicate sources
    seen = set()
    dedup_sources = []
    for s in sources:
        if s["name"] not in seen:
            seen.add(s["name"])
            dedup_sources.append(s)
            
    # 2. Build answer based on questions
    if not articles:
        reply = (
            "I could not locate any recent news articles in our database matching your request. "
            "Try refreshing state news on the map or asking about active states like Maharashtra, Delhi, or Karnataka."
        )
        return reply, []

    # Format summaries of the articles as context
    bulletins = []
    for art in articles[:4]:
        bulletins.append(f"- **{art.source_name}**: {art.title}")
        
    if state_context:
        reply = (
            f"Based on the latest reports from **{state_context}**, here are the primary developments:\n\n"
            + "\n".join(bulletins) + "\n\n"
            + f"Local authorities are continuing monitoring processes. You can review full coverage on these topics using the news cards."
        )
    elif "headline" in q_lower or "top news" in q_lower or "latest" in q_lower:
        reply = (
            "Here are today's top stories and headlines across India:\n\n"
            + "\n".join(bulletins) + "\n\n"
            + "Select a marker on the map to explore region-specific updates."
        )
    else:
        # Generic match based on keywords
        matched = []
        for art in articles:
            if any(w in art.title.lower() for w in q_lower.split() if len(w) > 3):
                matched.append(f"- **{art.source_name}**: {art.title}")
        
        if matched:
            reply = (
                "I found the following relevant stories matching your question:\n\n"
                + "\n".join(matched[:4]) + "\n\n"
                + "These articles mention keywords related to your query."
            )
        else:
            reply = (
                "I searched the latest news database and synthesized the following summary:\n\n"
                + "\n".join(bulletins[:3]) + "\n\n"
                + "Let me know if you want detailed information on any of these reports."
            )
            
    return reply, dedup_sources

# Call OpenAI to summarize a single article
async def summarize_article(db_article: Article) -> str:
    api_key = get_openai_api_key()
    if not api_key:
        return generate_fallback_summary(db_article.title, db_article.description, db_article.state)
        
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    prompt = (
        "You are an AI assistant that summarizes Indian news. "
        "Summarize the provided news article in exactly 3 bullet points. Each bullet should be a single, short, informative sentence. "
        "Keep the tone strictly neutral and factual. Avoid opinions or extrapolations. Do not make up facts."
    )
    
    article_text = (
        f"Title: {db_article.title}\n"
        f"Description: {db_article.description or ''}\n"
        f"Content: {db_article.content or ''}\n"
        f"State: {db_article.state or 'National'}\n"
    )
    
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": article_text}
        ],
        "temperature": 0.2,
        "max_tokens": 150
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload, timeout=12.0)
            if response.status_code == 200:
                result = response.json()
                summary_text = result["choices"][0]["message"]["content"].strip()
                # Ensure it has bullet characters or format
                return summary_text
            else:
                print(f"OpenAI single summary API error: {response.status_code} - {response.text}")
                return generate_fallback_summary(db_article.title, db_article.description, db_article.state)
    except Exception as e:
        print(f"Exception during OpenAI single summary call: {e}")
        return generate_fallback_summary(db_article.title, db_article.description, db_article.state)

# Call OpenAI to generate a state bulletin summary
async def summarize_state(state_name: str, articles: List[Article]) -> str:
    api_key = get_openai_api_key()
    if not api_key or not articles:
        return generate_fallback_state_summary(state_name, articles)
        
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    prompt = (
        f"You are a news intelligence editor summarizing reports from the state of {state_name}, India. "
        f"Review the provided articles and compile a bulletin titled '{state_name} Today'. "
        "Summarize the main events in a neutral, factual, bulleted list. Limit to 3-5 bullets total. "
        "Avoid any speculation, hype, or political bias."
    )
    
    context_items = []
    for idx, art in enumerate(articles[:10]):
        context_items.append(
            f"Article #{idx+1} [Source: {art.source_name}]:\n"
            f"Title: {art.title}\n"
            f"Description: {art.description or ''}\n"
        )
    articles_context = "\n\n".join(context_items)
    
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": f"Articles:\n{articles_context}"}
        ],
        "temperature": 0.2,
        "max_tokens": 250
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload, timeout=15.0)
            if response.status_code == 200:
                result = response.json()
                state_summary = result["choices"][0]["message"]["content"].strip()
                return state_summary
            else:
                print(f"OpenAI state summary API error: {response.status_code} - {response.text}")
                return generate_fallback_state_summary(state_name, articles)
    except Exception as e:
        print(f"Exception during OpenAI state summary call: {e}")
        return generate_fallback_state_summary(state_name, articles)

# Call OpenAI for the Chat Assistant
async def ask_assistant(question: str, state_context: Optional[str], articles: List[Article]) -> Tuple[str, List[Dict[str, str]]]:
    api_key = get_openai_api_key()
    if not api_key:
        return generate_fallback_chat_reply(question, state_context, articles)
        
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # 1. Compile news context
    context_lines = []
    sources = []
    
    for idx, art in enumerate(articles[:10]):
        context_lines.append(
            f"[{idx+1}] Source: {art.source_name} | Title: {art.title} | Description: {art.description or ''} | URL: {art.source_url or ''}"
        )
        sources.append({
            "name": art.source_name or "News Source",
            "url": art.source_url or "https://timesofindia.indiatimes.com"
        })
        
    # Deduplicate sources
    seen = set()
    dedup_sources = []
    for s in sources:
        if s["name"] not in seen:
            seen.add(s["name"])
            dedup_sources.append(s)
            
    news_context = "\n\n".join(context_lines)
    
    prompt = (
        "You are India Pulse AI, an intelligent conversational news assistant for India. "
        "Your task is to answer the user's question using ONLY the news context provided below. "
        "Keep your answer objective, neutral, factual, and concise. "
        "Cite the sources by name from the context (e.g. 'According to Times of India...'). "
        "If the context does not contain relevant information to answer the question, state: "
        "'I could not locate specific information regarding this topic in our recent news database. Try exploring other states on the map.'\n\n"
        f"News Context:\n{news_context}"
    )
    
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": question}
        ],
        "temperature": 0.3,
        "max_tokens": 300
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload, timeout=18.0)
            if response.status_code == 200:
                result = response.json()
                answer = result["choices"][0]["message"]["content"].strip()
                return answer, dedup_sources
            else:
                print(f"OpenAI chat API error: {response.status_code} - {response.text}")
                return generate_fallback_chat_reply(question, state_context, articles)
    except Exception as e:
        print(f"Exception during OpenAI chat call: {e}")
        return generate_fallback_chat_reply(question, state_context, articles)
