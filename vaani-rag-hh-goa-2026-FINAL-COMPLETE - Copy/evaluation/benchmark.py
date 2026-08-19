import argparse,asyncio,time,statistics,httpx
QUESTIONS=[
"What is artificial intelligence?","How does machine learning work?","What is education?","How does a computer process information?",
"What is climate change?","What is data science?","How does the internet work?","What is natural language processing?",
"How do neural networks learn?","What is technology?",
]

def percentile(values,p):
    values=sorted(values); k=(len(values)-1)*p; i=int(k); j=min(i+1,len(values)-1); return values[i]+(values[j]-values[i])*(k-i)

async def main():
    parser=argparse.ArgumentParser(); parser.add_argument("--url",default="http://localhost:8000"); parser.add_argument("--rounds",type=int,default=100); args=parser.parse_args()
    vals=[]; stage=[]; failures=0
    async with httpx.AsyncClient(timeout=60) as client:
        for i in range(args.rounds):
            q=QUESTIONS[i%len(QUESTIONS)]; t=time.perf_counter()
            try:
                r=await client.post(args.url+"/api/query",json={"text":q}); r.raise_for_status(); data=r.json(); vals.append((time.perf_counter()-t)*1000); stage.append(data.get("metrics",{}))
            except Exception: failures+=1
    if not vals: raise SystemExit("No successful benchmark requests.")
    print(f"samples={len(vals)} failures={failures}")
    print(f"P50={percentile(vals,.50):.2f}ms P70={percentile(vals,.70):.2f}ms P100={max(vals):.2f}ms mean={statistics.mean(vals):.2f}ms")
    if stage:
        for key in ("retrieval_ms","generation_ms","grounding_ms","total_ms"):
            numbers=[float(x.get(key,0)) for x in stage]
            print(f"{key}: P50={percentile(numbers,.50):.2f}ms P70={percentile(numbers,.70):.2f}ms P100={max(numbers):.2f}ms")

if __name__=="__main__": asyncio.run(main())
