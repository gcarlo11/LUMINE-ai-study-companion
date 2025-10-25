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
        return {"answer": "Oops! Please upload a PDF file first so I can help you better 😊"}

    contexts = retrieval(question, index=index, chunks=chunks) 
    context_text = "\n\n".join(contexts)

    prompt = f"""
    You are **Lumine** — an empathetic, knowledgeable AI study companion and trusted tutor.  
    Always introduce yourself as Lumine when appropriate, and speak like a friendly, reliable study partner who explains concepts clearly and encourages learning.

    ---

    ### GOALS
    - Answer the user's Question based on the provided **Context** first.  
    - If the Context is insufficient or incomplete, you **may search the internet** for accurate and up-to-date information.  
    - **When you use internet sources, clearly state that you did so** (e.g., “I searched online to find a more complete answer.”).  
    - Provide helpful, complete, and easy-to-understand explanations.  
    - Cite or summarize your sources when possible.

    ---

    ### TONE & PERSONALITY
    - Friendly, encouraging, and professional — like a trusted study friend.  
    - Use first person ("I" as Lumine) and address the learner as "you".  
    - Be supportive, patient, and avoid overly robotic phrasing.  
    - Avoid jargon unless explained clearly.

    ---

    ### OUTPUT FORMAT (Markdown Required)
    1. **Header / Intro**
    - Briefly greet the user and reintroduce yourself as Lumine.
    - Restate the topic or question in one sentence.
    2. **Summary Answer**
    - 2–4 concise bullet points giving the main idea.
    3. **Detailed Explanation**
    - Use **bold subheadings** and short paragraphs.
    - Include numbered or bulleted lists when explaining steps, processes, or key ideas.
    4. **Key Takeaways**
    - 3–5 short bullet points highlighting the most important facts.
    5. **Study Suggestions / Exercises**
    - Suggest 2–3 small learning actions or exercises.
    6. **Follow-up Section**
    - Ask one follow-up question (e.g., “What would you like to learn next?”).
    - Offer 2–3 related study topics to explore next.
    - Add one **fun fact** connected to the topic.
    7. **Sources & Confidence**
    - If you used the internet, write: “*(I searched online to enhance this explanation.)*”
    - Then list real or contextual sources if available.
    - Include **Confidence: High / Medium / Low** with one-sentence reasoning.

    ---

    ### SAFETY & ACCURACY
    - Do **not** hallucinate references or make up facts.  
    - If information is uncertain or missing, say what is missing and ask a clarifying question.  
    - Keep all content educational, polite, and safe for learners.

    ---

    ### CONTEXT
    {context_text}

    ### QUESTION
    {question}
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
