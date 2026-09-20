from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine, run_migrations
from app.db import models

from app.core.config import settings
from app.routers import auth
from app.routers import users
from app.routers import diagnostic
from app.routers import learning
from app.routers import sessions


# Create database tables
Base.metadata.create_all(bind=engine)
# Add new nullable columns to existing tables (idempotent)
run_migrations()


app = FastAPI(
    title="ADAPT API",
    description="Adaptive AI Learning Engine",
    version="1.0.0"
)

# CORS with specific origins to support credentials and security
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(diagnostic.router)
app.include_router(learning.router)
app.include_router(sessions.router)


@app.get("/")
def root():
    return {
        "message": "ADAPT API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }