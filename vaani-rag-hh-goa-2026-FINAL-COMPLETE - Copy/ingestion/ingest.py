import argparse
import os
import pickle
import sys
import uuid

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient, models
from app.config import settings
from chunking import variants

SAMPLE_DATA = [
    {
        "text": "Artificial intelligence (AI) is the intelligence of machines or software, as opposed to the intelligence of living beings, primarily of humans. It is a field of study in computer science that develops and studies intelligent machines.",
        "query": "What is artificial intelligence?",
        "answer": "Artificial intelligence (AI) is machine-displayed intelligence and a field of computer science studying intelligent machines.",
        "language": "en",
    },
    {
        "text": "Machine learning (ML) is an umbrella term for solving problems for which the development of algorithms by human programmers would be cost-prohibitive. Instead, the problems are solved by helping machines discover their own algorithms without explicit programming.",
        "query": "How does machine learning work?",
        "answer": "Machine learning enables machines to learn patterns and solve problems from data without being explicitly programmed.",
        "language": "en",
    },
    {
        "text": "कृत्रिम बुद्धिमत्ता (AI) मानव निर्मित बौद्धिक क्षमता है। यह कंप्यूटर विज्ञान की एक शाखा है जो मशीनों को सोचने, समझने और सीखने की क्षमता प्रदान करती है।",
        "query": "कृत्रिम बुद्धिमत्ता क्या है?",
        "answer": "कृत्रिम बुद्धिमत्ता (AI) कंप्यूटर विज्ञान की एक शाखा है जो मशीनों को मानव जैसी सोचने और सीखने की क्षमता देती है।",
        "language": "hi",
    },
    {
        "text": "मशीन लर्निंग (Machine Learning) हा कृत्रिम बुद्धिमत्तेचा एक उपसंच आहे. यामध्ये अल्गोरिदम डेटा वापरून स्वतः शिकतात आणि अचूक अंदाज बांधतात.",
        "query": "मशीन लर्निंग म्हणजे काय?",
        "answer": "मशीन लर्निंग हा AI चा एक भाग आहे जो डेटा विश्लेषण करून स्वयंचलितपणे शिकतो.",
        "language": "mr",
    },
    {
        "text": "Neural networks are computing systems inspired by the biological neural networks that constitute animal brains. An artificial neural network consists of connected units or nodes called artificial neurons.",
        "query": "How do neural networks learn?",
        "answer": "Neural networks learn by adjusting weights between interconnected nodes using backpropagation and training data.",
        "language": "en",
    },
    {
        "text": "Data science is an interdisciplinary field that uses scientific methods, processes, algorithms, and systems to extract or extrapolate knowledge and insights from noisy, structured, and unstructured data.",
        "query": "What is data science?",
        "answer": "Data science combines statistics, computer science, and domain expertise to extract insights from structured and unstructured data.",
        "language": "en",
    },
    {
        "text": "The Internet is a global system of interconnected computer networks that uses the Internet protocol suite (TCP/IP) to communicate between networks and devices.",
        "query": "How does the internet work?",
        "answer": "The internet connects billions of devices worldwide through the standard TCP/IP communication protocol suite.",
        "language": "en",
    },
]

def pick(row, names):
    for name in names:
        value = row.get(name) if hasattr(row, "get") else None
        if value not in (None, ""):
            if isinstance(value, list):
                return " ".join(map(str, value))
            return str(value)
    return ""

