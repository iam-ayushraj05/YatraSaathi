from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.core.database import AsyncSessionLocal
from app.services.exceptions import NotFoundException, ValidationError, RoutingException, DatabaseException

# Import routers
from app.api.v1.auth import router as auth_router
from app.api.v1.profiles import router as profiles_router
from app.api.v1.places import router as places_router
from app.api.v1.routes import router as routes_router
from app.api.v1.reports import router as reports_router
from app.api.v1.auditor import router as auditor_router
from app.api.v1.itineraries import router as itineraries_router
from app.api.v1.context import router as context_router
from app.api.v1.barriers import router as barriers_router
from app.api.v1.internal import router as internal_router
from app.api.v1.copilot import router as copilot_router

app = FastAPI(
    title="yatrasaathi API",
    description="AI-powered accessible travel companion",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers for unified error format
@app.exception_handler(NotFoundException)
async def not_found_handler(request: Request, exc: NotFoundException):
    return JSONResponse(
        status_code=404,
        content={
            "error": {
                "code": "RESOURCE_NOT_FOUND",
                "message": str(exc),
                "details": {}
            }
        }
    )

@app.exception_handler(ValidationError)
async def validation_error_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=400,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": str(exc),
                "details": {}
            }
        }
    )

@app.exception_handler(RoutingException)
async def routing_exception_handler(request: Request, exc: RoutingException):
    return JSONResponse(
        status_code=502,
        content={
            "error": {
                "code": "ROUTE_UNAVAILABLE",
                "message": str(exc),
                "details": {}
            }
        }
    )

@app.exception_handler(DatabaseException)
async def database_exception_handler(request: Request, exc: DatabaseException):
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": str(exc),
                "details": {}
            }
        }
    )

@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    message = "Request validation failed."
    if errors:
        loc = " -> ".join(str(x) for x in errors[0].get("loc", []))
        msg = errors[0].get("msg", "")
        message = f"Validation failed at '{loc}': {msg}"
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": message,
                "details": {"errors": errors}
            }
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    code = "HTTP_ERROR"
    if exc.status_code == 404:
        code = "RESOURCE_NOT_FOUND"
    elif exc.status_code == 401:
        code = "UNAUTHORIZED"
    elif exc.status_code == 403:
        code = "FORBIDDEN"
    elif exc.status_code == 400:
        code = "VALIDATION_ERROR"
        
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": code,
                "message": exc.detail,
                "details": {}
            }
        }
    )


# Health check endpoints
@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "ok",
        "service": "yatrasaathi-api",
        "version": "1.0.0",
    }


@app.get("/api/v1/health/database")
async def database_health():
    async with AsyncSessionLocal() as session:
        result = await session.execute(text("SELECT 1"))
        value = result.scalar()

    return {
        "status": "ok",
        "database": "connected",
        "result": value,
    }

# Register routers under prefix /api/v1
api_v1_prefix = "/api/v1"
app.include_router(auth_router, prefix=api_v1_prefix)
app.include_router(profiles_router, prefix=api_v1_prefix)
app.include_router(places_router, prefix=api_v1_prefix)
app.include_router(routes_router, prefix=api_v1_prefix)
app.include_router(reports_router, prefix=api_v1_prefix)
app.include_router(auditor_router, prefix=api_v1_prefix)
app.include_router(itineraries_router, prefix=api_v1_prefix)
app.include_router(context_router, prefix=api_v1_prefix)
app.include_router(barriers_router, prefix=api_v1_prefix)
app.include_router(internal_router, prefix=api_v1_prefix)
app.include_router(copilot_router, prefix=api_v1_prefix)