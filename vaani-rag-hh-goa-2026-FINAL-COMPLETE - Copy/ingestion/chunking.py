from dataclasses import dataclass
import re, numpy as np

@dataclass
class Chunk:
    text: str
    strategy: str
    metadata: dict

def sentences(text):
    return [x.strip() for x in re.split(r"(?<=[.!?।])\s+", text) if x.strip()]

def fixed(text,n=4):
    s=sentences(text); return [" ".join(s[i:i+n]) for i in range(0,len(s),n)]

def sliding(text,n=280,overlap=60):
    words=text.split(); step=max(1,n-overlap); return [" ".join(words[i:i+n]) for i in range(0,len(words),step)]

def semantic(text,encoder,threshold=.48):
    s=sentences(text)
    if len(s)<2: return s
    vectors=encoder.encode(s,normalize_embeddings=True)
    groups=[]; current=[s[0]]
    for i in range(1,len(s)):
        if float(np.dot(vectors[i-1],vectors[i]))>=threshold: current.append(s[i])
        else: groups.append(" ".join(current)); current=[s[i]]
    groups.append(" ".join(current)); return groups

def variants(text,metadata,encoder):
    output=[]
    for strategy,items in (("sentence",fixed(text)),("sliding",sliding(text)),("semantic",semantic(text,encoder))):
        for i,item in enumerate(items):
            if item.strip(): output.append(Chunk(item,strategy,{**metadata,"chunk_id":f"{strategy}-{i}"}))
    meta_text=" | ".join(f"{k}: {v}" for k,v in metadata.items() if v)
    output.append(Chunk(meta_text+"\n"+text,"metadata",{**metadata,"chunk_id":"metadata-0"}))
    return output
