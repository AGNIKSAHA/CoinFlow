from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import time
from collections import defaultdict
from fastapi import HTTPException, status
from app.core.config import settings

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

class SimpleRateLimiterMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int = 120):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.client_requests = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        
        # Clean timestamps older than 60s
        self.client_requests[client_ip] = [
            ts for ts in self.client_requests[client_ip] if now - ts < 60
        ]
        
        if len(self.client_requests[client_ip]) >= self.requests_per_minute:
            return Response(
                content='{"error": {"code": "RATE_LIMIT_EXCEEDED", "message": "Too many requests. Please slow down."}}',
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                media_type="application/json"
            )
            
        self.client_requests[client_ip].append(now)
        return await call_next(request)
