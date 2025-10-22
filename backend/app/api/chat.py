from fastapi import APIRouter
from app.services.retrieval import retrieval 
import os, requests

router = APIRouter()

@router.post("/ask")
async def ask_question(data: dict):
    question = data["question"]
    contexts = retrieval(question) 
    context_text = "\n\n".join(contexts)

    prompt = f"""
    You are a helpful study tutor.
    Use the contect belowto answer the question accurately.
    Cite the sources if possible.

    Context:
    {context_text}

    Question: {question}
    """

    gemini_api_key = os.getenv('GEMINI_API_KEY')
    if not gemini_api_key:
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
            return {"error": "No valid response from Gemini.", "details": result}
            
    except requests.exceptions.RequestException as e:
        return {"error": f"API request failed: {e}"}
    except KeyError:
        return {"error": "Invalid response structure from Gemini API.", "details": result}