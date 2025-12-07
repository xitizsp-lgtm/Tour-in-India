import os
import joblib
import numpy as np
import tempfile
import wave
from fastapi import FastAPI, UploadFile, File, HTTPException
try:
    from scipy.io import wavfile
    SCIPY_AVAILABLE = True
except ImportError:
    SCIPY_AVAILABLE = False

app = FastAPI(title="Echoguard API")

# Load model & scaler (look in root project directory)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "svm_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")

try:
    MODEL = joblib.load(MODEL_PATH)
    SCALER = joblib.load(SCALER_PATH)
    print("Model and scaler loaded.")
except Exception as e:
    print(f"Model/scaler load error: {e}")
    MODEL = None
    SCALER = None

ALLOWED_EXT = {"wav"}

def extract_features_from_wav(file_path):
    """Extract basic audio features from WAV file."""
    try:
        with wave.open(file_path, 'rb') as wav_file:
            n_frames = wav_file.getnframes()
            frame_rate = wav_file.getframerate()
            audio_data = wav_file.readframes(n_frames)
        
        # Convert byte data to numpy array
        audio_array = np.frombuffer(audio_data, dtype=np.int16)
        
        # Basic statistical features
        features = np.array([
            np.mean(audio_array),
            np.std(audio_array),
            np.min(audio_array),
            np.max(audio_array),
            np.median(audio_array),
        ])
        
        # Pad or extend to match expected input size (typically 78 for MFCC features)
        expected_size = 78
        if len(features) < expected_size:
            features = np.pad(features, (0, expected_size - len(features)), mode='constant')
        else:
            features = features[:expected_size]
            
        return features.reshape(1, -1)
    except Exception as e:
        print("Feature extraction error:", e)
        return None

@app.get("/health")
def health():
    if MODEL is None or SCALER is None:
        return {"status": "error", "message": "model or scaler not loaded"}
    return {"status": "ok"}

@app.post("/predict")
async def predict(audio_file: UploadFile = File(...)):
    if MODEL is None or SCALER is None:
        raise HTTPException(status_code=500, detail="Model or scaler not loaded on server.")

    filename = audio_file.filename or ""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail=f"Unsupported file type. Allowed: {ALLOWED_EXT}")

    # Save uploaded file into a temporary directory (automatically cleaned up)
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_path = os.path.join(tmpdir, filename)
        with open(tmp_path, "wb") as f:
            f.write(await audio_file.read())

        features = extract_features_from_wav(tmp_path)

    if features is None:
        raise HTTPException(status_code=400, detail="Could not extract features from the audio file.")

    # Scale and predict
    try:
        features_scaled = SCALER.transform(features)
        pred = int(MODEL.predict(features_scaled)[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")

    label = "REAL" if pred == 0 else "FAKE"
    return {"label": pred, "prediction": label}
