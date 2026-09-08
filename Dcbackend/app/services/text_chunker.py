def chunk_text(
    text: str,
    chunk_size: int = 1000,
    overlap: int = 200
):

    if not text:
        return []


    words = text.split()

    chunks = []

    start = 0

    while start < len(words):

        end = start + chunk_size

        chunk = " ".join(
            words[start:end]
        )

        if chunk.strip():

            chunks.append(
                chunk.strip()
            )


        start += (
            chunk_size - overlap
        )


    return chunks