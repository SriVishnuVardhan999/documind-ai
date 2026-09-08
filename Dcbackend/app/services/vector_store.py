import chromadb


client = chromadb.PersistentClient(
    path="./chroma_db"
)


collection = client.get_or_create_collection(
    name="documind_documents"
)


def store_chunks(
    document_id,
    chunks,
    embeddings
):

    ids = []

    documents = []

    metadatas = []

    vectors = []


    for index, chunk in enumerate(chunks):

        chunk_id = (
            f"{document_id}_{index}"
        )

        ids.append(chunk_id)

        documents.append(chunk)

        metadatas.append({
            "document_id":
                str(document_id),

            "chunk_index":
                index
        })

        vectors.append(
            embeddings[index]
        )


    collection.upsert(

        ids=ids,

        documents=documents,

        metadatas=metadatas,

        embeddings=vectors

    )


def search_chunks(
    query_embedding,
    document_id,
    top_k=5
):

    results = collection.query(

        query_embeddings=[
            query_embedding
        ],

        n_results=top_k,

        where={
            "document_id":
                str(document_id)
        }

    )

    return results