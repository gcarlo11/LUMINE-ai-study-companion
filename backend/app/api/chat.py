from fastapi import APIRouter, Request
from app.services.retrieval import retrieval
import os, requests
from pydantic import BaseModel

class QuestionRequest(BaseModel):
    question: str

router = APIRouter()

@router.post("/ask")
async def ask_question(data: QuestionRequest, request: Request): 
    
    question = data.question 
    index = request.app.state.index
    chunks = request.app.state.chunks
    
    contexts = retrieval(question, index=index, chunks=chunks) 
    context_text = "\n\n".join(contexts)

    prompt = f"""
    You are a helpful study tutor.
    Use the context below to answer the question accurately.
    Cite the sources if possible.

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
        response = requests.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateText",
            params={"key": gemini_api_key},
            json={"prompt": {"text": prompt}}
        )

        response.raise_for_status() 
        result = response.json()
        
        if "candidates" in result and len(result["candidates"]) > 0:
            return {"answer": result["candidates"][0]["output"]}
        else:
            print("--- DEBUG: Respons tidak valid dari Gemini ---")
            print(result)
            return {"error": "No valid response from Gemini.", "details": result}
            
    except requests.exceptions.RequestException as e:
        print(f"--- DEBUG: Error request ke Gemini (API Key salah/belum aktif?): {e} ---")
        return {"error": f"API request failed: {e}"}
    except KeyError:
        print(f"--- DEBUG: KeyError saat memproses respons Gemini ---")
        return {"error": "Invalid response structure from Gemini API.", "details": result}