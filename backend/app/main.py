from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.database import AsyncSessionLocal


app = FastAPI(
    title="YatraSaathi API",
    description="AI-powered accessible travel companion",
    version="0.1.0",
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


@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "ok",
        "service": "yatrasaathi-api",
        "version": "0.1.0",
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