from app.routers.auth import router as auth_router
from app.routers.tests import router as tests_router
from app.routers.dashboard import router as dashboard_router
from app.routers.scheduler import router as scheduler_router
from app.routers.demo import router as demo_router
from app.routers.webcam import router as webcam_router
from app.routers.dna import router as dna_router
from app.routers.chat import router as chat_router

__all__ = [
    "auth_router",
    "tests_router",
    "dashboard_router",
    "scheduler_router",
    "demo_router",
    "webcam_router",
    "dna_router",
    "chat_router",
]
