import re


# ============================================================
# SAFETY PATTERNS
# ============================================================

UNSAFE_PATTERNS = [
    r"\bhow\s+to\s+(make|build|create)\s+(a\s+)?(bomb|explosive)\b",
    r"\bhow\s+to\s+(hack|break\s+into|crack)\b",
    r"\b(malware|ransomware|spyware)\b",
    r"\b(steal|dump|extract)\s+(passwords?|credentials?|login\s+credentials?)\b",
]


INJECTION_PATTERNS = [
    r"\bignore\s+(all|any|the)\s+(previous|prior|above)\s+instructions?\b",
    r"\bdisregard\s+(all|any|the)\s+(previous|prior|above)\s+instructions?\b",
    r"\breveal\s+(your|the)\s+(system|hidden)\s+prompt\b",
    r"\bshow\s+me\s+(your|the)\s+(system|hidden)\s+prompt\b",
    r"\bprint\s+(your|the)\s+(system|hidden)\s+prompt\b",
    r"\bwhat\s+are\s+your\s+(system|hidden)\s+instructions?\b",
]


# ============================================================
# STOP WORDS
# ============================================================

STOPWORDS = {
    "a", "an", "the",
    "is", "are", "was", "were",
    "be", "been", "being", "am",

    "what", "which", "who", "whom",
    "where", "when", "why", "how",

    "does", "do", "did",
    "can", "could", "would",
    "should", "will", "may", "might",

    "of", "to", "in", "on", "at",
    "for", "from", "with", "about",
    "into", "by",

    "and", "or", "but", "if",
    "then", "than",

    "this", "that", "these", "those",
    "it", "its",

    "as",
    "your", "you",
    "me", "my",
    "we", "our",
    "they", "their",
}


# ============================================================
# TOKENIZATION
# ============================================================

def _terms(text: str) -> set[str]:
    """
    Extract meaningful normalized words from text.
    """

    if not text:
        return set()

    words = re.findall(
        r"\b[\w]+\b",
        text.lower(),
        flags=re.UNICODE,
    )

    return {
        word
        for word in words
        if word not in STOPWORDS and len(word) > 1
    }


# ============================================================
# INPUT GUARD
# ============================================================

def input_guard(query: str):
    """
    Validate and safety-check the user's query.
    """

    if not isinstance(query, str):
        return False, "Please enter a valid question."

    q = query.strip()

    if len(q) < 2:
        return False, "Please ask a more specific question."

    if any(
        re.search(pattern, q, re.IGNORECASE)
        for pattern in UNSAFE_PATTERNS
    ):
        return False, "I can't help with that request."

    if any(
        re.search(pattern, q, re.IGNORECASE)
        for pattern in INJECTION_PATTERNS
    ):
        return (
            False,
            "I can't follow instructions that attempt to "
            "override the system's safety rules.",
        )

    return True, None


# ============================================================
# RELEVANCE EVIDENCE
# ============================================================

def relevance_evidence(
    query: str,
    source_text: str,
) -> float:
    """
    Calculate meaningful lexical overlap between the query
    and retrieved source.
    """

    query_terms = _terms(query)
    source_terms = _terms(source_text)

    if not query_terms or not source_terms:
        return 0.0

    overlap = query_terms & source_terms

    return len(overlap) / len(query_terms)


# ============================================================
# GROUNDING SCORE
# ============================================================

def grounding_score(
    answer: str,
    context: str,
) -> float:
    """
    Calculate how much of the meaningful answer vocabulary
    appears in the retrieved context.
    """

    answer_terms = _terms(answer)
    context_terms = _terms(context)

    if not answer_terms or not context_terms:
        return 0.0

    overlap = answer_terms & context_terms

    return len(overlap) / len(answer_terms)


# ============================================================
# GROUNDING CHECK
# ============================================================

def grounded(
    answer: str,
    context: str,
    threshold: float = 0.40,
) -> bool:
    """
    Return True when the answer has sufficient lexical
    support from the retrieved context.
    """

    score = grounding_score(
        answer,
        context,
    )

    return score >= threshold


# ============================================================
# RELEVANT SOURCE FILTER
# ============================================================

def filter_relevant_sources(
    query: str,
    sources: list,
    threshold: float = 0.30,
) -> list:
    """
    Keep only sources containing meaningful query evidence.
    """

    filtered = []

    for source in sources:

        if not isinstance(source, dict):
            continue

        text = source.get(
            "text",
            "",
        )

        if not text:
            continue

        evidence = relevance_evidence(
            query,
            text,
        )

        source["evidence"] = round(
            evidence,
            3,
        )

        if evidence >= threshold:
            filtered.append(source)

    return filtered