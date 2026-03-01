from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.core.config import get_settings
from app.routers import auth_router, tests_router, dashboard_router, scheduler_router, demo_router, webcam_router, dna_router, chat_router
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

settings = get_settings()

logger.info(f"CORS origins: {settings.cors_origins_list}")
logger.info(f"OpenAI key configured: {bool(settings.openai_api_key)}")

app = FastAPI(
    title="CogniTrack API",
    description="Cognitive Load & Energy Manager Backend",
    version="1.0.0",
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
)

# CORS middleware - use settings for allowed origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(tests_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(scheduler_router, prefix="/api")
app.include_router(demo_router, prefix="/api")
app.include_router(webcam_router, prefix="/api")
app.include_router(dna_router, prefix="/api")
app.include_router(chat_router, prefix="/api")


@app.get("/")
def root():
    return {"message": "CogniTrack API", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
