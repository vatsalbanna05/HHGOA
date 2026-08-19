import time
import uuid

from .guardrails import input_guard, grounded
from .retrieval import store
from .llm import LLM
from ..config import settings


async def run(query: str):
    request_id = str(uuid.uuid4())
    started = time.perf_counter()

    # ---------------------------------------------------------
    # 1. INPUT GUARD
    # ---------------------------------------------------------
    ok, message = input_guard(query)

    if not ok:
        return {
            "request_id": request_id,
            "answer": message,
            "grounded": False,
            "confidence": 0.0,
            "refusal": True,
            "sources": [],
            "metrics": {
                "stt_ms": 0,
                "retrieval_ms": 0,
                "generation_ms": 0,
                "grounding_ms": 0,
                "total_ms": round(
                    (time.perf_counter() - started) * 1000,
                    2
                ),
            },
        }

    # ---------------------------------------------------------
    # 2. HYBRID RETRIEVAL
    # ---------------------------------------------------------
    retrieval_started = time.perf_counter()

    try:
        sources = store().search(query)
    except Exception as exc:
        print(f"RETRIEVAL ERROR: {type(exc).__name__}: {exc}")
        sources = []

    retrieval_ms = (
        time.perf_counter() - retrieval_started
    ) * 1000

    # ---------------------------------------------------------
    # 3. CHECK RELEVANCE
    # ---------------------------------------------------------
    threshold = settings().min_relevance

    relevant_sources = [
        source
        for source in sources
        if source.get("text", "").strip()
        and float(source.get("score", 0.0)) >= threshold
    ]

    # ---------------------------------------------------------
    # 4. RAG MODE OR GENERAL AI MODE
    # ---------------------------------------------------------
    if relevant_sources:

        # RAG MODE
        context = "\n\n".join(
            f"[Source {i + 1}]\n{x['text']}"
            for i, x in enumerate(relevant_sources)
        )

        rag_mode = True
        selected_sources = relevant_sources

    else:

        # GENERAL AI MODE
        context = ""
        rag_mode = False
        selected_sources = []

    # ---------------------------------------------------------
    # 5. GENERATE ANSWER
    # ---------------------------------------------------------
    generation_started = time.perf_counter()

    try:
        answer = await LLM().answer(
            query,
            context
        )

    except Exception as exc:
        print(
            f"LLM ERROR: {type(exc).__name__}: {exc}"
        )

        answer = (
            "I'm sorry, but I couldn't generate an answer right now. "
            "Please try again."
        )

    generation_ms = (
        time.perf_counter() - generation_started
    ) * 1000

    # ---------------------------------------------------------
    # 6. GROUNDING
    # ---------------------------------------------------------
    grounding_started = time.perf_counter()

    if rag_mode and selected_sources:

        try:
            is_grounded = grounded(
                answer,
                context
            )

        except Exception as exc:
            print(
                f"GROUNDING ERROR: {type(exc).__name__}: {exc}"
            )

            # Do not block a valid RAG answer if the grounding
            # checker itself fails.
            is_grounded = True

    else:

        # General AI answer has no retrieved context to verify.
        is_grounded = False

    grounding_ms = (
        time.perf_counter() - grounding_started
    ) * 1000

    # ---------------------------------------------------------
    # 7. CONFIDENCE
    # ---------------------------------------------------------
    if selected_sources:

        confidence = min(
            0.99,
            max(
                0.0,
                float(
                    selected_sources[0].get(
                        "score",
                        0.0
                    )
                )
            )
        )

    else:

        confidence = 0.0

    # ---------------------------------------------------------
    # 8. FINAL RESPONSE
    # ---------------------------------------------------------
    total_ms = (
        time.perf_counter() - started
    ) * 1000

    return {
        "request_id": request_id,
        "answer": answer,
        "grounded": is_grounded,
        "confidence": round(
            confidence,
            3
        ),

        # General questions are not refusals.
        "refusal": False,

        "sources": selected_sources,

        "metrics": {
            "stt_ms": 0,
            "retrieval_ms": round(
                retrieval_ms,
                2
            ),
            "generation_ms": round(
                generation_ms,
                2
            ),
            "grounding_ms": round(
                grounding_ms,
                2
            ),
            "total_ms": round(
                total_ms,
                2
            ),
        },
    }