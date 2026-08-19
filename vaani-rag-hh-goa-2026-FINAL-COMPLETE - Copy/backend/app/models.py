from pydantic import BaseModel, Field

class QueryRequest(BaseModel):
    text: str = Field(min_length=1, max_length=2000)

class QueryResponse(BaseModel):
    request_id: str
    transcript: str | None = None
    language: str | None = None
    answer: str
    grounded: bool
    confidence: float | None = None
    refusal: bool
    mode: str = "general"
    status: str = "ok"
    verification: str = "not_document_grounded"
    sources: list[dict] = []
    metrics: dict
