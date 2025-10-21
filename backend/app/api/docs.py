from fastapi import APIRouter, UploadFile
from app.services.ingest import extract_text_from_pdf, chunk_text, build_index, save_data

router = APIRouter()

@router.post("/upload")
async def upload_doc(file: UploadFile):
    with open(f"uploads/{file.filename}", "wb") as f:
        f.write(await file.read())
    text = extract_text_from_pdf(f"uploads/{file.filename}")
    chunks = chunk_text(text)
    index, embeddings = build_index(chunks)
    save_data(chunks, embeddings)
    return {"message": "File processed", "chunks": len(chunks)}
