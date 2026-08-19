import os
from functools import lru_cache
import torch
from sentence_transformers import SentenceTransformer
from ..config import settings

# Optimize PyTorch CPU threading on Windows
torch.set_num_threads(min(4, os.cpu_count() or 4))

@lru_cache
def encoder() -> SentenceTransformer:
    model_name = settings().embedding_model
    try:
        # Prefer locally cached weights without network delay
        return SentenceTransformer(model_name, local_files_only=True)
    except Exception:
        # Fall back to downloading if cache missing
        return SentenceTransformer(model_name)

def encode(texts: list[str]):
    return encoder().encode(
        texts,
        normalize_embeddings=True,
        convert_to_numpy=True,
        batch_size=64,
        show_progress_bar=False,
    )

def warmup():
    """Pre-load model weights into memory during app startup to eliminate first-query cold start."""
    try:
        encode(["warmup query"])
    except Exception as exc:
        print(f"Warning: Embeddings warmup failed: {exc}")
