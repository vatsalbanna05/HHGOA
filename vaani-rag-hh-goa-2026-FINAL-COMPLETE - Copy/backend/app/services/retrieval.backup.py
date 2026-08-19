import os, pickle, re
from functools import lru_cache
import numpy as np
from qdrant_client import QdrantClient
from rank_bm25 import BM25Okapi
from .embeddings import encode
from ..config import settings

class Store:
    def __init__(self):
        self.s = settings()
        self.docs = []
        self.vectors = None
        self.bm25 = None
        self.client = None
        self.qdrant_online = False
        
        try:
            client = QdrantClient(url=self.s.qdrant_url, timeout=0.5)
            client.get_collections()
            self.client = client
            self.qdrant_online = True
        except Exception:
            self.client = None
            self.qdrant_online = False

        path = self.s.bm25_path
        if path.exists():
            with path.open("rb") as f:
                payload = pickle.load(f)
            self.docs = payload.get("docs", [])
            if "vectors" in payload and payload["vectors"] is not None:
                self.vectors = np.asarray(payload["vectors"], dtype=np.float32)
            elif self.docs and "vector" in self.docs[0]:
                self.vectors = np.asarray([d["vector"] for d in self.docs], dtype=np.float32)
            if self.docs:
                self.bm25 = BM25Okapi([self._tokens(d.get("text", "")) for d in self.docs])

    @staticmethod
    def _tokens(text):
        return re.findall(r"\w+", text.lower(), flags=re.UNICODE)

    @staticmethod
    def _norm(values):
        if not values:
            return {}
        arr=np.asarray(values, dtype=float)
        lo,hi=float(arr.min()),float(arr.max())
        if hi-lo < 1e-9:
            return {i:1.0 for i,_ in enumerate(values)}
        return {i:(v-lo)/(hi-lo) for i,v in enumerate(values)}

    def _dense(self, query):
        query_vec = encode([query])[0]
        if self.qdrant_online and self.client:
            try:
                result = self.client.query_points(
                    collection_name=self.s.qdrant_collection,
                    query=query_vec.tolist(), using="dense", limit=self.s.top_k, with_payload=True, timeout=1.0
                )
                return [(str(p.id), p.payload or {}, float(p.score), i+1) for i, p in enumerate(result.points)]
            except Exception:
                pass

        if self.vectors is not None and len(self.docs) == len(self.vectors) and len(self.vectors) > 0:
            scores = np.dot(self.vectors, query_vec)
            order = np.argsort(scores)[::-1][:self.s.top_k]
            return [(str(self.docs[i]["id"]), self.docs[i], float(scores[i]), rank+1) for rank, i in enumerate(order) if scores[i] > 0]
        return []

    def search(self, query):
        dense=[]; lexical=[]
        try:
            dense=self._dense(query)
        except Exception:
            dense=[]
        if self.bm25:
            scores=self.bm25.get_scores(self._tokens(query))
            order=np.argsort(scores)[::-1][:self.s.top_k]
            lexical=[(str(self.docs[i]["id"]), self.docs[i], float(scores[i]), rank+1) for rank,i in enumerate(order) if scores[i]>0]

        # Reciprocal Rank Fusion gives both retrievers a common ranking scale.
        fused={}
        for source, items in (("dense",dense),("bm25",lexical)):
            for item in items:
                pid,payload,raw,rank=item
                entry=fused.setdefault(pid,{"payload":payload,"rrf":0.0,"dense":0.0,"bm25":0.0})
                entry["rrf"] += 1.0/(60+rank)
                entry[source]=raw

        if not fused:
            return []

        # Lightweight reranker: RRF + normalized dense/BM25 + query-term overlap.
        dense_items=[(pid,v["dense"]) for pid,v in fused.items() if v["dense"]]
        bm_items=[(pid,v["bm25"]) for pid,v in fused.items() if v["bm25"]]
        dense_norm_values=self._norm([score for _,score in dense_items])
        bm_norm_values=self._norm([score for _,score in bm_items])
        dense_norm={pid:dense_norm_values[i] for i,(pid,_) in enumerate(dense_items)}
        bm_norm={pid:bm_norm_values[i] for i,(pid,_) in enumerate(bm_items)}
        query_terms=self._tokens(query)
        query_set=set(query_terms)
        candidates=[]
        for pid,v in fused.items():
            text=v["payload"].get("text","")
            terms=self._tokens(text)
            overlap=len(query_set & set(terms))/max(1,len(query_set))
            d=max(0.0,float(v["dense"])) if v["dense"] else 0.0
            b=max(0.0,float(v["bm25"])) if v["bm25"] else 0.0
            # normalized positions are computed separately; missing retriever = 0
            dn=dense_norm.get(pid,0.0)
            bn=bm_norm.get(pid,0.0)
            score=0.35*v["rrf"] + 0.40*dn + 0.15*bn + 0.10*overlap
            candidates.append((score,pid,v["payload"]))
        candidates.sort(key=lambda x:x[0], reverse=True)

        out=[]
        for score,pid,payload in candidates[:self.s.final_k]:
            out.append({
                "id":pid, "text":payload.get("text", ""), "score":round(float(score),6),
                "strategy":payload.get("strategy","unknown"), "language":payload.get("language") or None,
                "source":payload.get("source", self.s.dataset_name),
            })
        return out

@lru_cache
def store():
    return Store()
