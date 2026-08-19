import re

DOCUMENT_PATTERNS = [
    r"\bdocuments?\b",
    r"\bpdfs?\b",
    r"\bfiles?\b",
    r"\buploaded\b",
    r"\bknowledge\s*base\b",
    r"\bcorpus\b",
    r"\bpassages?\b",
    r"\baccording\s+to\s+(the|my|this|these|our)?\s*(document|doc|pdf|file|text|passage|knowledge\s*base|article|upload)s?\b",
    r"\bbased\s+on\s+(the|my|this|these|our)?\s*(document|doc|pdf|file|text|passage|knowledge\s*base|article|upload)s?\b",
    r"\bfrom\s+(the|my|this|these|our)\s+(document|doc|pdf|file|text|passage|knowledge\s*base|article|dataset)s?\b",
    r"\bin\s+(the|my|this|these|our)\s+(document|doc|pdf|file|text|passage|knowledge\s*base|article|dataset)s?\b",
    r"\bsummar(?:ize|ise)\b",
    r"\bmain\s+(topics|points|ideas)\s+covered\b",
    r"\bcontents?\s+of\s+(the\s+)?(document|pdf|file|knowledge\s*base)s?\b",
]

def needs_rag(query: str) -> bool:
    if not query:
        return False

    q = query.strip().lower()

    return any(
        re.search(pattern, q, re.IGNORECASE)
        for pattern in DOCUMENT_PATTERNS
    )
