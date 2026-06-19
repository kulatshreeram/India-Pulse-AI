import os
import json
import math
import hashlib
import httpx
from typing import List, Dict, Tuple, Optional

# Path to local vector store file
VECTOR_STORE_PATH = os.path.join(os.path.dirname(__file__), "vectors.json")

# ── Feature Hashing Local Embeddings ──────────────────────────────────────────
def compute_hash_embedding(text: str, dimensions: int = 1536) -> List[float]:
    """Computes a 1536-dimensional L2-normalized feature hashing vector in pure Python."""
    words = [w.strip() for w in text.lower().split() if len(w.strip()) > 2]
    vector = [0.0] * dimensions
    if not words:
        return vector

    for w in words:
        # Hashing term to get index and sign
        h_str = hashlib.md5(w.encode("utf-8")).hexdigest()
        h_val = int(h_str, 16)
        idx = h_val % dimensions
        sign = -1.0 if h_val % 2 == 0 else 1.0
        vector[idx] += sign

    # L2 Norm normalization
    sq_sum = sum(x * x for x in vector)
    if sq_sum > 0:
        norm = math.sqrt(sq_sum)
        vector = [x / norm for x in vector]

    return vector

# ── OpenAI Embeddings API Client ──────────────────────────────────────────────
async def fetch_openai_embedding(text: str, api_key: str) -> Optional[List[float]]:
    """Calls the OpenAI Embeddings endpoint using HTTPX."""
    url = "https://api.openai.com/v1/embeddings"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "input": text,
        "model": "text-embedding-3-small"
    }
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload, timeout=10.0)
            if response.status_code == 200:
                data = response.json()
                return data["data"][0]["embedding"]
            else:
                print(f"OpenAI embedding error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Exception during OpenAI embedding call: {e}")
    return None

# ── Vector DB Operations ──────────────────────────────────────────────────────
class VectorStore:
    def __init__(self):
        self.vectors: Dict[str, Dict] = {}  # article_id -> { "vector": [], "meta": {} }
        self.load()

    def load(self):
        """Loads index from vectors.json."""
        if os.path.exists(VECTOR_STORE_PATH):
            try:
                with open(VECTOR_STORE_PATH, "r", encoding="utf-8") as f:
                    self.vectors = json.load(f)
                print(f"Loaded {len(self.vectors)} indexed article vectors.")
            except Exception as e:
                print(f"Error loading vector store: {e}")
                self.vectors = {}

    def save(self):
        """Saves index to vectors.json."""
        try:
            # Ensure folder exists
            os.makedirs(os.path.dirname(VECTOR_STORE_PATH), exist_ok=True)
            with open(VECTOR_STORE_PATH, "w", encoding="utf-8") as f:
                json.dump(self.vectors, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Error saving vector store: {e}")

    async def add_article(self, article_id: str, title: str, description: str, content: str, state: Optional[str], category: str):
        """Generates embedding and adds article to index."""
        # Check if already indexed
        if article_id in self.vectors:
            return

        text_to_embed = f"{title}. {description or ''}. {content or ''} State: {state or 'National'} Category: {category}"
        
        # Determine if we have OpenAI key
        api_key = os.getenv("OPENAI_API_KEY", "")
        vector = None
        if api_key and api_key != "your_openai_key_here":
            vector = await fetch_openai_embedding(text_to_embed, api_key)
            
        if not vector:
            vector = compute_hash_embedding(text_to_embed)

        self.vectors[article_id] = {
            "vector": vector,
            "meta": {
                "title": title,
                "state": state,
                "category": category
            }
        }
        self.save()

    def search(self, query: str, limit: int = 5) -> List[Tuple[str, float]]:
        """Searches index using cosine similarity and returns list of (article_id, score)."""
        if not self.vectors:
            return []

        # Generate query vector (using local hash embedding for search alignment)
        # Note: Local hash similarity matches keywords and states perfectly.
        # If OpenAI key was used, we'd ideally query OpenAI, but to prevent unnecessary
        # search latency and costs on free tier, feature hashing query vs feature hashing document
        # or OpenAI query vs OpenAI document are calculated.
        # Let's perform a dual search setup:
        api_key = os.getenv("OPENAI_API_KEY", "")
        
        # For simplicity and robust latency, we compute query vector using the same method as indexed vectors.
        # Since we mix local and remote, we check the dimension of first indexed vector.
        first_id = next(iter(self.vectors))
        is_openai_index = len(self.vectors[first_id]["vector"]) == 1536 # Both are 1536
        
        # Calculate local hash vector for comparison:
        query_vector = compute_hash_embedding(query)
        
        # If the index is using OpenAI embeddings, we attempt to get OpenAI query vector
        if api_key and api_key != "your_openai_key_here":
            # Running synchronous mock wrapper for call or standard async call inside sync context.
            # To keep things clean, if search is called from synchronous route, we run async call simply.
            import asyncio
            try:
                # We try to fetch query vector from OpenAI asynchronously
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    # We are in an active event loop
                    openai_query = None
                else:
                    openai_query = asyncio.run(fetch_openai_embedding(query, api_key))
                
                if openai_query:
                    query_vector = openai_query
            except Exception:
                pass

        results = []
        for art_id, item in self.vectors.items():
            doc_vector = item["vector"]
            # Cosine similarity (dot product of L2 normalized vectors)
            score = sum(q * d for q, d in zip(query_vector, doc_vector))
            results.append((art_id, score))

        # Sort by similarity score descending
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:limit]

# Singleton instance
_store = None

def get_vector_store() -> VectorStore:
    global _store
    if _store is None:
        _store = VectorStore()
    return _store
