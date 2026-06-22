"""
In-memory LRU cache for FastAPI endpoints.
Provides ~60s TTL caching for news, analytics and states without Redis.
Usage:
    from backend.app.cache import cache_get, cache_set, make_key

    key = make_key("news", params)
    cached = cache_get(key)
    if cached: return cached
    result = ... compute ...
    cache_set(key, result)
    return result
"""
import time
import hashlib
import json
from collections import OrderedDict
from threading import Lock

# ── LRU Cache with TTL ────────────────────────────────────────────────────────

class LRUTTLCache:
    def __init__(self, maxsize: int = 256, ttl: int = 60):
        self.maxsize = maxsize
        self.ttl = ttl
        self._cache: OrderedDict = OrderedDict()
        self._lock = Lock()

    def _is_expired(self, entry) -> bool:
        return (time.monotonic() - entry["ts"]) > self.ttl

    def get(self, key: str):
        with self._lock:
            if key not in self._cache:
                return None
            entry = self._cache[key]
            if self._is_expired(entry):
                del self._cache[key]
                return None
            # Move to end (most recently used)
            self._cache.move_to_end(key)
            return entry["value"]

    def set(self, key: str, value):
        with self._lock:
            if key in self._cache:
                self._cache.move_to_end(key)
            self._cache[key] = {"value": value, "ts": time.monotonic()}
            # Evict oldest if over capacity
            while len(self._cache) > self.maxsize:
                self._cache.popitem(last=False)

    def invalidate(self, key: str):
        with self._lock:
            self._cache.pop(key, None)

    def clear(self):
        with self._lock:
            self._cache.clear()

    def __len__(self):
        return len(self._cache)


# ── Global cache instances ────────────────────────────────────────────────────
# Short TTL for real-time data (news articles change frequently)
news_cache    = LRUTTLCache(maxsize=128, ttl=30)
# Longer TTL for aggregated data (analytics/states are less volatile)
analytics_cache = LRUTTLCache(maxsize=64,  ttl=60)
states_cache    = LRUTTLCache(maxsize=64,  ttl=45)


# ── Key builder ───────────────────────────────────────────────────────────────
def make_key(*parts) -> str:
    """Build a deterministic cache key from arbitrary parts."""
    raw = "|".join(str(p) for p in parts)
    return hashlib.md5(raw.encode()).hexdigest()
