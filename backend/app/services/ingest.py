import pdfplumber
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

model = SentenceTransformer('all-MiniLM-L6-v2')

def extract_text_from_pdf(file_path):
    text = ''
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() 
            if page_text: 
                text += page_text + '\n'
    return text

def chunk_text(text, chunk_size=600, overlap=100):
    words = text.split()
    chunks_list = [] 
    for i in range(0, len(words), chunk_size - overlap):
        chunk_str = " ".join(words[i:i + chunk_size]) 
        chunks_list.append(chunk_str) 
    return chunks_list 

def build_index(chunks):
    embeddings = model.encode(chunks, show_progress_bar=True, normalize_embeddings=True)
    index = faiss.IndexFlatIP(embeddings.shape[1])
    index.add(np.array(embeddings))
    return index, embeddings
