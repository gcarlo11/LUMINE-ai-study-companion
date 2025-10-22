from fastapi import FastAPI
from app.api import docs, chat
import numpy as np
import faiss
import json
import os

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,   
    allow_credentials=True,   
    allow_methods=["*"],      
    allow_headers=["*"],      
)

@app.on_event("startup")
def load_index_on_startup():
    EMBEDDINGS_PATH = 'data/embeddings.npy'
    CHUNKS_PATH = 'data/chunks.json'
    
    app.state.index = None
    app.state.chunks = []

    if os.path.exists(EMBEDDINGS_PATH) and os.path.exists(CHUNKS_PATH):
        try:
            embeddings = np.load(EMBEDDINGS_PATH)
            with open(CHUNKS_PATH, 'r') as f:
                app.state.chunks = json.load(f)
            
            if embeddings is not None and len(app.state.chunks) > 0:
                app.state.index = faiss.IndexFlatIP(embeddings.shape[1])
                app.state.index.add(embeddings)
                print("--- Index and chunks loaded successfully. ---")
            else:
                print("--- Index or chunks file is empty. ---")
        except Exception as e:
            print(f"--- Error loading index on startup: {e} ---")
    else:
        print("--- Embedding files not found. Server will start without index. ---")

app.include_router(docs.router, prefix="/docs", tags=["Docs"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])