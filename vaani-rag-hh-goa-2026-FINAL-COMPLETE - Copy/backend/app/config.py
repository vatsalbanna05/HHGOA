from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_DIR = Path(__file__).resolve().parents[2]

class Settings(BaseSettings):
    sarvam_api_key: str = ""
    sarvam_model: str = "saaras:v3"
    sarvam_mode: str = "transcribe"
    gemini_api_key: str = ""
    llm_base_url: str = "https://generativelanguage.googleapis.com/v1beta/openai/"
    llm_model: str = "gemini-3.6-flash"
    qdrant_url: str = "http://localhost:6333"
    qdrant_collection: str = "vaani_msmarco"
    embedding_model: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    cors_origins: str = "http://localhost:3000"
    top_k: int = 24
    final_k: int = 6
    min_relevance: float = 0.12
    dataset_name: str = "ai4bharat/MSMARCO-XI"
    dataset_config: str = ""
    dataset_split: str = "train"
    dataset_limit: int = 10000
    bm25_index_path: str = "data/bm25.pkl"
    request_timeout_seconds: float = 30.0
    max_audio_bytes: int = 15_000_000
    model_config = SettingsConfigDict(env_file=str(ROOT_DIR / ".env"), extra="ignore", case_sensitive=False)

    @property
    def bm25_path(self) -> Path:
        path = Path(self.bm25_index_path)
        return path if path.is_absolute() else ROOT_DIR / path

@lru_cache
def settings() -> Settings:
    return Settings()
