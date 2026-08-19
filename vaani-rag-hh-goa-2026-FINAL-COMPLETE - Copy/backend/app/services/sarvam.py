import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from ..config import settings

class Sarvam:
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=0.2, min=0.2, max=1.5),
        retry=retry_if_exception_type((httpx.TimeoutException, httpx.NetworkError)),
        reraise=True,
    )
    async def transcribe(self, audio: bytes, filename: str):
        s=settings()
        if not s.sarvam_api_key:
            raise RuntimeError("SARVAM_API_KEY is not configured")
        if len(audio) > s.max_audio_bytes:
            raise RuntimeError("Audio file is too large. Keep the recording short for the low-latency demo.")
        files={"file":(filename, audio)}
        data={"model":s.sarvam_model,"mode":s.sarvam_mode,"language_code":"unknown"}
        async with httpx.AsyncClient(timeout=s.request_timeout_seconds) as client:
            response=await client.post(
                "https://api.sarvam.ai/speech-to-text",
                headers={"api-subscription-key":s.sarvam_api_key},
                files=files, data=data
            )
            response.raise_for_status()
            body=response.json()
        return (body.get("transcript") or "").strip(), body.get("language_code")
