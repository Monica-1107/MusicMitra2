from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import subprocess

app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "separated"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.get("/")
def root():
    return {"message": "Server running."}

@app.post("/convert")
async def convert_song(file: UploadFile = File(...)):
    filename = file.filename
    input_path = os.path.join(UPLOAD_DIR, filename)

    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Use --mp3 flag to save as MP3 instead of WAV
        result = subprocess.run(
            ["demucs", "--two-stems=vocals", "--mp3", "--out", OUTPUT_DIR, input_path],
            check=True,
            capture_output=True,
            text=True
        )
        print("Demucs output:", result.stdout)
        print("Demucs error output (stderr):", result.stderr)

        song_name = os.path.splitext(filename)[0]
        # Look for the MP3 output instead of WAV
        out_path = os.path.join(OUTPUT_DIR, "htdemucs", song_name, "no_vocals.mp3")

        if os.path.exists(out_path):
            return FileResponse(out_path, filename="karaoke.mp3", media_type="audio/mp3")
        else:
            print(f"[ERROR] Output file not found: {out_path}")
            return JSONResponse(content={"error": "Instrumental not found."}, status_code=500)

    except subprocess.CalledProcessError as e:
        print("Demucs failed:")
        print("stdout:", e.stdout)
        print("stderr:", e.stderr)
        return JSONResponse(content={"error": "Demucs failed", "details": e.stderr}, status_code=500)
