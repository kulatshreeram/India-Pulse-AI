"""
Structured request logging middleware for FastAPI.
Logs: method, path, status, duration, and client IP.
"""
import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

# Configure structured logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("india_pulse")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.monotonic()
        ip    = request.headers.get("X-Forwarded-For", request.client.host if request.client else "?")
        method = request.method
        path   = request.url.path

        response = await call_next(request)

        duration_ms = (time.monotonic() - start) * 1000
        status = response.status_code

        # Color-code by status in terminal
        if status >= 500:
            logger.error(f"{method:6} {path:50} → {status}  {duration_ms:.1f}ms  [{ip}]")
        elif status >= 400:
            logger.warning(f"{method:6} {path:50} → {status}  {duration_ms:.1f}ms  [{ip}]")
        else:
            logger.info(f"{method:6} {path:50} → {status}  {duration_ms:.1f}ms  [{ip}]")

        return response
