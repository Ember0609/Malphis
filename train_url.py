import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout

# 🌟 นำเข้าฟังก์ชันสกัดฟีเจอร์ของเรา
from backend.utils.feature_extract import extract_url_features, URL_FEATURE_COLUMNS

# สร้างโฟลเดอร์ models เตรียมไว้ (ถ้ายังไม่มี)
if not os.path.exists('models'): 
    os.makedirs('models')

# ==========================================
# 🛑 STEP 1: โหลดข้อมูล & สกัดฟีเจอร์ (Feature Extraction)
# ==========================================
print("1. กำลังอ่านไฟล์ new.csv...")
df_raw = pd.read_csv('dataset/Url.csv')
print(f"   -> พบลิงก์ทั้งหมด {len(df_raw)} แถว")

print("2. กำลังแปลง URL เป็นตัวเลข 62 คอลัมน์ (อาจใช้เวลาสักครู่)...")
extracted_features = []

for index, row in df_raw.iterrows():
    url_str = str(row['url'])
    # โยนลิงก์ดิบเข้าฟังก์ชัน
    features = extract_url_features(url_str)
    extracted_features.append(features)

# แปลงเป็นตาราง และบังคับเรียงคอลัมน์ให้ตรงเป๊ะ
X = pd.DataFrame(extracted_features)
X = X.reindex(columns=URL_FEATURE_COLUMNS)

# ดึงเฉลยออกมา
y = df_raw['label']
print(f"   -> สกัดสำเร็จ! ได้ฟีเจอร์ {X.shape[1]} คอลัมน์ที่สะอาดหมดจด")

# ==========================================
# 🛑 STEP 2: เตรียมข้อมูลให้ AI (Data Preprocessing)
# ==========================================
print("3. Data Preprocessing (Impute & Scale)...")
# จัดการค่าว่าง (เช่น พวก web_ ที่เป็น NaN ให้กลายเป็นค่ากลาง)
imputer = SimpleImputer(strategy='median')
X_imputed = imputer.fit_transform(X)

# แบ่งข้อมูล เทรน 80% / ทดสอบ 20%
X_train, X_test, y_train, y_test = train_test_split(X_imputed, y, test_size=0.2, random_state=42)

# ทำ Scaling (ปรับตัวเลขให้อยู่ในสเกลเดียวกัน)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# ==========================================
# 🛑 STEP 3: สร้างและเทรน Neural Network (Model Training)
# ==========================================
print("4. สร้าง Neural Network...")
model = Sequential()
model.add(Dense(128, input_dim=X_train_scaled.shape[1], activation='relu'))
model.add(Dropout(0.3))
model.add(Dense(64, activation='relu'))
model.add(Dropout(0.3))
model.add(Dense(1, activation='sigmoid')) 

model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])

print("5. เริ่มฝึกสมอง AI...")
history = model.fit(
    X_train_scaled, 
    y_train, 
    epochs=10, 
    batch_size=32, 
    validation_split=0.2, 
    verbose=1 
)

print("\n6. ประเมินผลความแม่นยำ...")
loss, accuracy = model.evaluate(X_test_scaled, y_test)
print(f"🎯 Accuracy: {accuracy * 100:.2f}%")

# ==========================================
# 🛑 STEP 4: บันทึกของทุกอย่างเตรียมขึ้น FastAPI
# ==========================================
print("7. บันทึกโมเดลและเครื่องมือต่างๆ...")
model.save('models/url_nn_model.keras') 
joblib.dump(scaler, 'models/url_scaler.pkl')
joblib.dump(imputer, 'models/url_imputer.pkl')

print("✅ จบกระบวนการ! โมเดลพร้อมใช้งานที่หน้าเว็บแล้วครับ!")