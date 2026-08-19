import time, sys, os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

print("[1/5] Importing modules...", flush=True)
t0 = time.perf_counter()
import torch
torch.set_num_threads(min(4, os.cpu_count() or 4))
from app.services.embeddings import encoder, encode
from app.services.retrieval import Store
print(f"Imported in {(time.perf_counter()-t0)*1000:.2f} ms", flush=True)

print("[2/5] Loading embedding model...", flush=True)
t0 = time.perf_counter()
enc = encoder()
print(f"Embedding model loaded in {(time.perf_counter()-t0)*1000:.2f} ms", flush=True)

print("[3/5] Encoding single query...", flush=True)
t0 = time.perf_counter()
vec = encode(["Summarize the main topics covered in the documents."])
print(f"Query encoded in {(time.perf_counter()-t0)*1000:.2f} ms", flush=True)

print("[4/5] Initializing Store...", flush=True)
t0 = time.perf_counter()
st = Store()
print(f"Store initialized in {(time.perf_counter()-t0)*1000:.2f} ms (docs: {len(st.docs)}, qdrant_online: {st.qdrant_online})", flush=True)

print("[5/5] Executing search queries...", flush=True)
for q in [
    "Summarize the main topics covered in the documents.",
    "artificial intelligence",
    "machine learning",
    "What is the capital of France?"
]:
    t0 = time.perf_counter()
    res = st.search(q)
    elapsed = (time.perf_counter()-t0)*1000
    print(f"Query '{q}': {elapsed:.2f} ms -> {len(res)} results", flush=True)
