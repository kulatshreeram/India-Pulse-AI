"""
In-memory token-bucket rate limiter for FastAPI.
No Redis or external dependencies required.

Usage:
    from backend.app.middleware.rate_limit import RateLimitMiddleware
    app.add_middleware(RateLimitMiddleware)

Configuration per route prefix:
    RATE_LIMITS = {
        "/api/chat":    (10,  60),  # 10 requests per 60 seconds
        "/api/news":    (100, 60),  # 100 requests per 60 seconds
        "/api/reports": (5,   60),  # 5 requests per 60 seconds
        "default":      (120, 60),  # 120 requests per 60 seconds
    }
"""
import time
from collections import defaultdict
from threading import Lock
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

# ── Rate limit rules: (max_requests, window_seconds) ─────────────────────────
RATE_LIMITS: dict[str, tuple[int, int]] = {
    "/api/chat":    (10,  60),
    "/api/reports": (5,   60),
    "/api/news":    (100, 60),
    "/api/search":  (60,  60),
    "default":      (200, 60),
}

class _Bucket:
    """Token bucket per (client_ip, route_prefix)."""
    __slots__ = ("tokens", "last_refill")

    def __init__(self, capacity: int):
        self.tokens = capacity
        self.last_refill = time.monotonic()

    def consume(self, capacity: int, window: int) -> bool:
        now = time.monotonic()
        elapsed = now - self.last_refill
        # Refill tokens proportionally to elapsed time
        refill = (elapsed / window) * capacity
        self.tokens = min(capacity, self.tokens + refill)
        self.last_refill = now
        if self.tokens >= 1:
            self.tokens -= 1
            return True  # Allowed
        return False  # Rate limited


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self._buckets: dict[str, _Bucket] = defaultdict(lambda: _Bucket(200))
        self._lock = Lock()

    def _get_limit(self, path: str) -> tuple[int, int]:
        for prefix, limits in RATE_LIMITS.items():
            if prefix != "default" and path.startswith(prefix):
                return limits
        return RATE_LIMITS["default"]

    def _get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        ip   = self._get_client_ip(request)
        capacity, window = self._get_limit(path)

        bucket_key = f"{ip}:{path.split('/')[2] if path.count('/') >= 2 else path}"

        with self._lock:
            bucket = self._buckets[bucket_key]
            if not isinstance(bucket, _Bucket):
                bucket = _Bucket(capacity)
                self._buckets[bucket_key] = bucket
            allowed = bucket.consume(capacity, window)

        if not allowed:
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Rate limit exceeded",
                    "message": f"Too many requests. Limit: {capacity} per {window}s.",
                    "retry_after": window,
                },
                headers={"Retry-After": str(window)},
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"]  = str(capacity)
        response.headers["X-RateLimit-Window"] = str(window)
        return response
