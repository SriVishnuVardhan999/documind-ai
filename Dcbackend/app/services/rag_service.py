from google import genai

from app.config import GEMINI_API_KEY

from app.services.embedding_service import (
    create_embedding
)

from app.services.vector_store import (
    search_chunks
)


client = genai.Client(
    api_key=GEMINI_API_KEY
)


def answer_question(
    document_id,
    question
):

    # Create question embedding
    question_embedding = (
        create_embedding(question)
    )


    # Search relevant chunks
    results = search_chunks(

        question_embedding,

        document_id,

        top_k=5

    )


    documents = (
        results.get("documents", [[]])[0]
    )


    if not documents:

        return (
            "I could not find relevant "
            "information in this document."
        )


    context = "\n\n".join(
        documents
    )


    prompt = f"""
You are DocuMind AI.

Answer the user's question using
ONLY the document context below.

If the answer cannot be found in
the context, say:

"I could not find the answer in
the document."

DOCUMENT CONTEXT:

{context}


USER QUESTION:

{question}
"""


    response = client.models.generate_content(

        model="gemini-3.6-flash",

        contents=prompt

    )


    return response.text