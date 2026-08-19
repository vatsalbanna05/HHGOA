"use client";

import { useRef, useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Source = {
  id: string;
  text: string;
  score: number;
  evidence?: number;
  strategy: string;
  language?: string | null;
  source?: string;
};

type Result = {
  request_id?: string;
  transcript?: string;
  language?: string;
  answer: string;
  grounded: boolean;
  confidence?: number | null;
  refusal: boolean;
  mode?: "rag" | "general" | "refusal" | string;
  status?: "ok" | "general" | "rag" | "quota_exhausted" | "refused" | string;
  verification?: "grounded" | "unverified" | "not_document_grounded" | "refusal" | "quota_exhausted" | string;
  metrics: {
    stt_ms: number;
    retrieval_ms: number;
    generation_ms: number;
    grounding_ms: number;
    total_ms: number;
  };
  sources: Source[];
};

type HealthDetails = {
  api: string;
  qdrant?: string;
  bm25?: boolean;
  documents_indexed?: number;
  sarvam_configured?: boolean;
  gemini_configured?: boolean;
};

const SAMPLE_QUESTIONS = [
  { label: "📚 Summarize Documents (RAG)", text: "Summarize the main topics covered in the documents." },
  { label: "📄 Document Key Points (RAG)", text: "According to the uploaded documents, what are the main points?" },
  { label: "🤖 Capital of France (General)", text: "What is the capital of France?" },
  { label: "💡 Explain AI (General)", text: "Explain artificial intelligence in simple words." },
  { label: "🌐 Multilingual (Hindi)", text: "कृत्रिम बुद्धिमत्ता क्या है?" },
];

function emptyResult(answer: string, isRefusal = false): Result {
  return {
    answer,
    grounded: false,
    confidence: null,
    refusal: isRefusal,
    mode: isRefusal ? "refusal" : "general",
    verification: isRefusal ? "refusal" : "not_document_grounded",
    metrics: { stt_ms: 0, retrieval_ms: 0, generation_ms: 0, grounding_ms: 0, total_ms: 0 },
    sources: [],
  };
}

async function errorText(response: Response) {
  try {
    const d = await response.json();
    return d.detail || "Request failed.";
  } catch {
    return `Request failed with status ${response.status}. Ensure backend is running.`;
  }
}

export default function Home() {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("Processing Pipeline...");
  const [queryText, setQueryText] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);
  const [health, setHealth] = useState<HealthDetails | null>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // Check backend health on mount and periodically
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch(`${API}/health/details`);
        if (res.ok) {
          const data = await res.json();
          setHealth(data);
        }
      } catch {
        setHealth(null);
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        setLoading(true);
        setLoadingStep("Transcribing voice with Sarvam Saaras v3...");
        try {
          const formData = new FormData();
          formData.append(
            "file",
            new Blob(audioChunks.current, { type: recorder.mimeType || "audio/webm" }),
            "voice.webm"
          );

          setLoadingStep("Executing Multilingual Hybrid RAG pipeline...");
          const response = await fetch(`${API}/api/voice`, {
            method: "POST",
            body: formData,
          });

          if (!response.ok) throw new Error(await errorText(response));
          const data = await response.json();
          setQueryText(data.transcript || "");
          setResult(data);
        } catch (err) {
          setResult(emptyResult(err instanceof Error ? err.message : "Voice request failed."));
        } finally {
          setLoading(false);
          setLoadingStep("Processing Pipeline...");
        }
      };

      recorder.start();
      setRecording(true);
    } catch (err) {
      setResult(emptyResult(err instanceof Error ? err.message : "Microphone permission denied."));
    }
  }

  function stopRecording() {
    mediaRecorder.current?.stop();
    setRecording(false);
  }

  async function askQuestion(textToAsk?: string) {
    const text = (textToAsk !== undefined ? textToAsk : queryText).trim();
    if (!text || loading) return;

    if (textToAsk !== undefined) {
      setQueryText(textToAsk);
    }

    setLoading(true);
    setLoadingStep("Routing Query & Processing...");
    try {
      const response = await fetch(`${API}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error(await errorText(response));
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setResult(emptyResult(err instanceof Error ? err.message : "Query request failed."));
    } finally {
      setLoading(false);
      setLoadingStep("Processing Pipeline...");
    }
  }

  function copyAnswer() {
    if (!result?.answer) return;
    navigator.clipboard.writeText(result.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="shell">
      {/* Navigation Header */}
      <header className="app-header">
        <div className="brand-wrapper">
          <div className="logo-badge">🎙️</div>
          <div>
            <div className="brand-title">
              VAANI<span>RAG</span>
            </div>
            <div className="brand-subtitle">
              Voice-First Multilingual Hybrid RAG · HH Goa 2026
            </div>
          </div>
        </div>

        <div className="header-badges">
          <div className="status-pill">
            <span className={`status-dot ${health?.api === "ok" ? "" : "warn"}`} />
            <span>{health?.api === "ok" ? "Engine Active" : "Connecting..."}</span>
          </div>
          {health?.bm25 && (
            <div className="status-pill">
              <span>⚡ BM25 + Dense Indexed ({health.documents_indexed ?? 29} docs)</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Interaction Hero */}
      <section className="glass-card hero-section">
        <div className="interaction-state-tag">
          {loading
            ? `⚡ ${loadingStep}`
            : recording
            ? "🔴 Live Microphone Input"
            : "Ready for Query"}
        </div>

        {/* Voice Orb */}
        <div className="orb-container">
          <button
            className={`mic-orb ${recording ? "recording" : ""}`}
            onClick={recording ? stopRecording : startRecording}
            disabled={loading}
            aria-label={recording ? "Stop Recording" : "Start Voice Input"}
          >
            <span className="orb-icon">{recording ? "⏹️" : "🎙️"}</span>
            <span className="orb-label">{recording ? "STOP" : "SPEAK"}</span>
          </button>

          {recording && (
            <div className="sound-wave">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          )}
        </div>

        <div className="hint-text">
          {loading
            ? loadingStep
            : recording
            ? "Listening to voice in any Indian language or English — click STOP when done"
            : "Tap the microphone to speak, or type your question below"}
        </div>

        {/* Text Input Bar */}
        <div className="query-form">
          <div className="input-wrapper">
            <input
              type="text"
              className="search-input"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && askQuestion()}
              placeholder="Ask anything in English, Hindi, Marathi, etc..."
              disabled={loading}
            />
          </div>
          <button
            className="btn-primary"
            onClick={() => askQuestion()}
            disabled={loading || !queryText.trim()}
          >
            {loading ? "Searching..." : "Ask Question"}
          </button>
        </div>

        {/* Sample Question Chips */}
        <div className="sample-queries-container">
          <span className="sample-chip-label">Try asking:</span>
          {SAMPLE_QUESTIONS.map((sample, idx) => (
            <button
              key={idx}
              className="sample-chip"
              onClick={() => askQuestion(sample.text)}
              disabled={loading}
            >
              {sample.label}
            </button>
          ))}
        </div>
      </section>

      {/* RAG / General AI Results Output */}
      {result && (
        <section className="glass-card result-section">
          <div className="result-header">
            <div className="section-tag">
              {result.refusal
                ? "Safety Guardrail"
                : result.mode === "rag"
                ? "Document RAG Response"
                : "General AI Response"}
            </div>

            <div className="pill-group">
              {/* Context-Aware Verification Badge */}
              {result.refusal ? (
                <span className="badge badge-unverified">
                  🛡️ Request Refused
                </span>
              ) : result.status === "quota_exhausted" || result.verification === "quota_exhausted" ? (
                <span className="badge badge-quota">
                  ⚠️ Quota Limit Reached
                </span>
              ) : result.mode === "general" || result.verification === "not_document_grounded" ? (
                <span className="badge badge-general">
                  🤖 General AI Answer
                </span>
              ) : result.grounded ? (
                <span className="badge badge-grounded">
                  📚 Document-Grounded Answer
                </span>
              ) : (
                <span className="badge badge-unverified">
                  ⚠ Document Answer Not Verified
                </span>
              )}

              {/* Confidence Badge (only for RAG answers) */}
              {result.mode === "rag" && result.confidence !== null && result.confidence !== undefined && (
                <span className="badge badge-highlight">
                  {Math.round(result.confidence * 100)}% Confidence
                </span>
              )}

              {result.mode === "general" && !result.refusal && (
                <span className="badge badge-subtle">
                  General Knowledge
                </span>
              )}

              {result.language && (
                <span className="badge badge-subtle">
                  Lang: {result.language.toUpperCase()}
                </span>
              )}

              <span className="badge badge-subtle">
                ⏱ {result.metrics.total_ms.toFixed(0)} ms
              </span>
            </div>
          </div>

          {/* Verification Subtitle */}
          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "18px" }}>
            {result.refusal
              ? "Safety guardrail blocked this request."
              : result.status === "quota_exhausted"
              ? "Gemini daily API quota limit reached. Please retry after quota reset."
              : result.mode === "general"
              ? "Not verified against uploaded documents (General Knowledge AI Answer)"
              : result.grounded
              ? "✓ Supported by retrieved document passages"
              : "⚠ Retrieved passages did not contain sufficient lexical overlap to verify grounding."}
          </div>

          {/* Voice Transcript (if available) */}
          {(result.transcript || (recording && queryText)) && (
            <div className="transcript-box">
              <div className="transcript-label">VOICE TRANSCRIPT (SARVAM STT)</div>
              <div className="transcript-text">"{result.transcript || queryText}"</div>
            </div>
          )}

          {/* Answer Box */}
          <div className="answer-box">
            <div className="answer-label">GENERATED ANSWER</div>
            <div className="answer-content">{result.answer}</div>
            <button
              onClick={copyAnswer}
              className="sample-chip"
              style={{ marginTop: "14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              {copied ? "✓ Copied to clipboard" : "📋 Copy Answer"}
            </button>
          </div>

          {/* Latency Breakdown Waterfall */}
          <div className="metrics-grid">
            <MetricCard name="STT (Sarvam)" value={result.metrics.stt_ms} />
            <MetricCard name="Hybrid Retrieval" value={result.metrics.retrieval_ms} />
            <MetricCard name="LLM (Gemini)" value={result.metrics.generation_ms} />
            <MetricCard name="Grounding Check" value={result.metrics.grounding_ms} />
            <MetricCard name="Total Latency" value={result.metrics.total_ms} isTotal />
          </div>

          {/* Retrieved Evidence Explorer */}
          {result.sources && result.sources.length > 0 && (
            <details className="sources-accordion" open>
              <summary className="sources-summary">
                <span>📚 Retrieved Context ({result.sources.length} passages ranked via RRF + Reranker)</span>
                <span>▼</span>
              </summary>
              <div className="sources-list">
                {result.sources.map((src, index) => (
                  <div className="source-item" key={src.id || index}>
                    <div className="source-meta">
                      <span className="strategy-badge">{src.strategy.toUpperCase()}</span>
                      <span className="source-score">Relevance Score: {src.score.toFixed(4)}</span>
                      {src.evidence !== undefined && (
                        <span className="source-score">· Lexical Overlap: {(src.evidence * 100).toFixed(0)}%</span>
                      )}
                      {src.language && <span className="source-score">· {src.language}</span>}
                    </div>
                    <div className="source-text">{src.text}</div>
                  </div>
                ))}
              </div>
            </details>
          )}
        </section>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-features">
          <span className="footer-feature-item">Sarvam Saaras v3 STT</span>
          <span className="footer-feature-item">Adaptive Multi-Strategy Chunking</span>
          <span className="footer-feature-item">Dense + BM25 Hybrid Fusion</span>
          <span className="footer-feature-item">Gemini Grounded Gen</span>
          <span className="footer-feature-item">P50/P70/P100 Metrics</span>
        </div>
        <div className="footer-copyright">
          VaaniRAG · Hackathon Goa 2026 Submission
        </div>
      </footer>
    </div>
  );
}

function MetricCard({
  name,
  value,
  isTotal = false,
}: {
  name: string;
  value: number;
  isTotal?: boolean;
}) {
  return (
    <div className={`metric-card ${isTotal ? "total" : ""}`}>
      <div className="metric-name">{name}</div>
      <div className="metric-value">{value.toFixed(0)} ms</div>
    </div>
  );
}
