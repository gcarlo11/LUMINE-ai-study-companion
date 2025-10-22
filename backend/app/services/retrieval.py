import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')

def retrieval(query: str, index: faiss.Index, chunks: list, k: int = 3):
    if index is None or len(chunks) == 0:
        return ["Index is not loaded. Please upload a document first."]

    query_vector = model.encode([query], normalize_embeddings=True)
    
    if query_vector.ndim == 1:
        query_vector = np.array([query_vector])
        
    try:
        scores, indices = index.search(query_vector, k)  
        
        results = []
        for i in indices[0]:
            if 0 <= i < len(chunks):
                results.append(chunks[i])
        
        return results
    except Exception as e:
        print(f"Error during search: {e}")
        return [f"Error during search: {e}"]