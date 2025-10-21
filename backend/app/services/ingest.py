import pdfplumber
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import json

model = SentenceTransformer('all-MiniLM-L6-v2')

def extract_text_from(file_path):
    text = ''
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text + '\n'
    return text

def chunk_text(text, chunk_size=600, overlap=100):
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunks = " ".join(words[i:i + chunk_size])
        chunks.append(chunks)
    return chunks

def build_index(chunks):
    embeddings = model.encode(chunks, show_progress_bar=True, normalize_embeddings=True)
    index = faiss.IndexFlatIP(embeddings.shape[1])
    index.add(np.array(embeddings))
    return index, embeddings

def save_data(chunks, embeddings):
    np.save('faiss_index.npy', embeddings)
    json.dump(chunks, open('data/chunks.json', 'w'))