def main():
    parser = argparse.ArgumentParser(description="Ingest multilingual dataset into Qdrant + BM25")
    parser.add_argument("--limit", type=int, default=None, help="Maximum records to index")
    parser.add_argument("--split", default=None, help="Dataset split (e.g. train, test)")
    parser.add_argument("--sample", action="store_true", help="Use built-in multilingual sample dataset for instant setup")
    args = parser.parse_args()

    s = settings()
    limit = args.limit or (len(SAMPLE_DATA) if args.sample else s.dataset_limit)
    split = args.split or s.dataset_split

    rows = []
    if args.sample:
        print(f"[Ingest] Loading {min(limit, len(SAMPLE_DATA))} built-in multilingual sample passages...")
        rows = SAMPLE_DATA[:limit]
    else:
        try:
            from datasets import load_dataset
            print(f"[Ingest] Streaming dataset '{s.dataset_name}' (split: {split}, limit: {limit})...")
            load_args = {"path": s.dataset_name, "split": split, "streaming": True}
            if s.dataset_config:
                load_args["name"] = s.dataset_config
            dataset = load_dataset(**load_args)
            for i, row in enumerate(dataset):
                rows.append(row)
                if i + 1 >= limit:
                    break
        except Exception as e:
            print(f"[Ingest] Warning: Could not stream from HuggingFace ({e}). Falling back to sample dataset.")
            rows = SAMPLE_DATA[:limit]

    if not rows:
        raise RuntimeError("No records found to ingest.")

    print(f"[Ingest] Initializing embedding model: {s.embedding_model}")
    encoder = SentenceTransformer(s.embedding_model)

    chunks = []
    for row in rows:
        text = pick(row, ["passage", "text", "document", "context", "content"])
        if not text:
            continue
        meta = {
            "query": pick(row, ["query", "question"]),
            "answer": pick(row, ["answer", "answers"]),
            "language": pick(row, ["language", "lang", "language_code"]),
            "source": s.dataset_name if not args.sample else "vaani-sample",
        }
        chunks.extend(variants(text, meta, encoder))

    if not chunks:
        raise RuntimeError("No chunks were generated from the dataset.")

    print(f"[Ingest] Computing embeddings for {len(chunks)} multi-strategy chunks...")
    vectors = encoder.encode([c.text for c in chunks], normalize_embeddings=True, batch_size=64, show_progress_bar=True)

    # Ingest into Qdrant if available
    qdrant_ok = False
    try:
        client = QdrantClient(url=s.qdrant_url, timeout=5.0)
        try:
            client.delete_collection(s.qdrant_collection)
        except Exception:
            pass
        client.create_collection(
            collection_name=s.qdrant_collection,
            vectors_config={"dense": models.VectorParams(size=int(vectors.shape[1]), distance=models.Distance.COSINE)},
        )
        batch = []
        for i, (chunk, vector) in enumerate(zip(chunks, vectors)):
            pid = str(uuid.uuid5(uuid.NAMESPACE_URL, f"{i}:{chunk.strategy}:{chunk.metadata.get('chunk_id')}"))
            payload = {"text": chunk.text, "strategy": chunk.strategy, **chunk.metadata}
            batch.append(models.PointStruct(id=pid, vector={"dense": vector.tolist()}, payload=payload))
            if len(batch) >= 256:
                client.upsert(collection_name=s.qdrant_collection, points=batch)
                batch = []
        if batch:
            client.upsert(collection_name=s.qdrant_collection, points=batch)
        qdrant_ok = True
        print(f"[Ingest] Successfully indexed {len(chunks)} vectors in Qdrant collection '{s.qdrant_collection}'.")
    except Exception as e:
        print(f"[Ingest] Qdrant connection skipped or failed ({e}). (Ensure Qdrant is running with docker compose up -d qdrant).")

    # Always generate and save BM25 index and standalone vector cache
    docs = []
    for i, chunk in enumerate(chunks):
        pid = str(uuid.uuid5(uuid.NAMESPACE_URL, f"{i}:{chunk.strategy}:{chunk.metadata.get('chunk_id')}"))
        docs.append({
            "id": pid,
            "text": chunk.text,
            "strategy": chunk.strategy,
            "language": chunk.metadata.get("language"),
            "source": s.dataset_name if not args.sample else "vaani-sample",
        })

    s.bm25_path.parent.mkdir(parents=True, exist_ok=True)
    with s.bm25_path.open("wb") as f:
        pickle.dump({"docs": docs, "vectors": vectors}, f)
    print(f"[Ingest] Successfully saved hybrid index (BM25 + {len(vectors)} vectors) with {len(docs)} passages to '{s.bm25_path}'.")
    print("[Ingest] Ingestion pipeline COMPLETE!")

if __name__ == "__main__":
    main()
