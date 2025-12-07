import os
import joblib
import numpy as np
import tempfile
import wave
import librosa
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
try:
    from scipy.io import wavfile
    SCIPY_AVAILABLE = True
except ImportError:
    SCIPY_AVAILABLE = False

app = FastAPI(title="Echoguard API")

# Add CORS middleware for Vercel deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model & scaler (look in root project directory)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
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

def extract_features_from_wav(file_path, n_mfcc=13):
    """Loads audio and extracts aggregated MFCC, Delta, and Delta-Delta features."""
    try:
        # Load audio at 16kHz sample rate (same as training)
        y, sr = librosa.load(file_path, sr=16000, mono=True)
        
        # 1. MFCCs
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=n_mfcc)
        
        # 2. Delta and Delta-Delta
        mfccs_delta = librosa.feature.delta(mfccs)
        mfccs_delta2 = librosa.feature.delta(mfccs, order=2)
        
        # Combine all features
        combined_features = np.vstack([mfccs, mfccs_delta, mfccs_delta2])
        
        # Aggregate: Calculate Mean and Standard Deviation (3 * 13 * 2 = 78 features)
        mean_features = np.mean(combined_features, axis=1)
        std_features = np.std(combined_features, axis=1)
        
        final_vector = np.hstack([mean_features, std_features])
        
        return final_vector
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing audio: {str(e)}")

@app.get("/")
async def root():
    """Health check endpoint."""
    model_status = "loaded" if MODEL is not None else "not loaded"
    return {
        "message": "Echoguard API is running",
        "model_status": model_status,
        "model_path": MODEL_PATH,
        "scaler_path": SCALER_PATH
    }

@app.post("/predict")
async def predict(audio_file: UploadFile = File(...)):
    """
    Predict if audio is REAL or FAKE.
    """
    if MODEL is None or SCALER is None:
        raise HTTPException(
            status_code=503,
            detail="Model not available. Please ensure svm_model.pkl and scaler.pkl are in the root directory."
        )
    
    # Validate file extension
    file_ext = audio_file.filename.split('.')[-1].lower()
    if file_ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail=f"File type .{file_ext} not allowed. Use .wav")
    
    # Save uploaded file to temp location
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
        temp_path = temp_file.name
        contents = await audio_file.read()
        temp_file.write(contents)
    
    try:
        # Extract features
        features = extract_features_from_wav(temp_path)
        features = features.reshape(1, -1)
        
        # Scale features
        features_scaled = SCALER.transform(features)
        
        # Predict
        prediction = MODEL.predict(features_scaled)[0]
        probability = MODEL.decision_function(features_scaled)[0]
        
        # Determine label
        label = "REAL" if prediction == 1 else "FAKE"
        confidence = abs(probability)
        
        return {
            "filename": audio_file.filename,
            "prediction": label,
            "confidence": float(confidence),
            "raw_prediction": int(prediction)
        }
    
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
