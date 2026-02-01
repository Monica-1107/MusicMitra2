from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from routes.chat import router as chat_router

app = FastAPI(title="MusicMitra API")

# Update allow_origins to match frontend port
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)

@app.get("/")
def root():
    return {"status": "MusicMitra backend running"}
