import os
import joblib
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import gc
# โหลด TFLite Runtime แบบกิน RAM ต่ำ (ถ้ามี) ถ้าไม่มีค่อยหาตัวเต็ม
try:
    import tflite_runtime.interpreter as tflite
except ImportError:
    from tensorflow import lite as tflite
from urllib.parse import urlparse
from utils.feature_extract import extract_url_features, URL_FEATURE_COLUMNS

router = APIRouter(tags=["URL Scanning"])

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
TOP_SITES_PATH = os.path.join(BASE_DIR, "dataset", "top-1m.csv") 
MODEL_DIR = os.path.join(BASE_DIR, "models")

TOP_SITES = set()
def load_top_sites():
    if not os.path.exists(TOP_SITES_PATH):
        print(f"❌ Warning: Top Sites file not found at {TOP_SITES_PATH}")
        return
    try:
        max_domains = 100000  # LIMIT: อ่านแค่ 100,000 เว็บหลักเพื่อประหยัด RAM (ลดไปได้เกือบ 100MB)
        count = 0
        with open(TOP_SITES_PATH, 'r', encoding='utf-8') as f:
            for line in f:
                parts = line.strip().split(',')
                if len(parts) >= 2:
                    TOP_SITES.add(parts[1].strip().lower())
                    count += 1
                    if count >= max_domains:
                        break
        print(f"✅ Loaded {len(TOP_SITES):,} trusted domains (Memory Optimized).")
    except Exception as e:
        print(f"❌ Error loading Whitelist: {e}")

load_top_sites()

for d in ["google.com", "facebook.com", "youtube.com", "kaggle.com", "thaipbs.or.th"]:
    TOP_SITES.add(d)

# 🌟 3. โหลด Model AI
try:
    interpreter = tflite.Interpreter(model_path=os.path.join(MODEL_DIR, 'url_nn_model.tflite'))
    interpreter.allocate_tensors()
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    scaler = joblib.load(os.path.join(MODEL_DIR, 'url_scaler.pkl'))
    imputer = joblib.load(os.path.join(MODEL_DIR, 'url_imputer.pkl'))
    print("✅ URL Models (TFLite) Loaded Successfully!")
    
    # คืนพื้นที่ RAM ที่ใช้ตอนโหลดไฟล์ให้ระบบ
    gc.collect()
except Exception as e:
    print(f"❌ Error loading models: {e}")

class URLRequest(BaseModel):
    url: str

@router.post("/predict")
async def predict_url(request: URLRequest):
    try:
        url_input = request.url.strip()
        
        # ดึงโดเมนออกมาเช็ค Whitelist
        temp_url = url_input if url_input.startswith('http') else 'http://' + url_input
        parsed = urlparse(temp_url)
        domain = parsed.netloc.lower()
        if domain.startswith("www."): domain = domain[4:]

        domain_parts = domain.split('.')
        is_whitelisted = domain in TOP_SITES
        
        if not is_whitelisted and len(domain_parts) >= 2:
            root_domain = f"{domain_parts[-2]}.{domain_parts[-1]}"
            is_whitelisted = root_domain in TOP_SITES
            
        if not is_whitelisted and len(domain_parts) >= 3:
            root_domain_th = f"{domain_parts[-3]}.{domain_parts[-2]}.{domain_parts[-1]}"
            is_whitelisted = root_domain_th in TOP_SITES

        if is_whitelisted:
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
        
        X_scaled_float32 = X_scaled.astype('float32')
        interpreter.set_tensor(input_details[0]['index'], X_scaled_float32)
        interpreter.invoke()
        
        prob = float(interpreter.get_tensor(output_details[0]['index'])[0][0])
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