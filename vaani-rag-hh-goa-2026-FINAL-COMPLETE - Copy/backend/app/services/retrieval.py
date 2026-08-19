import os
import pickle
import re
import socket
from urllib.parse import urlparse
from functools import lru_cache
import numpy as np
from qdrant_client import QdrantClient
from rank_bm25 import BM25Okapi
from .embeddings import encode
from ..config import settings
from .guardrails import _terms

def _is_service_reachable(url: str, timeout_sec: float = 0.1) -> bool:
    """Fast non-blocking TCP socket check to avoid long Qdrant timeouts."""
    try:
        parsed = urlparse(url)
        host = parsed.hostname or "localhost"
        port = parsed.port or (6333 if "http" in parsed.scheme else 80)
        with socket.create_connection((host, port), timeout=timeout_sec):
            return True
    except Exception:
        return False

class Store:
    def __init__(self):
        self.s = settings()
        self.docs = []
        self.vectors = None
        self.bm25 = None
        self.client = None
        self.qdrant_online = False

        # 1. Fast check for Qdrant
        if _is_service_reachable(self.s.qdrant_url, timeout_sec=0.15):
            try:
                client = QdrantClient(
                    url=self.s.qdrant_url,
                    timeout=0.5,
                    check_compatibility=False,
                )
                client.get_collections()
                self.client = client
                self.qdrant_online = True
            except Exception:
                self.client = None
                self.qdrant_online = False

        # 2. Load embedded BM25 & vector cache
        path = self.s.bm25_path
        if path.exists():
            try:
                with path.open("rb") as f:
                    payload = pickle.load(f)
                self.docs = payload.get("docs", [])
                if "vectors" in payload and payload["vectors"] is not None:
                    self.vectors = np.asarray(payload["vectors"], dtype=np.float32)
                elif self.docs and "vector" in self.docs[0]:
                    self.vectors = np.asarray([d["vector"] for d in self.docs], dtype=np.float32)

                if self.docs:
                    # Tokenize with stopword filtering for meaningful lexical search
                    corpus_tokens = [list(_terms(d.get("text", ""))) for d in self.docs]
                    self.bm25 = BM25Okapi(corpus_tokens)
            except Exception as exc:
                print(f"Warning: Failed to load local BM25 index: {exc}")

    @staticmethod
    def _tokens(text: str) -> list[str]:
        return list(_terms(text))

    @staticmethod
    def _norm(values):
        if not values:
            return {}
        arr = np.asarray(values, dtype=float)
        lo, hi = float(arr.min()), float(arr.max())
        if hi - lo < 1e-9:
            return {i: 1.0 for i, _ in enumerate(values)}
        return {i: (v - lo) / (hi - lo) for i, v in enumerate(values)}

    def _dense(self, query: str):
        query_vec = encode([query])[0]
        if self.qdrant_online and self.client:
            try:
                result = self.client.query_points(
                    collection_name=self.s.qdrant_collection,
                    query=query_vec.tolist(),
                    using="dense",
                    limit=self.s.top_k,
                    with_payload=True,
                    timeout=0.5,
                )
                return [
                    (str(p.id), p.payload or {}, float(p.score), i + 1)
                    for i, p in enumerate(result.points)
                ]
            except Exception:
                pass

        if self.vectors is not None and len(self.docs) == len(self.vectors) and len(self.vectors) > 0:
            scores = np.dot(self.vectors, query_vec)
            order = np.argsort(scores)[::-1][: self.s.top_k]
            return [
                (str(self.docs[i].get("id", i)), self.docs[i], float(scores[i]), rank + 1)
                for rank, i in enumerate(order)
                if scores[i] > 0
            ]
        return []

    def search(self, query: str):
        dense = []
        lexical = []
        try:
            dense = self._dense(query)
        except Exception as exc:
            print(f"Dense search warning: {exc}")
            dense = []

        query_tokens = self._tokens(query)
        if self.bm25 and query_tokens:
            scores = self.bm25.get_scores(query_tokens)
            order = np.argsort(scores)[::-1][: self.s.top_k]
            lexical = [
                (str(self.docs[i].get("id", i)), self.docs[i], float(scores[i]), rank + 1)
                for rank, i in enumerate(order)
                if scores[i] > 0
            ]

        # Reciprocal Rank Fusion
        fused = {}
        for source, items in (("dense", dense), ("bm25", lexical)):
            for item in items:
                pid, payload, raw, rank = item
                entry = fused.setdefault(
                    pid, {"payload": payload, "rrf": 0.0, "dense": 0.0, "bm25": 0.0}
                )
                entry["rrf"] += 1.0 / (60 + rank)
                entry[source] = raw

        if not fused:
            return []

        # Lightweight reranker: RRF + normalized dense/BM25 + meaningful query-term overlap
        dense_items = [(pid, v["dense"]) for pid, v in fused.items() if v["dense"]]
        bm_items = [(pid, v["bm25"]) for pid, v in fused.items() if v["bm25"]]
        dense_norm_values = self._norm([score for _, score in dense_items])
        bm_norm_values = self._norm([score for _, score in bm_items])
        dense_norm = {pid: dense_norm_values[i] for i, (pid, _) in enumerate(dense_items)}
        bm_norm = {pid: bm_norm_values[i] for i, (pid, _) in enumerate(bm_items)}

        query_set = set(query_tokens)
        candidates = []
        for pid, v in fused.items():
            text = v["payload"].get("text", "")
            terms = set(self._tokens(text))
            overlap = len(query_set & terms) / max(1, len(query_set)) if query_set else 0.0
            dn = dense_norm.get(pid, 0.0)
            bn = bm_norm.get(pid, 0.0)
            score = 0.35 * v["rrf"] + 0.40 * dn + 0.15 * bn + 0.10 * overlap
            candidates.append((score, pid, v["payload"]))

        candidates.sort(key=lambda x: x[0], reverse=True)

        out = []
        for score, pid, payload in candidates[: self.s.final_k]:
            out.append({
                "id": str(pid),
                "text": payload.get("text", ""),
                "score": round(float(score), 6),
                "strategy": payload.get("strategy", "unknown"),
                "language": payload.get("language") or None,
                "source": payload.get("source", self.s.dataset_name),
            })
        return out

@lru_cache
def store() -> Store:
    return Store()

def warmup_store():
    """Warm up store and vectors during app startup."""
    try:
        st = store()
        st.search("warmup test")
    except Exception as exc:
        print(f"Warning: Store warmup failed: {exc}")
