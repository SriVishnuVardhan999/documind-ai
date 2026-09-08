from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from sqlalchemy.orm import Session

import os
import urllib.parse

from app.database import get_db

from app.models import (
    Document,
    DocumentChunk,
    ChatHistory,
    User
)

from app.auth import get_current_user

from app.services.pdf_extractor import extract_pdf_text


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


# =========================================================
# GET ALL DOCUMENTS
# =========================================================

@router.get("/")
def get_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    documents = (
        db.query(Document)
        .filter(
            Document.user_id == current_user.id
        )
        .order_by(
            Document.uploaded_at.desc()
        )
        .all()
    )

    result = []

    for document in documents:

        file_size = 0

        if os.path.exists(document.file_path):
            file_size = os.path.getsize(
                document.file_path
            )

        result.append({
            "id": document.id,
            "user_id": document.user_id,
            "file_name": document.file_name,
            "file_path": document.file_path,
            "file_type": document.file_type,
            "uploaded_at": document.uploaded_at,
            "file_size": file_size
        })

    return result


# =========================================================
# VIEW PDF
# =========================================================

@router.get("/{document_id}/view")
def view_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    print("\n========================================")
    print("VIEW DOCUMENT")
    print("========================================")

    print("Document ID:", document_id)

    # -----------------------------------------------------
    # FIND DOCUMENT
    # -----------------------------------------------------

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

    print(
        "Document:",
        document.file_name
    )

    print(
        "Path:",
        document.file_path
    )

    # -----------------------------------------------------
    # CHECK FILE
    # -----------------------------------------------------

    if not os.path.isfile(document.file_path):

        print(
            "PDF file does not exist"
        )

        raise HTTPException(
            status_code=404,
            detail="PDF file not found"
        )

    # -----------------------------------------------------
    # RETURN PDF
    # -----------------------------------------------------

    encoded_name = urllib.parse.quote(
        document.file_name
    )

    return FileResponse(
        path=document.file_path,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                f'inline; filename="{encoded_name}"'
        }
    )


# =========================================================
# EXTRACT PDF TEXT
# =========================================================

@router.post("/extract-text/{document_id}")
def extract_document_text(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    print("\n========================================")
    print("TEXT EXTRACTION")
    print("========================================")

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

    if not os.path.isfile(
        document.file_path
    ):

        raise HTTPException(
            status_code=404,
            detail="PDF file not found"
        )

    try:

        extracted_text = extract_pdf_text(
            document.file_path
        )

    except Exception as e:

        print(
            "Extraction error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "PDF extraction failed: "
                + str(e)
            )
        )

    if not extracted_text:

        raise HTTPException(
            status_code=400,
            detail=(
                "Could not extract text "
                "from this PDF. The PDF "
                "may be scanned or "
                "image-based."
            )
        )

    return {
        "document_id": document.id,
        "document": document.file_name,
        "text": extracted_text,
        "character_count": len(extracted_text)
    }


# =========================================================
# RENAME DOCUMENT
# =========================================================

@router.put("/{document_id}")
def rename_document(
    document_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    new_name = data.get("file_name")

    if not new_name:

        raise HTTPException(
            status_code=400,
            detail="File name is required"
        )

    new_name = new_name.strip()

    if not new_name:

        raise HTTPException(
            status_code=400,
            detail="File name cannot be empty"
        )

    if not new_name.lower().endswith(".pdf"):

        new_name += ".pdf"

    # -----------------------------------------------------
    # FIND DOCUMENT
    # -----------------------------------------------------

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

    old_path = document.file_path

    directory = os.path.dirname(
        old_path
    )

    new_path = os.path.join(
        directory,
        new_name
    )

    # -----------------------------------------------------
    # CHECK DUPLICATE
    # -----------------------------------------------------

    if (
        new_path != old_path
        and os.path.exists(new_path)
    ):

        raise HTTPException(
            status_code=409,
            detail="A file with this name already exists"
        )

    try:

        # Rename actual file
        if os.path.isfile(old_path):

            os.rename(
                old_path,
                new_path
            )

        # Update database
        document.file_name = new_name
        document.file_path = new_path

        db.commit()

        db.refresh(document)

    except Exception as e:

        db.rollback()

        print(
            "Rename error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Could not rename document: "
                + str(e)
            )
        )

    return {
        "message":
            "Document renamed successfully",

        "id":
            document.id,

        "file_name":
            document.file_name,

        "file_path":
            document.file_path
    }


# =========================================================
# DELETE DOCUMENT
# =========================================================

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    print("\n========================================")
    print("DELETE DOCUMENT")
    print("========================================")

    print(
        "Document ID:",
        document_id
    )

    # -----------------------------------------------------
    # FIND DOCUMENT
    # -----------------------------------------------------

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

    file_path = document.file_path

    print(
        "Deleting:",
        document.file_name
    )

    # -----------------------------------------------------
    # DELETE DATABASE RECORDS
    # -----------------------------------------------------

    try:

        # Delete chat history
        history_deleted = (
            db.query(ChatHistory)
            .filter(
                ChatHistory.document_id == document_id
            )
            .delete(
                synchronize_session=False
            )
        )

        print(
            "Chat history deleted:",
            history_deleted
        )

        # Delete chunks
        chunks_deleted = (
            db.query(DocumentChunk)
            .filter(
                DocumentChunk.document_id == document_id
            )
            .delete(
                synchronize_session=False
            )
        )

        print(
            "Document chunks deleted:",
            chunks_deleted
        )

        # IMPORTANT:
        # Direct SQLAlchemy bulk delete.
        # Do NOT use db.delete(document).
        document_deleted = (
            db.query(Document)
            .filter(
                Document.id == document_id,
                Document.user_id == current_user.id
            )
            .delete(
                synchronize_session=False
            )
        )

        print(
            "Document database rows deleted:",
            document_deleted
        )

        db.commit()

        print(
            "Database deletion successful"
        )

    except Exception as e:

        db.rollback()

        print("\n========================================")
        print("DELETE DATABASE ERROR")
        print("========================================")

        print(
            type(e).__name__
        )

        print(
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Could not delete document: "
                + str(e)
            )
        )

    # -----------------------------------------------------
    # DELETE PHYSICAL PDF
    # -----------------------------------------------------

    file_deleted = False

    if os.path.isfile(file_path):

        try:

            os.remove(file_path)

            file_deleted = True

            print(
                "Physical PDF deleted successfully"
            )

        except Exception as e:

            print(
                "Physical PDF deletion error:",
                str(e)
            )

    else:

        print(
            "Physical PDF already missing"
        )

        # Database is still deleted,
        # so this is not a database error.

    # -----------------------------------------------------
    # SUCCESS
    # -----------------------------------------------------

    print(
        "Document completely deleted"
    )

    return {
        "message":
            "Document deleted successfully",

        "id":
            document_id,

        "deleted":
            True,

        "file_deleted":
            file_deleted
    }