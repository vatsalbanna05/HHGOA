from functools import lru_cache
import asyncio
from google import genai
from google.genai import errors
from ..config import settings

class QuotaExhaustedError(RuntimeError):
    """Raised when the Gemini daily quota or resource limit is exhausted."""
    pass

class LLMAuthError(RuntimeError):
    """Raised when Gemini API authentication fails."""
    pass

@lru_cache
def _get_genai_client(api_key: str) -> genai.Client:
    """Cache the client instance to reuse HTTP connections."""
    return genai.Client(api_key=api_key)

class LLM:
    async def answer(
        self,
        question: str,
        context: str = "",
    ) -> str:
        s = settings()

        if not s.gemini_api_key:
            raise LLMAuthError("GEMINI_API_KEY is not configured")

        client = _get_genai_client(s.gemini_api_key)
        model = s.llm_model or "gemini-3.6-flash"

        if context.strip():
            system_instruction = (
                "You are VaaniRAG, a helpful retrieval-augmented AI assistant. "
                "Use the supplied retrieved context when it is relevant to the user's question. "
                "Do not invent information. "
                "Do not claim that information came from the knowledge base unless it is actually present in the supplied context. "
                "Answer clearly, accurately, and concisely. "
                "Answer in the same language as the user whenever possible."
            )
            prompt = (
                f"{system_instruction}\n\n"
                f"Question:\n{question}\n\n"
                f"Retrieved context:\n{context}"
            )
        else:
            system_instruction = (
                "You are VaaniRAG, a helpful multilingual AI assistant. "
                "Answer the user's question accurately using your general knowledge. "
                "Do not claim the answer came from uploaded documents. "
                "Answer clearly, accurately, and concisely. "
                "Answer in the same language as the user whenever possible."
            )
            prompt = (
                f"{system_instruction}\n\n"
                f"Question:\n{question}"
            )

        # Retry once on transient 503 demand spikes with short backoff
        for attempt in range(2):
            try:
                response = await asyncio.to_thread(
                    client.models.generate_content,
                    model=model,
                    contents=prompt,
                )

                answer = (response.text or "").strip()
                if not answer:
                    raise RuntimeError("Gemini returned an empty response")
                return answer

            except errors.ClientError as exc:
                err_msg = str(exc)
                # Detect 429 / RESOURCE_EXHAUSTED / quota errors
                if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg or "Quota" in err_msg or "quota" in err_msg:
                    print(f"Gemini quota exhausted: {exc.code} {exc.message}")
                    raise QuotaExhaustedError(
                        "Gemini daily quota is exhausted. Please try again after the quota resets or use a project with available quota."
                    ) from exc
                elif "401" in err_msg or "403" in err_msg or "UNAUTHENTICATED" in err_msg:
                    print("Gemini authentication error")
                    raise LLMAuthError("Invalid Gemini API credentials. Please verify your GEMINI_API_KEY.") from exc
                else:
                    print(f"Gemini ClientError: {exc.code} {exc.message}")
                    raise

            except errors.ServerError as exc:
                err_msg = str(exc)
                print(f"Gemini ServerError attempt {attempt + 1} ({exc.code}): {exc.message}")
                if attempt == 0 and (exc.code == 503 or "503" in err_msg or "UNAVAILABLE" in err_msg):
                    await asyncio.sleep(2.0)
                    continue
                return "The AI service is currently experiencing temporary high demand. Please try again in a moment."

            except Exception as exc:
                err_name = type(exc).__name__
                print(f"LLM generation error attempt {attempt + 1}: {err_name}: {exc}")
                if attempt == 0:
                    await asyncio.sleep(1.0)
                    continue
                raise