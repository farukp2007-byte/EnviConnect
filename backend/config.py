import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
SEED_ASSETS_DIR = os.path.join(BASE_DIR, "seed_assets")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(SEED_ASSETS_DIR, exist_ok=True)

SECRET_KEY = os.getenv("SECRET_KEY", "envi-connect-super-secret-jwt-key-2026-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days for demo ease

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'envi_connect.db')}")
