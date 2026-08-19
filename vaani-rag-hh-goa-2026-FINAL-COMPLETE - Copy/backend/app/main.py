import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .models import QueryRequest
from .services.orchestrator import run
from .services.sarvam import Sarvam
from .services.retrieval import store, warmup_store
from .services.embeddings import warmup as warmup_embeddings

s = settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Warm up model weights & local indices
    try:
        warmup_embeddings()
        warmup_store()
    except Exception as exc:
        print(f"Startup warmup note: {exc}")
    yield
    # Shutdown

app = FastAPI(
    title="VaaniRAG API",
    description="Multilingual Voice-First Hybrid RAG System",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[x.strip() for x in s.cors_origins.split(",") if x.strip()],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

@app.get("/health")
def health():
    return {"status": "ok", "service": "vaani-rag", "version": "1.0.0"}

@app.get("/health/details")
def health_details():
    st = store()
    result = {
        "api": "ok",
        "qdrant": "connected" if st.qdrant_online else ("embedded-ready" if st.vectors is not None else "offline"),
        "collection": s.qdrant_collection,
        "bm25": st.bm25 is not None,
        "documents_indexed": len(st.docs),
        "sarvam_configured": bool(s.sarvam_api_key),
        "gemini_configured": bool(s.gemini_api_key),
    }
    if st.client and st.qdrant_online:
        try:
            info = st.client.get_collection(s.qdrant_collection, timeout=0.5)
            result["qdrant"] = info.status.value if hasattr(info.status, "value") else str(info.status)
        except Exception as exc:
            result["qdrant_error"] = str(exc)[:200]
    return result

@app.post("/api/query")
async def query(body: QueryRequest):
    try:
        return await run(body.text)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        print(f"Query error: {exc}")
        raise HTTPException(
            status_code=500,
            detail="The RAG pipeline encountered an error. Please try again.",
        ) from exc

@app.post("/api/voice")
async def voice(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=415, detail="Please upload an audio file.")
    started = time.perf_counter()
    try:
        audio = await file.read()
        text, lang = await Sarvam().transcribe(audio, file.filename or "voice.webm")
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Speech-to-text failed: {exc}") from exc

    stt_ms = (time.perf_counter() - started) * 1000
    if not text:
        raise HTTPException(status_code=422, detail="No speech was detected.")

    try:
        result = await run(text)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    result["transcript"] = text
    result["language"] = lang
    result["metrics"]["stt_ms"] = round(stt_ms, 2)
    result["metrics"]["total_ms"] = round(result["metrics"]["total_ms"] + stt_ms, 2)
    return result
