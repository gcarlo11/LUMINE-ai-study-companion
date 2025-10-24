import tempfile
from fastapi import APIRouter, UploadFile, Request 
from app.services.ingest import extract_text_from_pdf, chunk_text, build_index
import faiss
import numpy as np 
import os

router = APIRouter()

@router.post("/upload")
async def upload_doc(file: UploadFile, request: Request):

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            content = await file.read()
            temp_pdf.write(content)
            temp_pdf_path = temp_pdf.name

            text = extract_text_from_pdf(temp_pdf_path)
            chunks = chunk_text(text)
            index, embeddings = build_index(chunks)

            request.app.state.index = index
            request.app.state.chunks = chunks   

            print(f"--- Index updated in app state (memory). {len(chunks)} chunks loaded. ---")

            return {"message": "File processed and index updated in memory", "chunks": len(chunks)}

    except Exception as e:
        print(f"--- DEBUG: Error during file upload and processing: {e} ---")
        if 'temp_pdf_path' in locals() and os.path.exists(temp_pdf_path):
            os.unlink(temp_pdf_path)
        return {"error": f"File processing failed: {e}"}
    finally:
        if 'temp_pdf_path' in locals() and os.path.exists(temp_pdf_path):
            os.unlink(temp_pdf_path)
