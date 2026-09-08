from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    User,
    Document,
    ChatHistory
)
from app.auth import get_current_user


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


# =========================================================
# DASHBOARD
# =========================================================

@router.get("/")
def get_dashboard(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    # =====================================================
    # TOTAL DOCUMENTS
    # =====================================================

    total_documents = (
        db.query(Document)
        .filter(
            Document.user_id ==
            current_user.id
        )
        .count()
    )


    # =====================================================
    # TOTAL QUESTIONS
    # =====================================================

    total_questions = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.user_id ==
            current_user.id
        )
        .count()
    )


    # =====================================================
    # RECENT DOCUMENTS
    # =====================================================

    recent_documents = (
        db.query(Document)
        .filter(
            Document.user_id ==
            current_user.id
        )
        .order_by(
            Document.uploaded_at.desc()
        )
        .limit(5)
        .all()
    )


    documents = []


    for document in recent_documents:

        documents.append({

            "id":
                document.id,

            "file_name":
                document.file_name,

            "file_type":
                document.file_type,

            "file_path":
                document.file_path,

            "uploaded_at":
                document.uploaded_at

        })


    # =====================================================
    # RECENT CHAT HISTORY
    # =====================================================

    recent_chats = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.user_id ==
            current_user.id
        )
        .order_by(
            ChatHistory.created_at.desc()
        )
        .limit(5)
        .all()
    )


    chats = []


    for chat in recent_chats:

        document_name = ""


        if chat.document:

            document_name = (
                chat.document.file_name
            )


        chats.append({

            "id":
                chat.id,

            "document_id":
                chat.document_id,

            "document":
                document_name,

            "question":
                chat.question,

            "answer":
                chat.answer,

            "created_at":
                chat.created_at

        })


    # =====================================================
    # RETURN DASHBOARD DATA
    # =====================================================

    return {

        "user": {

            "id":
                current_user.id,

            "name":
                current_user.name,

            "email":
                current_user.email

        },

        "statistics": {

            "total_documents":
                total_documents,

            "total_questions":
                total_questions

        },

        "recent_documents":
            documents,

        "recent_chats":
            chats

    }