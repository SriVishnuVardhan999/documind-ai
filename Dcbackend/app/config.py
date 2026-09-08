import os
from dotenv import load_dotenv


load_dotenv()


# -------------------------
# Database Configuration
# -------------------------

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")


# -------------------------
# JWT Configuration
# -------------------------

SECRET_KEY = os.getenv("SECRET_KEY")

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60


# -------------------------
# Gemini AI Configuration
# -------------------------

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")