import pytest
from app.services.retrieval import Store
from app.models import QueryRequest, QueryResponse

def test_tokens_extraction():
    tokens = Store._tokens("Hello world! Artificial intelligence 2026.")
    assert "hello" in tokens
    assert "world" in tokens
    assert "artificial" in tokens
    assert "intelligence" in tokens

def test_normalization():
    scores = [10.0, 20.0, 30.0]
    norm = Store._norm(scores)
    assert norm[0] == 0.0
    assert norm[1] == 0.5
    assert norm[2] == 1.0

def test_query_request_model():
    req = QueryRequest(text="What is AI?")
    assert req.text == "What is AI?"

def test_empty_search_graceful():
    store = Store()
    res = store.search("Test query that matches nothing")
    assert isinstance(res, list)
