from fastapi import APIRouter
from app.services.retrieval_service import retrieval_relevant_chunks
import os, requests

router = APIRouter()

@router.post("/ask")
async def ask_question(data: dict):
    question = data["question"]
    contexts = retrieval_relevant_chunks(question)
    context_text = "\n\n".join(contexts)

    prompt = f"""
    You are a helpful study tutor.
    Use the contect belowto answer the question accurately.
    Cute the sources if possible.

    Context:
    {context_text}

    Question: {question}
    """

    response = requests.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateText",
        headers={"Authorization": f"Bearer {os.getenv('GEMINI_API_KEY')}"},
        json={"prompt": {"text": prompt}}
    )

    result = response.json()
    return {"answer": result.get["candidates"][0]["output"]}
    result = response.json()
    return {"answer": result["candidates"][0]["output"]}

