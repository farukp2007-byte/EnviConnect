import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from config import UPLOAD_DIR, SEED_ASSETS_DIR
from database import engine, Base
from routers.auth_router import router as auth_router
from routers.reports_router import router as reports_router
from routers.zones_router import router as zones_router
from routers.analytics_router import router as analytics_router
from routers.notifications_router import router as notifications_router
from routers.admin_router import router as admin_router
from routers.eco_router import router as eco_router
from seed_data import seed_database

# Initialize FastAPI App
app = FastAPI(
    title="ENVI CONNECT API",
    description="AI-Enabled, GIS-Based Environmental Incident Reporting & Response Platform. Citizen evidence routing, duplicate detection, and authority workflows.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file mounts
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
app.mount("/seed_assets", StaticFiles(directory=SEED_ASSETS_DIR), name="seed_assets")

# Include Routers
app.include_router(auth_router)
app.include_router(reports_router)
app.include_router(zones_router)
app.include_router(analytics_router)
app.include_router(notifications_router)
app.include_router(admin_router)
app.include_router(eco_router)

@app.on_event("startup")
def startup_event():
    print("Initializing database and seeding demo data...")
    Base.metadata.create_all(bind=engine)
    seed_database()
    print("ENVI CONNECT Backend Ready at http://localhost:8000")

@app.get("/")
def root():
    return {
        "platform": "ENVI CONNECT",
        "tagline": "AI-Enabled GIS Environmental Incident Reporting & Response Platform",
        "version": "1.0.0",
        "swagger_docs": "/docs",
        "status": "online"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
