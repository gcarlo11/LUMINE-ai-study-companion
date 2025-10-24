from fastapi import APIRouter, Request
from app.services.retrieval import retrieval
import os
import google.generativeai as genai 
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class QuestionRequest(BaseModel):
    question: str

router = APIRouter()

@router.post("/ask")
async def ask_question(data: QuestionRequest, request: Request): 
    
    question = data.question 
    index = getattr(request.app.state, 'index', None)
    chunks = getattr(request.app.state, 'chunks', [])
    
    if index is None or not chunks:
        return {"answer": "Maaf, silakan unggah dokumen PDF terlebih dahulu sebelum bertanya."}

    contexts = retrieval(question, index=index, chunks=chunks) 
    context_text = "\n\n".join(contexts)

    prompt = f"""
    You are a helpful study tutor.
    Use the context below to answer the question accurately.
    Cite the sources if possible.
    **Format your response using clear Markdown:**
    - Use bullet points (-) for lists.
    - Use bold (**) for emphasis on key terms or headings.
    - Ensure proper paragraph spacing for readability.

    Context:
    {context_text}

    Question: {question}
    
    """
    
    gemini_api_key = os.getenv('GEMINI_API_KEY')
    
    if not gemini_api_key:
        print("--- DEBUG: GAGAL! 'GEMINI_API_KEY' tidak ditemukan. ---")
        print("--- DEBUG: Pastikan file .env ada dan server sudah DI-RESTART. ---")
        return {"error": "GEMINI_API_KEY environment variable not set."}

    try:
        genai.configure(api_key=gemini_api_key)

        model = genai.GenerativeModel('gemini-2.5-flash-lite')

        response = model.generate_content(prompt)

        return {"answer": response.text}
            
    except Exception as e:
        print(f"--- DEBUG: Error dari Google AI SDK: {e} ---")
        return {"error": f"API request failed: {e}"}
