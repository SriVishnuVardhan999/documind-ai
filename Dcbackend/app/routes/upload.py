from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    HTTPException,
    BackgroundTasks
)

from sqlalchemy.orm import Session

import shutil
import os

from app.database import get_db, SessionLocal

from app.models import (
    Document,
    DocumentChunk,
    User
)

from app.auth import get_current_user

from app.services.pdf_extractor import (
    extract_pdf_text
)

from app.services.text_chunker import (
    chunk_text
)

from app.services.embedding_service import (
    create_embeddings,
    GeminiQuotaError
)

from app.services.vector_store import (
    store_chunks
)


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)


# =========================================================
# UPLOAD SETTINGS
# =========================================================

UPLOAD_FOLDER = "app/uploads"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)

# 50 MB maximum PDF size
MAX_FILE_SIZE = 50 * 1024 * 1024


# =========================================================
# BACKGROUND PROCESSING
# =========================================================

def process_document(
    document_id: int,
    file_path: str
):

    db = SessionLocal()

    try:

        print("\n========================================")
        print("BACKGROUND DOCUMENT PROCESSING STARTED")
        print("Document ID:", document_id)
        print("========================================\n")


        # =================================================
        # 1. GET DOCUMENT
        # =================================================

        document = db.query(Document).filter(
            Document.id == document_id
        ).first()

        if not document:

            print(
                "Document not found:",
                document_id
            )

            return


        # =================================================
        # 2. EXTRACT PDF TEXT
        # =================================================

        print(
            "Extracting PDF text..."
        )

        extracted_text = extract_pdf_text(
            file_path
        )

        if not extracted_text:

            print(
                "Could not extract PDF text."
            )

            return


        print(
            f"Extracted characters: "
            f"{len(extracted_text)}"
        )


        # =================================================
        # 3. CREATE CHUNKS
        # =================================================

        chunks = chunk_text(

            extracted_text,

            chunk_size=600,

            overlap=100

        )


        if not chunks:

            print(
                "Could not create chunks."
            )

            return


        print(
            f"Created {len(chunks)} chunks."
        )


        # =================================================
        # 4. CREATE GEMINI EMBEDDINGS
        # =================================================

        print(
            "Creating Gemini embeddings..."
        )

        embeddings = create_embeddings(
            chunks
        )


        if not embeddings:

            print(
                "Gemini returned no embeddings."
            )

            return


        if len(embeddings) != len(chunks):

            print(
                "Chunk and embedding count mismatch."
            )

            return


        print(
            f"Created {len(embeddings)} embeddings."
        )


        # =================================================
        # 5. SAVE CHUNKS TO MYSQL
        # =================================================

        print(
            "Saving chunks to MySQL..."
        )

        for index, chunk in enumerate(chunks):

            chunk_record = DocumentChunk(

                document_id=document.id,

                chunk_index=index,

                text=chunk

            )

            db.add(
                chunk_record
            )


        db.commit()


        print(
            "Chunks saved successfully."
        )


        # =================================================
        # 6. STORE VECTORS IN CHROMADB
        # =================================================

        print(
            "Storing vectors in ChromaDB..."
        )

        store_chunks(

            document_id=document.id,

            chunks=chunks,

            embeddings=embeddings

        )


        print(
            "Vectors stored successfully."
        )


        # =================================================
        # 7. PROCESSING COMPLETE
        # =================================================

        print("\n========================================")
        print("DOCUMENT PROCESSING COMPLETED")
        print("Document ID:", document_id)
        print("========================================\n")


    except GeminiQuotaError:

        db.rollback()

        print(
            "\nGemini quota exceeded."
        )

        print(
            "Document was uploaded, "
            "but AI processing could not complete."
        )


    except Exception as e:

        db.rollback()

        print(
            "\n========================================"
        )

        print(
            "BACKGROUND PROCESSING FAILED"
        )

        print(
            str(e)
        )

        print(
            "========================================\n"
        )


    finally:

        db.close()


# =========================================================
# UPLOAD PDF
# =========================================================

@router.post("/")
async def upload_file(

    background_tasks: BackgroundTasks,

    file: UploadFile = File(...),

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    # =====================================================
    # 1. VALIDATE FILE NAME
    # =====================================================

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No file selected."
        )


    # =====================================================
    # 2. VALIDATE FILE TYPE
    # =====================================================

    if not file.filename.lower().endswith(".pdf"):

        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported."
        )


    # =====================================================
    # 3. CREATE FILE PATH
    # =====================================================

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )


    # =====================================================
    # 4. SAVE FILE
    # =====================================================

    try:

        with open(
            file_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                f"File saving failed: {str(e)}"
            )
        )


    # =====================================================
    # 5. CHECK FILE SIZE
    # =====================================================

    file_size = os.path.getsize(
        file_path
    )


    if file_size > MAX_FILE_SIZE:

        try:

            os.remove(
                file_path
            )

        except Exception:
            pass

        raise HTTPException(
            status_code=413,
            detail=(
                "PDF is too large. "
                "Maximum allowed file size is 50 MB."
            )
        )


    # =====================================================
    # 6. SAVE DOCUMENT TO MYSQL
    # =====================================================

    try:

        document = Document(

            user_id=current_user.id,

            file_name=file.filename,

            file_path=file_path,

            file_type=file.content_type

        )

        db.add(
            document
        )

        db.commit()

        db.refresh(
            document
        )


    except Exception as e:

        db.rollback()

        try:

            os.remove(
                file_path
            )

        except Exception:
            pass

        raise HTTPException(
            status_code=500,
            detail=(
                f"Database save failed: {str(e)}"
            )
        )


    # =====================================================
    # 7. START BACKGROUND PROCESSING
    # =====================================================

    background_tasks.add_task(

        process_document,

        document.id,

        file_path

    )


    # =====================================================
    # 8. RETURN IMMEDIATELY
    # =====================================================

    return {

        "message": (
            "File uploaded successfully."
        ),

        "document": {

            "id": document.id,

            "user_id": document.user_id,

            "file_name": document.file_name,

            "file_path": document.file_path,

            "file_type": document.file_type,

            "uploaded_at": document.uploaded_at,

            "file_size": file_size,

            "status": "processing"

        }

    }