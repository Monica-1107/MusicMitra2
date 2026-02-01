# backend/routes/audio.py
from fastapi import APIRouter, Response
import requests

router = APIRouter()

@router.get("/audio")
def get_audio(url: str):
    try:
        r = requests.get(url, stream=True)
        return Response(r.content, media_type="audio/mpeg")
    except Exception as e:
        return {"error": str(e)}
