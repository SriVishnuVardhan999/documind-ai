import time

from google import genai
from google.genai import types

from app.config import GEMINI_API_KEY


# =========================================================
# GEMINI CLIENT
# =========================================================

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is not configured"
    )

client = genai.Client(
    api_key=GEMINI_API_KEY
)


# =========================================================
# EMBEDDING MODEL
# =========================================================

EMBEDDING_MODEL = "gemini-embedding-001"


# =========================================================
# BATCH SETTINGS
# =========================================================

# One chunk per request reduces token spikes.
BATCH_SIZE = 1

# Delay between requests to reduce TPM pressure.
EMBEDDING_DELAY = 5


# =========================================================
# QUOTA ERROR
# =========================================================

class GeminiQuotaError(Exception):
    """Raised when Gemini embedding quota is exceeded."""
    pass


# =========================================================
# CHECK GEMINI QUOTA ERROR
# =========================================================

def is_quota_error(error: Exception) -> bool:

    error_message = str(error).upper()

    return (
        "429" in error_message
        or "RESOURCE_EXHAUSTED" in error_message
        or "QUOTA" in error_message
        or "RATE LIMIT" in error_message
    )


# =========================================================
# CREATE SINGLE EMBEDDING
# =========================================================

def create_embedding(text: str) -> list[float]:

    if not text or not text.strip():
        return []

    text = text.strip()

    try:

        response = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=text,
            config=types.EmbedContentConfig(
                task_type="RETRIEVAL_DOCUMENT"
            )
        )

        if not response.embeddings:
            raise RuntimeError(
                "Gemini returned no embedding."
            )

        embedding = response.embeddings[0]

        if not embedding.values:
            raise RuntimeError(
                "Gemini returned empty embedding values."
            )

        return list(embedding.values)

    except Exception as e:

        if is_quota_error(e):

            print(
                "\n========================================"
            )
            print(
                "GEMINI EMBEDDING QUOTA EXCEEDED"
            )
            print(
                "========================================"
            )
            print(
                "Gemini rate limit/quota was exceeded."
            )
            print(
                "Wait and try again, or increase the "
                "Gemini project quota."
            )
            print(
                "========================================\n"
            )

            raise GeminiQuotaError(
                "Gemini embedding quota exceeded. "
                "Please wait and try again."
            ) from e

        print(
            "Gemini embedding error:",
            str(e)
        )

        raise


# =========================================================
# CREATE MULTIPLE EMBEDDINGS
# =========================================================

def create_embeddings(
    texts: list[str]
) -> list[list[float]]:

    # -----------------------------------------------------
    # Validate input
    # -----------------------------------------------------

    if not texts:
        return []

    valid_texts = [
        text.strip()
        for text in texts
        if text and text.strip()
    ]

    if not valid_texts:
        return []

    total_chunks = len(valid_texts)

    print(
        f"Creating embeddings for "
        f"{total_chunks} chunks..."
    )

    # -----------------------------------------------------
    # Store embeddings
    # -----------------------------------------------------

    all_embeddings: list[list[float]] = []

    total_batches = (
        (total_chunks + BATCH_SIZE - 1)
        // BATCH_SIZE
    )

    # -----------------------------------------------------
    # Process batches
    # -----------------------------------------------------

    for start in range(
        0,
        total_chunks,
        BATCH_SIZE
    ):

        end = min(
            start + BATCH_SIZE,
            total_chunks
        )

        batch = valid_texts[start:end]

        batch_number = (
            start // BATCH_SIZE
        ) + 1

        print(
            f"Processing embedding batch "
            f"{batch_number}/{total_batches} "
            f"({len(batch)} chunk)..."
        )

        try:

            response = client.models.embed_content(

                model=EMBEDDING_MODEL,

                contents=batch,

                config=types.EmbedContentConfig(
                    task_type="RETRIEVAL_DOCUMENT"
                )
            )

        except Exception as e:

            if is_quota_error(e):

                print(
                    "\n========================================"
                )
                print(
                    "GEMINI EMBEDDING QUOTA EXCEEDED"
                )
                print(
                    "========================================"
                )
                print(
                    f"Failed at batch "
                    f"{batch_number}/{total_batches}"
                )
                print(
                    "Gemini TPM/rate limit was exceeded."
                )
                print(
                    "========================================\n"
                )

                raise GeminiQuotaError(
                    "Gemini embedding quota exceeded "
                    f"while processing batch "
                    f"{batch_number}/{total_batches}."
                ) from e

            print(
                "Embedding request failed:",
                str(e)
            )

            raise

        # -------------------------------------------------
        # Validate response
        # -------------------------------------------------

        if not response.embeddings:

            raise RuntimeError(
                f"Gemini returned no embeddings "
                f"for batch {batch_number}."
            )

        # -------------------------------------------------
        # Extract embeddings
        # -------------------------------------------------

        batch_embeddings = []

        for embedding in response.embeddings:

            if not embedding.values:

                raise RuntimeError(
                    f"Empty embedding returned "
                    f"in batch {batch_number}."
                )

            batch_embeddings.append(
                list(embedding.values)
            )

        # -------------------------------------------------
        # Verify embedding count
        # -------------------------------------------------

        if len(batch_embeddings) != len(batch):

            raise RuntimeError(
                f"Embedding count mismatch. "
                f"Expected {len(batch)}, "
                f"received {len(batch_embeddings)}."
            )

        # -------------------------------------------------
        # Store embeddings
        # -------------------------------------------------

        all_embeddings.extend(
            batch_embeddings
        )

        print(
            f"Batch {batch_number}/{total_batches} "
            f"completed successfully."
        )

        # -------------------------------------------------
        # Wait before next request
        # -------------------------------------------------

        if end < total_chunks:

            print(
                f"Waiting {EMBEDDING_DELAY} seconds "
                f"before next Gemini request..."
            )

            time.sleep(
                EMBEDDING_DELAY
            )

    # -----------------------------------------------------
    # Final validation
    # -----------------------------------------------------

    if len(all_embeddings) != total_chunks:

        raise RuntimeError(
            f"Final embedding count mismatch. "
            f"Expected {total_chunks}, "
            f"received {len(all_embeddings)}."
        )

    print(
        f"Successfully created "
        f"{len(all_embeddings)} embeddings."
    )

    return all_embeddings