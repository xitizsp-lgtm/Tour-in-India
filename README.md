# Echoguard API - Audio Deepfake Detection

A FastAPI-based audio deepfake detection service that uses machine learning to identify whether audio is real or AI-generated.

## 🚀 Deploy to Railway

### Prerequisites
- Railway account (sign up at [railway.app](https://railway.app))
- Git repository (push your code to GitHub/GitLab)

### Deployment Steps

#### Option 1: Deploy via Railway Dashboard (Easiest)

1. **Go to [railway.app](https://railway.app) and login**

2. **Click "New Project" → "Deploy from GitHub repo"**

3. **Select this repository**

4. **Railway will automatically:**
   - Detect your Python app
   - Install dependencies from `requirements.txt`
   - Run the start command from `railway.json`
   - Provide a public URL

5. **That's it!** Your API will be live in ~5 minutes

#### Option 2: Deploy via Railway CLI

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   # or
   brew install railway
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Initialize and deploy:**
   ```bash
   cd /Users/akshaykale/projects/kshitij/Tour-in-India
   railway init
   railway up
   ```

4. **Get your deployment URL:**
   ```bash
   railway domain
   ```

### Environment Variables (Optional)

No environment variables are required for basic operation.

## 📡 API Endpoints

Once deployed, your API will have:

- **GET /** - Health check
  ```
  https://your-app.railway.app/
  ```

- **POST /predict** - Predict if audio is real or fake
  ```bash
  curl -X POST "https://your-app.railway.app/predict" \
    -H "Content-Type: multipart/form-data" \
    -F "audio_file=@your_audio.wav"
  ```

- **GET /docs** - Interactive API documentation
  ```
  https://your-app.railway.app/docs
  ```

## 🧪 Testing Locally

1. **Create virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the server:**
   ```bash
   uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Test the API:**
   ```bash
   curl http://localhost:8000/
   ```

## 📝 API Response Format

### Successful Prediction
```json
{
  "filename": "audio.wav",
  "prediction": "FAKE",
  "confidence": 0.169,
  "raw_prediction": 0
}
```

- **prediction:** "REAL" or "FAKE"
- **confidence:** Model confidence score (higher = more confident)
- **raw_prediction:** 0 (fake) or 1 (real)

### Error Response
```json
{
  "detail": "Error message here"
}
```

## ⚙️ Technical Details

- **Framework:** FastAPI
- **ML Model:** SVM (Support Vector Machine)
- **Feature Extraction:** MFCC (Mel-frequency cepstral coefficients) with Delta and Delta-Delta
- **Features:** 78 (13 MFCCs × 3 types × 2 statistics)
- **Audio Format:** WAV files only

## 🔧 Project Structure

```
.
├── app.py                  # Main FastAPI application
├── svm_model.pkl          # Trained SVM model
├── scaler.pkl             # Feature scaler
├── requirements.txt       # Python dependencies
├── railway.json           # Railway configuration
├── Procfile              # Process file for deployment
├── runtime.txt           # Python version
└── README.md             # This file
```

## 📊 Model Information

The model is trained to detect audio deepfakes using:
- **MFCC features:** 13 coefficients
- **Delta features:** First-order differences
- **Delta-Delta features:** Second-order differences
- **Statistics:** Mean and standard deviation aggregation

This results in 78 features per audio file: (13 × 3 × 2 = 78)

## 🐛 Troubleshooting

### Deployment Issues

1. **Build fails:** Check that all files (especially `.pkl` files) are committed to git
2. **Module not found:** Ensure `requirements.txt` includes all dependencies
3. **Port issues:** Railway automatically provides `$PORT` environment variable

### Local Issues

1. **librosa not found:** Install with `pip install librosa`
2. **Model not loaded:** Ensure `svm_model.pkl` and `scaler.pkl` are in the project root
3. **WAV file error:** Only WAV format is supported. Convert MP3 using:
   ```bash
   afconvert -f WAVE -d LEI16 input.mp3 output.wav
   ```

## 📚 Documentation

- **Live API Docs:** Visit `/docs` on your deployed URL
- **OpenAPI Spec:** Visit `/openapi.json` on your deployed URL

## 🎯 Usage Example

```python
import requests

url = "https://your-app.railway.app/predict"
files = {"audio_file": open("audio.wav", "rb")}

response = requests.post(url, files=files)
result = response.json()

print(f"Prediction: {result['prediction']}")
print(f"Confidence: {result['confidence']}")
```

## 📄 License

[Add your license here]

## 👥 Contributors

[Add contributors here]

---

Built with ❤️ using FastAPI and Railway

