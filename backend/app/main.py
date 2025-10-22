from fastapi import FastAPI
from app.api import docs, chat 
app = FastAPI()


app.include_router(docs.router, prefix="/docs", tags=["Docs"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])