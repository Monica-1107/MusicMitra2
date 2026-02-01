# backend/demucs_server.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
import shutil
import uuid
import numpy as np
import torch
from demucs.pretrained import get_model
from demucs.apply import apply_model
import librosa
import soundfile as sf
from contextlib import asynccontextmanager

# Lifespan handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global model
    print("Loading Demucs model...")
    model = get_model('htdemucs')
    model.eval()
    if torch.cuda.is_available():
        model.cuda()
        print("Using CUDA")
    else:
        print("Using CPU")
    print("Model loaded successfully!")
    yield
    # Shutdown
    if torch.cuda.is_available():
        torch.cuda.empty_cache()

app = FastAPI(lifespan=lifespan)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "separated"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

def ensure_stereo(audio, sample_rate):
    """Convert audio to stereo if needed"""
    if len(audio.shape) == 1:
        return np.stack([audio, audio])
    elif audio.shape[0] > 2:
        return audio[:2]  # Take first two channels if more than 2
    return audio

def load_audio(file_path, target_sr=44100):
    """Load and preprocess audio file"""
    try:
        # Load with librosa
        wav, sr = librosa.load(file_path, sr=target_sr, mono=False)
        
        # Ensure proper sample rate
        if sr != target_sr:
            wav = librosa.resample(wav, orig_sr=sr, target_sr=target_sr)
            sr = target_sr
            
        # Ensure stereo
        wav = ensure_stereo(wav, sr)
        
        # Normalize
        wav = wav / max(1.0, np.max(np.abs(wav)))
        
        return torch.from_numpy(wav).float(), sr
        
    except Exception as e:
        raise RuntimeError(f"Error loading audio: {str(e)}")

def separate_tracks(model, mix, device='cpu'):
    """Separate audio tracks using the model"""
    with torch.no_grad():
        # Add batch dimension and move to device
        mix = mix.unsqueeze(0).to(device)
        
        # Use apply_model instead of calling the model directly
        sources = apply_model(model, mix, device=device)[0]
        
        # Get non-vocal sources
        vocal_idx = model.sources.index('vocals')
        sources = [sources[i] for i in range(len(sources)) if i != vocal_idx]
        return sum(sources)  # Sum all non-vocal sources

@app.post("/convert")
async def convert_song(file: UploadFile = File(...)):
    if not model:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Create unique directory for this request
        unique_id = str(uuid.uuid4())
        os.makedirs(os.path.join(OUTPUT_DIR, unique_id), exist_ok=True)
        
        # Save uploaded file
        input_path = os.path.join(UPLOAD_DIR, f"{unique_id}_{file.filename}")
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process audio
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        mix, sr = load_audio(input_path)
        
        # Move model to device if not already there
        if next(model.parameters()).device != device:
            model.to(device)
            
        # Separate tracks
        instrumental = separate_tracks(model, mix, device)
        
        # Save output
        output_path = os.path.join(OUTPUT_DIR, unique_id, f"instrumental_{file.filename}")
        sf.write(output_path, instrumental.cpu().numpy().T, sr)
        
        if not os.path.exists(output_path):
            raise RuntimeError("Failed to save output file")
            
        return FileResponse(
            output_path,
            media_type='audio/wav',
            filename=f"instrumental_{file.filename}"
        )
        
    except Exception as e:
        error_msg = f"Error processing audio: {str(e)}"
        print(error_msg)
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_msg)
    finally:
        # Cleanup
        if 'input_path' in locals() and os.path.exists(input_path):
            os.remove(input_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)