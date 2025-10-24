from fastapi import FastAPI
from app.api import docs, chat

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

app.include_router(docs.router, prefix="/docs", tags=["Docs"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])