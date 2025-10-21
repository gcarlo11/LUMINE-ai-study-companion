from fastapi import FastAPI
from app.api import docs

app = FastAPI()
app.include_router(docs.router, prefix="/docs")
