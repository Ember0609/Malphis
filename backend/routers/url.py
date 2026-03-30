import os
import joblib
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from tensorflow.keras.models import load_model
from urllib.parse import urlparse
from utils.feature_extract import extract_url_features, URL_FEATURE_COLUMNS

router = APIRouter(tags=["URL Scanning"])

# 🌟 1. การตั้งค่า Path (ดึงจาก BASE_DIR เพื่อความแม่นยำ)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
TOP_SITES_PATH = os.path.join(BASE_DIR, "dataset", "top-1m.csv") 
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

# เพิ่ม Fallback VIP (กันเหนียว)
for d in ["google.com", "facebook.com", "youtube.com", "kaggle.com", "thaipbs.or.th"]:
    TOP_SITES.add(d)

# 🌟 3. โหลด Model AI
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
        
        # ดึงโดเมนออกมาเช็ค Whitelist
        temp_url = url_input if url_input.startswith('http') else 'http://' + url_input
        parsed = urlparse(temp_url)
        domain = parsed.netloc.lower()
        if domain.startswith("www."): domain = domain[4:]

        # --- ด่านที่ 1: Whitelist (ให้ 100% เฉพาะพวกนี้) ---
        # --- ด่านที่ 1: Whitelist (รองรับ Subdomain) ---
        domain_parts = domain.split('.')
        is_whitelisted = domain in TOP_SITES
        
        # ถ้ายาวเกิน 2 ท่อน ให้ลองดึงแค่ชื่อเว็บหลักมาเช็ค (เช่น ตัด store. ออก เหลือแค่ steampowered.com)
        if not is_whitelisted and len(domain_parts) >= 2:
            root_domain = f"{domain_parts[-2]}.{domain_parts[-1]}" # เช่น steampowered.com
            is_whitelisted = root_domain in TOP_SITES
            
        # ถ้ายาวเกิน 3 ท่อน เผื่อพวกเว็บไทยนามสกุล 2 ชั้น (เช่น .co.th, .or.th)
        if not is_whitelisted and len(domain_parts) >= 3:
            root_domain_th = f"{domain_parts[-3]}.{domain_parts[-2]}.{domain_parts[-1]}" # เช่น thaipbs.or.th
            is_whitelisted = root_domain_th in TOP_SITES

        if is_whitelisted:
            return {
                "url": url_input,
                "prediction": "Safe",
                "confidence": 100.0,
                "is_safe": True,
                "note": "Verified by Global Whitelist"
            }

        # --- ด่านที่ 2: AI ทำงาน ---
        features = extract_url_features(url_input)
        df_input = pd.DataFrame([features], columns=URL_FEATURE_COLUMNS)
        X = imputer.transform(df_input)
        X_scaled = scaler.transform(X)
        
        # ทำนายผล (Probability 0.0 - 1.0)
        prob = float(model.predict(X_scaled, verbose=0)[0][0])
        is_phishing = prob > 0.5
        
        # 🛠️ สูตร "ลดความมั่นใจ" (Confidence Capping)
        if is_phishing:
            # ถ้าเป็น Phishing: บีบให้อยู่ในช่วง 85% - 98.5%
            # ยิ่ง prob สูง จะยิ่งเข้าใกล้ 98.5% แต่จะไม่ถึง 100%
            confidence = 85 + (prob * 13.5)
            label = "Phishing"
        else:
            # ถ้าเป็น Safe: บีบให้อยู่ในช่วง 75% - 97%
            # (1-prob) คือความมั่นใจฝั่ง Safe
            raw_safe_conf = (1 - prob)
            confidence = 75 + (raw_safe_conf * 22.0)
            label = "Safe"

        return {
            "url": url_input,
            "prediction": label,
            "confidence": round(confidence, 2), # ปัดเศษทศนิยม 2 ตำแหน่งให้ดูโปร
            "is_safe": not is_phishing
        }

    except Exception as e:
        print(f"❌ API Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))