import sys
import os
import logging
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

# Add local directories to sys.path
calculation_src_path = os.path.join(os.path.dirname(__file__), "calculation", "calculation-main", "src")
if calculation_src_path not in sys.path:
    sys.path.insert(0, calculation_src_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        logging.info("Connecting to MongoDB...")
        from mongo import connect_to_mongo, close_mongo_connection
        await connect_to_mongo()
        
        logging.info("Preloading world city index...")
        from api import service as calc_service
        await calc_service.preload_world_city_index()
        logging.info("World city index loaded successfully.")
        
    except Exception as e:
        logging.error(f"Startup failed: {e}", exc_info=True)
    
    yield
    
    # Shutdown
    try:
        from mongo import close_mongo_connection
        await close_mongo_connection()
        logging.info("Database connection closed.")
    except Exception as e:
        logging.error(f"Shutdown error: {e}")

app = FastAPI(
    title="Astrology Backend API",
    version="1.0.0",
    description="Complete backend: Calculation Engine + Compression + Storage + Authentication",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers
from user_routes import router as auth_router
from calculation_routes import router as calculation_router
from ai_routes import router as ai_router
from deva_routes import router as deva_router
from referral_routes import router as referral_router
from feedback_routes import router as feedback_router

# Register routers
app.include_router(auth_router)
app.include_router(calculation_router, prefix="/calc", tags=["Calculation"])
app.include_router(ai_router, prefix="/api/v1/ai", tags=["AI Orchestrator"])
app.include_router(deva_router, prefix="/api/v1/deva", tags=["Deva Agent"])
app.include_router(referral_router)
app.include_router(feedback_router, tags=["Feedback"])

@app.get("/")
def home():
    return {
        "message": "Astrology Backend API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "auth": "/api/v1/auth",
            "calculation": "/calc/api",
            "ai": "/api/v1/ai",
            "deva": "/api/v1/deva"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "astrology-backend"}

# horoscope_frontend_dist = os.path.join(os.path.dirname(__file__), "calculation", "calculation-main", "frontend", "dist")
# if os.path.exists(horoscope_frontend_dist):
#     app.mount("/horoscope", StaticFiles(directory=horoscope_frontend_dist, html=True), name="horoscope-frontend")
#     logger.info(f"Serving horoscope frontend from {horoscope_frontend_dist}")
# else:
#     # In production (Render/Vercel split), we don't serve frontend from here.
#     pass # logger.warning(f"Horoscope frontend dist not found at {horoscope_frontend_dist}. Build it first with: cd backend/calculation/calculation-main/frontend && npm run build")
