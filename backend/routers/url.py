import os
import joblib
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from tensorflow.keras.models import load_model
from urllib.parse import urlparse
from utils.feature_extract import extract_url_features, URL_FEATURE_COLUMNS

router = APIRouter(tags=["URL Scanning"])

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
TOP_SITES_PATH = os.path.join(BASE_DIR, "dataset", "1m-example.csv") 
MODEL_DIR = os.path.join(BASE_DIR, "models")

# 🌟 2. โหลดระบบ Whitelist
TOP_SITES = set()
def load_top_sites():
    if not os.path.exists(TOP_SITES_PATH):
        print(f"❌ Warning: Top Sites file not found at {TOP_SITES_PATH}")
        return
    try:
        with open(TOP_SITES_PATH, 'r', encoding='utf-8') as f:
            for line in f:
                parts = line.strip().split(',')
                if len(parts) >= 2:
                    TOP_SITES.add(parts[1].strip().lower())
        print(f"✅ Loaded {len(TOP_SITES):,} trusted domains.")
    except Exception as e:
        print(f"❌ Error loading Whitelist: {e}")

load_top_sites()

#โหลด Model AI
try:
    model = load_model(os.path.join(MODEL_DIR, 'url_nn_model.keras'))
    scaler = joblib.load(os.path.join(MODEL_DIR, 'url_scaler.pkl'))
    imputer = joblib.load(os.path.join(MODEL_DIR, 'url_imputer.pkl'))
    print("✅ URL Models Loaded Successfully!")
except Exception as e:
    print(f"❌ Error loading models: {e}")

class URLRequest(BaseModel):
    url: str

@router.post("/predict")
async def predict_url(request: URLRequest):
    try:
        url_input = request.url.strip()
        
        temp_url = url_input if url_input.startswith('http') else 'http://' + url_input
        parsed = urlparse(temp_url)
        domain = parsed.netloc.lower()
        if domain.startswith("www."): domain = domain[4:]
        if domain in TOP_SITES:
            return {
                "url": url_input,
                "prediction": "Safe",
                "confidence": 100.0,
                "is_safe": True,
                "note": "Verified by Global Whitelist"
            }
        features = extract_url_features(url_input)
        df_input = pd.DataFrame([features], columns=URL_FEATURE_COLUMNS)
        X = imputer.transform(df_input)
        X_scaled = scaler.transform(X)
        
        prob = float(model.predict(X_scaled, verbose=0)[0][0])
        is_phishing = prob > 0.5
        
        if is_phishing:
            confidence = 85 + (prob * 13.5)
            label = "Phishing"
        else:
            raw_safe_conf = (1 - prob)
            confidence = 75 + (raw_safe_conf * 22.0)
            label = "Safe"

        return {
            "url": url_input,
            "prediction": label,
            "confidence": round(confidence, 2),
            "is_safe": not is_phishing
        }

    except Exception as e:
        print(f"❌ API Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))