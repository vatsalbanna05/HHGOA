import time, uuid
from .guardrails import input_guard, grounded
from .retrieval import store
from .llm import LLM
from ..config import settings

REFUSAL="I couldn't find enough relevant information in the knowledge base to answer that reliably."

async def run(query: str):
    request_id=str(uuid.uuid4())
    started=time.perf_counter()
    ok,message=input_guard(query)
    if not ok:
        return {
            "request_id":request_id,"answer":message,"grounded":False,"confidence":0.0,"refusal":True,"sources":[],
            "metrics":{"stt_ms":0,"retrieval_ms":0,"generation_ms":0,"grounding_ms":0,"total_ms":round((time.perf_counter()-started)*1000,2)}
        }

    t=time.perf_counter()
    sources=store().search(query)
    retrieval_ms=(time.perf_counter()-t)*1000
    threshold=settings().min_relevance
    if not sources or sources[0]["score"] < threshold:
        return {
            "request_id":request_id,"answer":REFUSAL,"grounded":False,"confidence":0.0,"refusal":True,"sources":[],
            "metrics":{"stt_ms":0,"retrieval_ms":round(retrieval_ms,2),"generation_ms":0,"grounding_ms":0,"total_ms":round((time.perf_counter()-started)*1000,2)}
        }

    context="\n\n".join(f"[Source {i+1}]\n{x['text']}" for i,x in enumerate(sources))
    t=time.perf_counter()
    answer=await LLM().answer(query,context)
    generation_ms=(time.perf_counter()-t)*1000
    t=time.perf_counter()
    is_grounded=grounded(answer,context)
    grounding_ms=(time.perf_counter()-t)*1000
    if not is_grounded:
        answer="I couldn't verify that the generated answer is sufficiently grounded in the retrieved context."

    total=(time.perf_counter()-started)*1000
    return {
        "request_id":request_id,"answer":answer,"grounded":is_grounded,
        "confidence":round(min(0.99,max(0.0,float(sources[0]["score"]))),3),
        "refusal":not is_grounded,"sources":sources,
        "metrics":{"stt_ms":0,"retrieval_ms":round(retrieval_ms,2),"generation_ms":round(generation_ms,2),"grounding_ms":round(grounding_ms,2),"total_ms":round(total,2)}
    }
