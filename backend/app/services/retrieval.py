import numpy as np
import faiss
import json
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = np.load('data/embeddings.npy')
chunks = json.load(open('data/chunks.json'))
index = faiss.IndexFlatIP(embeddings.shape[1])
index.add(embeddings)

def retrieval(query, k=3):
    query_vector = model.encode([query], normalize_embeddings=True)
    scores, indices = index.search(np.array(query_vector), k)  
    results = [chunks[i] for i in indices[0]]
    return results
