from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import os

from app.database import Base, engine

from app.routes.auth import router as auth_router
from app.routes.upload import router as upload_router
from app.routes.documents import router as documents_router
from app.routes.ai import router as ai_router
from app.routes.history import router as history_router
from app.routes.dashboard import router as dashboard_router


# =========================================================
# CREATE DATABASE TABLES
# =========================================================

Base.metadata.create_all(
    bind=engine
)


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="DocuMind AI Backend"
)


# =========================================================
# CORS CONFIGURATION
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173"
    ],

    allow_credentials=True,

    allow_methods=[
        "*"
    ],

    allow_headers=[
        "*"
    ]
)


# =========================================================
# INCLUDE API ROUTES
# =========================================================

# Authentication
app.include_router(
    auth_router
)


# Upload
app.include_router(
    upload_router
)


# Documents
app.include_router(
    documents_router
)


# AI
app.include_router(
    ai_router
)


# History
app.include_router(
    history_router
)


# Dashboard
app.include_router(
    dashboard_router
)


# =========================================================
# UPLOAD FOLDER
# =========================================================

UPLOAD_FOLDER = "app/uploads"


os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# =========================================================
# SERVE UPLOADED DOCUMENTS
# =========================================================

app.mount(
    "/uploads",
    StaticFiles(
        directory=UPLOAD_FOLDER
    ),
    name="uploads"
)


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {

        "message":
            "Backend Running Successfully"

    }