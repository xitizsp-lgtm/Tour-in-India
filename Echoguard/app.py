import os
import joblib
import numpy as np
import librosa
from flask import Flask, request, render_template, redirect, url_for
from werkzeug.utils import secure_filename # Used to sanitize uploaded filenames

# --- Configuration ---
app = Flask(__name__)
# The folder where uploaded files will be temporarily stored
app.config['UPLOAD_FOLDER'] = 'uploads' 
# Allowed file extensions for security
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'flac'}

# Ensure the upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True) 

# --- Model and Scaler Loading ---
# Load the saved model and scaler immediately when the app starts
try:
    MODEL = joblib.load('svm_model.pkl')
    SCALER = joblib.load('scaler.pkl')
    print("Model and Scaler loaded successfully.")
except Exception as e:
    # This prevents the app from crashing if the files aren't found
    print(f"Error loading model or scaler: {e}")
    MODEL = None
    SCALER = None

# --- Helper Function to Check File Type ---
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- Feature Extraction Function (Crucial for live prediction) ---
def extract_features(file_path, n_mfcc=13):
    """Loads audio and extracts aggregated MFCC, Delta, and Delta-Delta features."""
    try:
        # NOTE: Use the SAME sample rate (e.g., 16000) that you used 
        # for training to ensure consistency.
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
        
        # Reshape the vector from (78,) to (1, 78) for scikit-learn's predict method
        return final_vector.reshape(1, -1) 

    except Exception as e:
        print(f"Error extracting features: {e}") 
        return None

# --- Flask Routes (The URLs of the application) ---

@app.route('/', methods=['GET'])
def index():
    """Renders the main upload form (index.html)."""
    # The 'prediction' variable is passed to the HTML template
    return render_template('index.html', prediction=None)

@app.route('/predict', methods=['POST'])
def predict():
    """Handles the audio file upload, processes it, and returns the prediction."""
    
    # 1. Safety Checks
    if MODEL is None or SCALER is None:
        return render_template('index.html', prediction="ERROR: Model or Scaler not loaded. Check server logs.", result_class='error')

    if 'audio_file' not in request.files:
        return render_template('index.html', prediction="No file part in the request.", result_class='error')

    audio_file = request.files['audio_file']
    if audio_file.filename == '' or not allowed_file(audio_file.filename):
        return render_template('index.html', prediction="Invalid or missing file. Only WAV, MP3, FLAC are supported.", result_class='error')

    # 2. Save the file temporarily
    filename = secure_filename(audio_file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    audio_file.save(filepath)

    # 3. Extract features
    features = extract_features(filepath)
    
    # 4. Clean up and check features
    os.remove(filepath) # Delete the temporary file immediately after processing

    if features is None:
        return render_template('index.html', prediction="Error: Could not process audio file.", result_class='error')

    # 5. Scale and Predict
    # NOTE: We use SCALER.transform, NOT SCALER.fit_transform!
    features_scaled = SCALER.transform(features)
    prediction = MODEL.predict(features_scaled)[0]
    
    # 6. Format Output
    if prediction == 0:
        result_text = "✅ REAL Call Detected - Safe"
        result_class = 'real'
    else:
        result_text = "🚨 FAKE/Deepfake Call Detected - CAUTION!"
        result_class = 'fake'
        
    return render_template('index.html', prediction=result_text, result_class=result_class)

# --- Start the Application ---
if __name__ == '__main__':
    # Running in debug mode helps show errors during development
    app.run(debug=True)