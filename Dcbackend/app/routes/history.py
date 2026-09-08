from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ChatHistory, Document, User
from app.auth import get_current_user


router = APIRouter(
    prefix="/history",
    tags=["History"]
)


# =========================================================
# GET ALL HISTORY
# =========================================================

@router.get("/")
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    history = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.user_id == current_user.id
        )
        .order_by(
            ChatHistory.created_at.desc()
        )
        .all()
    )


    result = []


    for item in history:

        result.append({

            "id":
                item.id,

            "document_id":
                item.document_id,

            "document_name":
                item.document.file_name
                if item.document
                else "Unknown Document",

            "question":
                item.question,

            "answer":
                item.answer,

            "created_at":
                item.created_at

        })


    return result


# =========================================================
# GET HISTORY FOR ONE DOCUMENT
# =========================================================

@router.get(
    "/document/{document_id}"
)
def get_document_history(

    document_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    # Check document belongs to user
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


    history = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.document_id == document_id,
            ChatHistory.user_id == current_user.id
        )
        .order_by(
            ChatHistory.created_at.asc()
        )
        .all()
    )


    result = []


    for item in history:

        result.append({

            "id":
                item.id,

            "document_id":
                item.document_id,

            "document_name":
                document.file_name,

            "question":
                item.question,

            "answer":
                item.answer,

            "created_at":
                item.created_at

        })


    return result


# =========================================================
# DELETE ONE HISTORY ITEM
# =========================================================

@router.delete(
    "/{history_id}"
)
def delete_history(

    history_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    history = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.id == history_id,
            ChatHistory.user_id == current_user.id
        )
        .first()
    )


    if not history:

        raise HTTPException(
            status_code=404,
            detail="History item not found"
        )


    db.delete(history)

    db.commit()


    return {

        "message":
            "History deleted successfully",

        "id":
            history_id

    }


# =========================================================
# DELETE ALL HISTORY
# =========================================================

@router.delete("/")
def delete_all_history(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    deleted_count = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.user_id == current_user.id
        )
        .delete(
            synchronize_session=False
        )
    )


    db.commit()


    return {

        "message":
            "All history deleted successfully",

        "deleted_count":
            deleted_count

    }