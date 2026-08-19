import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "vaani-rag"

def test_health_details():
    response = client.get("/health/details")
    assert response.status_code == 200
    data = response.json()
    assert data["api"] == "ok"
    assert "collection" in data
