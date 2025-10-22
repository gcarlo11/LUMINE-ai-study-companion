from fastapi import APIRouter, UploadFile, Request 
from app.services.ingest import extract_text_from_pdf, chunk_text, build_index, save_data
import faiss
import numpy as np 
import os

router = APIRouter()

@router.post("/upload")
async def upload_doc(file: UploadFile, request: Request):
    os.makedirs("uploads", exist_ok=True)
    
    file_path = f"uploads/{file.filename}"
    
    try:
        with open(file_path, "wb") as f:
            f.write(await file.read())
            
        text = extract_text_from_pdf(file_path)
        chunks = chunk_text(text)
        index, embeddings = build_index(chunks)

        save_data(chunks, embeddings) 

        request.app.state.index = index
        request.app.state.chunks = chunks
        print(f"--- Index updated in app state. {len(chunks)} chunks loaded. ---")

        return {"message": "File processed and index updated", "chunks": len(chunks)}
    
    except Exception as e:
        print(f"Error during file upload processing: {e}")
        return {"error": f"Failed to process file: {e}"}