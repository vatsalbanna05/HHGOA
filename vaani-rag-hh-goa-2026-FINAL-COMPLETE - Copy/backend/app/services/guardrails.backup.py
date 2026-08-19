import re

UNSAFE_PATTERNS = [
    r"\bhow to (make|build|create)\s+(a\s+)?(bomb|explosive)\b",
    r"\bhow to hack\b",
    r"\bmalware\b",
    r"\bransomware\b",
    r"\bsteal passwords?\b",
]
INJECTION_PATTERNS = [
    r"ignore (all|any|the) previous instructions",
    r"reveal (your|the) system prompt",
    r"show me (your|the) hidden prompt",
]

def input_guard(query: str):
    q = query.strip()
    if len(q) < 2:
        return False, "Please ask a more specific question."
    if any(re.search(p, q, re.I) for p in UNSAFE_PATTERNS):
        return False, "I can't help with that request."
    if any(re.search(p, q, re.I) for p in INJECTION_PATTERNS):
        return False, "I can't follow instructions that attempt to override the system's safety rules."
    return True, None

def _terms(text: str) -> set[str]:
    return set(re.findall(r"\w+", text.lower(), flags=re.UNICODE))

def grounded(answer: str, context: str, threshold: float = 0.12) -> bool:
    a, c = _terms(answer), _terms(context)
    if not a or not c:
        return False
    return len(a & c) / len(a) >= threshold
