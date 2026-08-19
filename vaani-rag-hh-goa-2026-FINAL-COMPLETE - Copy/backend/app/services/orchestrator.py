import time
import uuid

from .guardrails import (
    input_guard,
    grounding_score,
    relevance_evidence,
)
from .query_router import needs_rag
from .retrieval import store
from .llm import LLM, QuotaExhaustedError, LLMAuthError
from ..config import settings


async def run(query: str):
    request_id = str(uuid.uuid4())
    started = time.perf_counter()

    # 1. Input Safety Guardrail
    ok, message = input_guard(query)
    if not ok:
        total_ms = round((time.perf_counter() - started) * 1000, 2)
        return {
            "request_id": request_id,
            "answer": message,
            "grounded": False,
            "confidence": 0.0,
            "refusal": True,
            "mode": "refusal",
            "status": "refused",
            "verification": "refusal",
            "sources": [],
            "metrics": {
                "stt_ms": 0.0,
                "retrieval_ms": 0.0,
                "generation_ms": 0.0,
                "grounding_ms": 0.0,
                "total_ms": total_ms,
            },
        }

    # 2. Query Routing: Does this require documents?
    rag_requested = needs_rag(query)

    sources = []
    context = ""
    rag_mode = False
    retrieval_ms = 0.0

    # 3. Hybrid Retrieval (if document question)
    if rag_requested:
        retrieval_started = time.perf_counter()
        try:
            sources = store().search(query)
        except Exception as exc:
            print(f"Retrieval error: {exc}")
            sources = []
        retrieval_ms = (time.perf_counter() - retrieval_started) * 1000

        threshold = settings().min_relevance
        relevant_sources = []
        for source in sources:
            text = source.get("text", "").strip()
            if not text:
                continue

            score = float(source.get("score", 0.0))
            evidence = relevance_evidence(query, text)
            source["evidence"] = round(evidence, 3)

            # Accept sources that exceed the hybrid relevance threshold
            if score >= threshold:
                relevant_sources.append(source)

        if relevant_sources:
            sources = relevant_sources
            context = "\n\n".join(
                f"[Source {i + 1}]\n{source['text']}"
                for i, source in enumerate(sources)
            )
            rag_mode = True
        else:
            sources = []
            context = ""
            rag_mode = False

    # 4. LLM Generation
    generation_started = time.perf_counter()
    quota_error = False
    try:
        answer = await LLM().answer(query, context)
    except QuotaExhaustedError:
        quota_error = True
        answer = "Gemini daily quota is exhausted. Please try again after the quota resets or use a project with available quota."
    except LLMAuthError as exc:
        answer = str(exc)
    except Exception as exc:
        print(f"LLM generation failed: {exc}")
        answer = "I'm sorry, but I couldn't generate an answer right now. Please try again."

    generation_ms = (time.perf_counter() - generation_started) * 1000

    # 5. Grounding Check & Confidence Scoring
    grounding_started = time.perf_counter()
    grounding_value = 0.0
    is_grounded = False

    if rag_mode and sources and not quota_error:
        try:
            grounding_value = grounding_score(answer, context)
            is_grounded = grounding_value >= 0.30
        except Exception as exc:
            print(f"Grounding check error: {exc}")
            grounding_value = 0.0
            is_grounded = False

    grounding_ms = (time.perf_counter() - grounding_started) * 1000

    # 6. Response mode, verification, and confidence semantics
    if quota_error:
        mode = "rag" if rag_mode else "general"
        status = "quota_exhausted"
        verification = "quota_exhausted"
        confidence = None
    elif rag_mode and sources:
        mode = "rag"
        status = "rag"
        verification = "grounded" if is_grounded else "unverified"
        retrieval_score = max(float(s.get("score", 0.0)) for s in sources)
        evidence_score = max(float(s.get("evidence", 0.0)) for s in sources)
        raw_conf = (
            0.50 * min(max(retrieval_score, 0.0), 1.0)
            + 0.20 * min(max(evidence_score, 0.0), 1.0)
            + 0.30 * grounding_value
        )
        if not is_grounded:
            raw_conf *= 0.7
        confidence = round(min(max(raw_conf, 0.1), 1.0), 3)
    else:
        mode = "general"
        status = "general"
        verification = "not_document_grounded"
        confidence = None

    total_ms = (time.perf_counter() - started) * 1000

    return {
        "request_id": request_id,
        "answer": answer,
        "grounded": is_grounded,
        "confidence": confidence,
        "refusal": False,
        "mode": mode,
        "status": status,
        "verification": verification,
        "sources": sources,
        "metrics": {
            "stt_ms": 0.0,
            "retrieval_ms": round(retrieval_ms, 2),
            "generation_ms": round(generation_ms, 2),
            "grounding_ms": round(grounding_ms, 2),
            "total_ms": round(total_ms, 2),
        },
    }
