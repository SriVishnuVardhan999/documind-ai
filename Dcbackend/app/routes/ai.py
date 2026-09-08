from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import os
import re

from google import genai

from app.database import get_db
from app.models import Document, ChatHistory, User
from app.auth import get_current_user
from app.config import GEMINI_API_KEY

from app.services.embedding_service import create_embedding
from app.services.vector_store import search_chunks


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/ask-ai",
    tags=["AI"]
)


# =========================================================
# GEMINI CONFIGURATION
# =========================================================

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is not configured in .env"
    )


client = genai.Client(
    api_key=GEMINI_API_KEY
)


# Use the same model shown in your current code
GEMINI_MODEL = "gemini-3.6-flash"


# =========================================================
# RAG SETTINGS
# =========================================================

TOP_K_CHUNKS = 5

MAX_CONTEXT_CHARS = 10000


# =========================================================
# CLEAN TEXT
# =========================================================

def clean_text(text: str) -> str:

    if not text:
        return ""

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.strip()


# =========================================================
# BUILD GEMINI CONTEXT
# =========================================================

def build_context(chunks: list):

    context_parts = []

    total_chars = 0

    for index, chunk in enumerate(chunks):

        remaining = (
            MAX_CONTEXT_CHARS
            - total_chars
        )

        if remaining <= 0:
            break

        chunk_to_add = chunk[:remaining]

        context_parts.append(
            f"--- Relevant Section {index + 1} ---\n"
            f"{chunk_to_add}"
        )

        total_chars += len(
            chunk_to_add
        )

    return "\n\n".join(
        context_parts
    )


# =========================================================
# CHECK GEMINI 429 ERROR
# =========================================================

def is_rate_limit_error(error):

    error_text = str(error).lower()

    return (
        "429" in error_text
        or "resource_exhausted" in error_text
        or "quota" in error_text
        or "rate limit" in error_text
    )


# =========================================================
# ASK AI
# =========================================================

@router.post("/")
def ask_ai(

    data: dict,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    # =====================================================
    # GET INPUT
    # =====================================================

    document_id = data.get(
        "document_id"
    )

    question = data.get(
        "question"
    )


    # =====================================================
    # VALIDATE DOCUMENT ID
    # =====================================================

    if not document_id:

        raise HTTPException(
            status_code=400,
            detail="Document ID is required"
        )


    # =====================================================
    # VALIDATE QUESTION
    # =====================================================

    if not question:

        raise HTTPException(
            status_code=400,
            detail="Question is required"
        )

    question = question.strip()


    if not question:

        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty"
        )


    # Prevent very large questions
    if len(question) > 2000:

        raise HTTPException(
            status_code=400,
            detail=(
                "Question is too long. "
                "Please keep it under 2000 characters."
            )
        )


    # =====================================================
    # FIND USER DOCUMENT
    # =====================================================

    document = (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.user_id == current_user.id
        )
        .first()
    )


    if not document:

        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )


    # =====================================================
    # CREATE QUESTION EMBEDDING
    # =====================================================

    try:

        print(
            "\n================================"
        )

        print(
            "CREATING QUESTION EMBEDDING"
        )

        print(
            "================================"
        )

        question_embedding = create_embedding(
            question
        )

    except Exception as error:

        print(
            "Embedding error:",
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to create question embedding"
        )


    if not question_embedding:

        raise HTTPException(
            status_code=500,
            detail="Question embedding is empty"
        )


    # =====================================================
    # SEARCH CHROMADB
    # =====================================================

    try:

        print(
            "\n================================"
        )

        print(
            "SEARCHING CHROMADB"
        )

        print(
            "================================"
        )

        results = search_chunks(

            query_embedding=question_embedding,

            document_id=document_id,

            top_k=TOP_K_CHUNKS

        )

    except Exception as error:

        print(
            "ChromaDB search error:",
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail="Vector database search failed"
        )


    # =====================================================
    # GET RELEVANT DOCUMENT CHUNKS
    # =====================================================

    documents = (
        results.get(
            "documents",
            [[]]
        )[0]
    )


    if not documents:

        answer = (
            "I could not find the answer "
            "in the document."
        )

        # Save history even when no answer
        history = None

        try:

            history = ChatHistory(

                user_id=current_user.id,

                document_id=document.id,

                question=question,

                answer=answer

            )

            db.add(history)

            db.commit()

            db.refresh(history)

        except Exception as error:

            db.rollback()

            print(
                "History save error:",
                str(error)
            )


        return {

            "document":
                document.file_name,

            "document_id":
                document.id,

            "question":
                question,

            "answer":
                answer,

            "history_id": (
                history.id
                if history
                else None
            ),

            "vector_database":
                "ChromaDB",

            "retrieved_chunks":
                0

        }


    print(
        f"Retrieved {len(documents)} "
        "chunks from ChromaDB"
    )


    # =====================================================
    # BUILD SMALL CONTEXT
    # =====================================================

    context = build_context(
        documents
    )


    # =====================================================
    # GEMINI PROMPT
    # =====================================================

    prompt = f"""
You are DocuMind AI, an intelligent document assistant.

Your job is to answer the user's question using
ONLY the information provided in the document sections.

Rules:

1. Do not invent information.
2. Do not use outside knowledge.
3. If the answer is not present in the provided
   document sections, say:

"I could not find the answer in the document."

4. Give a clear and concise answer.
5. Use simple language.
6. If the document contains a list or steps,
   preserve the important structure.

DOCUMENT NAME:

{document.file_name}

RELEVANT DOCUMENT SECTIONS:

{context}

USER QUESTION:

{question}

ANSWER:
"""


    # =====================================================
    # CALL GEMINI
    # =====================================================

    try:

        response = client.models.generate_content(

            model=GEMINI_MODEL,

            contents=prompt

        )


        answer = response.text


        if not answer:

            raise HTTPException(

                status_code=500,

                detail=(
                    "Gemini returned "
                    "an empty response."
                )

            )


        answer = answer.strip()


    except HTTPException:

        raise


    except Exception as error:

        print(
            "Gemini error:",
            str(error)
        )


        # =================================================
        # GEMINI QUOTA / RATE LIMIT
        # =================================================

        if is_rate_limit_error(error):

            raise HTTPException(

                status_code=429,

                detail=(
                    "Gemini API quota has been exceeded. "
                    "Please wait about one minute and "
                    "try again."
                )

            )


        # =================================================
        # OTHER GEMINI ERROR
        # =================================================

        raise HTTPException(

            status_code=500,

            detail=f"Gemini error: {str(error)}"

        )


    # =====================================================
    # SAVE CHAT HISTORY
    # =====================================================

    history = None

    try:

        history = ChatHistory(

            user_id=current_user.id,

            document_id=document.id,

            question=question,

            answer=answer

        )

        db.add(history)

        db.commit()

        db.refresh(history)

        print(
            "Chat history saved successfully"
        )

    except Exception as error:

        db.rollback()

        print(
            "History save error:",
            str(error)
        )


    # =====================================================
    # RETURN RESPONSE
    # =====================================================

    return {

        "document":
            document.file_name,

        "document_id":
            document.id,

        "question":
            question,

        "answer":
            answer,

        "history_id": (
            history.id
            if history
            else None
        ),

        "vector_database":
            "ChromaDB",

        "retrieved_chunks":
            len(documents)

    }